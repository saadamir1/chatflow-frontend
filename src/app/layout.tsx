'use client';

import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '../contexts/AuthContext';
import client from '../lib/apollo-client';
import "./globals.css";
import { ToastProvider, GlobalToastEvents } from "../components/common/ToastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ApolloProvider client={client}>
          <AuthProvider>
            <ToastProvider>
              <GlobalToastEvents />
              {children}
            </ToastProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}