import LoginForm from '../components/auth/LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChatFlow</h1>
          <p className="text-gray-600">Team collaboration made simple</p>
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Need an account?</p>
          <div className="space-y-2">
            <a href="/register" className="block text-blue-600 hover:text-blue-500 text-sm">
              Register New Account
            </a>
            <a href="/admin-bootstrap" className="block text-blue-600 hover:text-blue-500 text-sm">
              Bootstrap Admin (if needed)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}