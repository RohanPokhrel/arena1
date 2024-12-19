import React from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import { useWallet } from '@/contexts/WalletContext';

export function WalletDisplay() {
  const { balance, totalDeposited, totalWithdrawn, isLoading } = useWallet();

  if (isLoading) {
    return <div>Loading...</div>; // Add proper loading state UI
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <FaWallet className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white">Current Balance</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            NPR {Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <FaMoneyBillWave className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white">Total Deposited</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            NPR {Number(totalDeposited).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <FaMoneyBillWave className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white">Total Withdrawn</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            NPR {Number(totalWithdrawn).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default WalletDisplay; 