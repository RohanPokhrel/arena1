import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaMoneyBillWave, FaHistory, FaRegClock, FaUser, FaClock, FaSpinner, FaCopy, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { IoCheckmark } from 'react-icons/io5';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStore } from '@/store/paymentStore';
import { formatCurrency } from '@/utils/format';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';
import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { PaymentMethod } from '@/types/payment';

interface WalletStats {
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  description: string;
  timestamp: string;
}

export default function Wallet() {
  const { user } = useAuth();
  const { 
    stats, 
    transactions, 
    paymentMethods,
    isLoading,
    error,
    fetchStats,
    fetchTransactions,
    fetchPaymentMethods,
    initiateDeposit,
    initiateWithdraw
  } = usePaymentStore();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [gameId, setGameId] = useState('');
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats(user.uid);
      fetchTransactions(user.uid);
      fetchPaymentMethods(user.uid);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access your wallet.</p>
      </div>
    );
  }

  const handleConfirmDeposit = async () => {
    if (!user || !amount) return;
    
    try {
      setIsLoadingDeposit(true);
      
      // Create transaction record
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        timestamp: new Date().toISOString(),
        remarks: `Game ID: ${gameId}`,
      });

      // Update user's wallet balance (you may want to do this after payment confirmation)
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(parseFloat(amount))
      });

      toast.success('Deposit initiated successfully!');
      setAmount('');
      setShowDepositModal(false);
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Failed to process deposit. Please try again.');
    } finally {
      setIsLoadingDeposit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Wallet Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FaWallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">Current Balance</h3>
            </div>
            <p className="text-3xl font-bold">
              NPR {formatCurrency(stats?.currentBalance || 0)}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FaMoneyBillWave className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">Total Deposited</h3>
            </div>
            <p className="text-3xl font-bold">
              NPR {formatCurrency(stats?.totalDeposited || 0)}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FaMoneyBillWave className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">Total Withdrawn</h3>
            </div>
            <p className="text-3xl font-bold">
              NPR {formatCurrency(stats?.totalWithdrawn || 0)}
            </p>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl"
          >
            Deposit
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl"
          >
            Withdraw
          </Button>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <FaHistory className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    transaction.type === 'deposit' 
                      ? 'bg-green-900/20' 
                      : transaction.type === 'withdraw'
                      ? 'bg-red-900/20'
                      : 'bg-gray-700/20'
                  }`}
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'deposit' 
                      ? 'text-green-400' 
                      : transaction.type === 'withdraw'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'} NPR {formatCurrency(transaction.amount)}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center py-12 px-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.3 
                  }}
                  className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4"
                >
                  <FaRegClock className="w-8 h-8 text-gray-400" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-semibold text-gray-300 mb-2"
                >
                  No Transactions Yet
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-400 text-center max-w-sm"
                >
                  Your transaction history will appear here once you make your first deposit or withdrawal.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setShowDepositModal(true)}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <FaWallet className="w-4 h-4" />
                  Make Your First Deposit
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal
            onClose={() => setShowDepositModal(false)}
            paymentMethods={paymentMethods}
            onDeposit={initiateDeposit}
            userId={user.uid}
            onConfirm={handleConfirmDeposit}
            isLoading={isLoadingDeposit}
          />
        )}

        {showWithdrawModal && (
          <WithdrawModal
            onClose={() => setShowWithdrawModal(false)}
            paymentMethods={paymentMethods}
            onWithdraw={initiateWithdraw}
            userId={user.uid}
            currentBalance={stats?.currentBalance || 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
}