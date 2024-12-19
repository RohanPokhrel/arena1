import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setupAdminAccount } from '@/lib/adminAuth';
import { ThemeProvider } from 'next-themes';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import { WalletProvider } from '@/contexts/WalletContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from 'react-hot-toast';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const setupAdmin = async () => {
      try {
        setIsLoading(true);
        await setupAdminAccount();
        console.log('Admin setup completed successfully');
      } catch (error) {
        console.error('Failed to setup admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupAdmin();

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const protectedRoutes = ['/play', '/profile', '/wallet', '/admin'];
      const isProtectedRoute = protectedRoutes.some(route => router.pathname.startsWith(route));
      
      if (!user && isProtectedRoute) {
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Public pages that don't need the layout wrapper
  const publicPages = ['/', '/auth/login', '/auth/signup', '/404'];
  const isPublicPage = publicPages.includes(router.pathname);

  return (
    <AuthProvider>
      <ChatProvider>
        <WalletProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            <Toaster
              toastOptions={{
                className: '',
                style: {
                  border: '1px solid #713200',
                  padding: '16px',
                  color: '#713200',
                },
                success: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#059669',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
            {isPublicPage ? (
              <Component {...pageProps} />
            ) : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </ThemeProvider>
        </WalletProvider>
      </ChatProvider>
    </AuthProvider>
  );
}