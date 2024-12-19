import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

export function Profile() {
  const { balance, totalDeposited, totalWithdrawn } = useWallet();
  const { user, signOut } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
          {user?.displayName?.[0] || user?.email?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.displayName || user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Player ID: {user?.uid.slice(0, 10)}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Joined {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
        >
          <h3 className="text-xl font-bold text-purple-600">0</h3>
          <p className="text-gray-500">Wins</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
        >
          <h3 className="text-xl font-bold text-purple-600">0</h3>
          <p className="text-gray-500">Losses</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
        >
          <h3 className="text-xl font-bold text-purple-600">0</h3>
          <p className="text-gray-500">Draws</p>
        </motion.div>
      </div>

      {/* Wallet Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>💳</span> Wallet Balance
          </h2>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Manage Wallet
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/80 mb-1">Current Balance</p>
            <h3 className="text-2xl font-bold">NPR {balance?.toFixed(2)}</h3>
          </div>
          <div>
            <p className="text-white/80 mb-1">Total Deposited</p>
            <h3 className="text-2xl font-bold">NPR {totalDeposited?.toFixed(2)}</h3>
          </div>
        </div>
      </motion.div>

      {/* Sign Out Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="danger"
          className="w-full"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </motion.div>
    </motion.div>
  );
}