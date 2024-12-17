import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Navigation } from './Navigation';

export const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-sm z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-blue-600 transition-colors">
          TicTacToe
        </Link>
        <div className="flex items-center space-x-4">
          <Navigation />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};