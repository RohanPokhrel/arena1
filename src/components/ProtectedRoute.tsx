import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ADMIN_EMAIL } from '@/lib/adminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (requireAdmin && user.email !== ADMIN_EMAIL) {
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, requireAdmin]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return <>{children}</>;
} 