import Link from 'next/link';
import { motion } from 'framer-motion';

export const Logo = () => {
  return (
    <Link href="/">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-2"
      >
        <span className="text-2xl font-bold text-blue-600">
          TicTacToe
        </span>
      </motion.div>
    </Link>
  );
};