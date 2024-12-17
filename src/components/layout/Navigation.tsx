import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FiLogOut } from 'react-icons/fi';
import { ADMIN_EMAIL } from '@/lib/adminAuth';
import { FaCog } from 'react-icons/fa';

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

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
          {/* Logo and main navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
              TicTacToe
            </Link>
            {user && (
              <>
                <Link href="/play" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">
                  Play
                </Link>
                <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">
                  Leaderboard
                </Link>
              </>
            )}
          </div>

          {/* Auth buttons or user menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">
                  Profile
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 dark:text-gray-300 hover:text-purple-500">
                    <FaCog className="w-5 h-5" />
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};