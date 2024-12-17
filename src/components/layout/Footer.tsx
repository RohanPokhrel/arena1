import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { useRouter } from 'next/router';

export const Footer = () => {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');
  let isCollapsed = false;
  
  try {
    if (isAdminPage) {
      const { isCollapsed: sidebarState } = useAdminSidebar();
      isCollapsed = sidebarState;
    }
  } catch (error) {
    // If context is not available, use default value
  }

  const footerContent = (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand and Description */}
        <div className="space-y-4">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
            TicTacToe
          </Link>
          <p className="text-gray-600 dark:text-gray-400">
            Experience the classic game reimagined with modern technology and real-time multiplayer.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/play" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
                Play Now
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Connect With Us</h3>
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
              <FaGithub className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
              <FaTwitter className="w-6 h-6" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400">
              <FaDiscord className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} TicTacToe. All rights reserved.</p>
      </div>
    </div>
  );

  if (isAdminPage) {
    return (
      <motion.footer 
        className="bg-white dark:bg-gray-900 shadow-sm mt-auto"
        initial={{ marginLeft: 256 }}
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
      >
        {footerContent}
      </motion.footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-gray-900 shadow-sm mt-auto">
      {footerContent}
    </footer>
  );
};
