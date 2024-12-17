import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_EMAIL } from '@/lib/adminAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiLogOut } from 'react-icons/fi';
import { FaCog } from 'react-icons/fa';
import { useState } from 'react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-4">
            <NavLinks />
            {user && isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <FaCog className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            {user && !isAdmin && (
              <>
                <Link 
                  href="/profile" 
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                >
                  Profile
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </Button>
              </>
            )}
            {!user && (
              <Link href="/auth/login">
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};