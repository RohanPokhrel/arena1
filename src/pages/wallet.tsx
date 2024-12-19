import { useState } from 'react';
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
import { useWallet } from '@/contexts/WalletContext';

interface WalletStats {
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalLost: number;
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
  const { balance, totalDeposited, totalWithdrawn, totalLost, transactions, updateBalance } = useWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [gameId, setGameId] = useState('');
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access your wallet.</p>
      </div>
    );
  }

  const handleConfirmDeposit = async () => {
    if (!user || !amount) return;
    const amountNumber = parseFloat(amount);
    
    try {
      setIsLoadingDeposit(true);
      
      // Create transaction record
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        type: 'deposit',
        amount: amountNumber,
        status: 'completed',
        timestamp: new Date().toISOString(),
        remarks: gameId ? `Game ID: ${gameId}` : undefined,
      });

      // Update balance using WalletContext
      await updateBalance(amountNumber, 'deposit');

      toast.success('Deposit completed successfully!');
      setAmount('');
      setGameId('');
      setShowDepositModal(false);
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Failed to process deposit. Please try again.');
    } finally {
      setIsLoadingDeposit(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Wallet Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <FaWallet className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Current Balance</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">NPR</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(balance || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Deposited */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <FaMoneyBillWave className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Total Deposited</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">NPR</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(totalDeposited || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Withdrawn */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <FaMoneyBillWave className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Total Withdrawn</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">NPR</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(totalWithdrawn || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Lost */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <FaMoneyBillWave className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Total Lost</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">NPR</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(totalLost || 0)}
                </span>
              </div>
            </div>
          </div>
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
            <FaHistory className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    transaction.type === 'deposit' 
                      ? 'bg-green-50 border border-green-100' 
                      : 'bg-red-50 border border-red-100'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.remarks || `${transaction.type.charAt(0).toUpperCase()}${transaction.type.slice(1)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'deposit' 
                      ? 'text-green-600' 
                      : 'text-red-600'
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
            onDeposit={async (amount) => {
              await updateBalance(parseFloat(amount), 'deposit');
            }}
            userId={user.uid}
            onConfirm={handleConfirmDeposit}
            isLoading={isLoadingDeposit}
          />
        )}

        {showWithdrawModal && (
          <WithdrawModal
            onClose={() => setShowWithdrawModal(false)}
            onWithdraw={async (amount) => {
              await updateBalance(amount, 'withdraw');
            }}
            currentBalance={balance}
          />
        )}
      </AnimatePresence>
    </div>
  );
}