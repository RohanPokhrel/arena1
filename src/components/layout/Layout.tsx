import { useRouter } from 'next/router';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Navbar } from './Navbar/Navbar';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If auth is still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user and trying to access protected route, redirect to login
  if (!user && !router.pathname.startsWith('/auth/')) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}