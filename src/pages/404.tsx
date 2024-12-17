import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg" className="px-8">
              Go Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}