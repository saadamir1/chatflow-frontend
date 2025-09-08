'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  // Show toast if user is not logged in and redirect to login page
  useEffect(() => { 
    if (!loading && requireAuth && !isLoggedIn) {
      try { window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'info', message: 'Please sign in to continue' } })); } catch {}
      router.push('/');
    }
  }, [isLoggedIn, loading, requireAuth, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not logged in, don't render children
  if (requireAuth && !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}