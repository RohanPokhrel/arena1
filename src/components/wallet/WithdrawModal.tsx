import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FaTimes, FaMoneyBillWave, FaInfoCircle, FaClock, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { IoCheckmark } from 'react-icons/io5';
import Image from 'next/image';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number) => Promise<void>;
  currentBalance: number;
}

export function WithdrawModal({ onClose, onWithdraw, currentBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const [accountDetails, setAccountDetails] = useState('');

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText('12345'); // hardcoded userId for demonstration purposes
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWithdraw = async (amount: number, paymentMethod: string, accountDetails: string) => {
    try {
      if (!user) {
        toast.error('Please log in to withdraw');
        return;
      }

      const newTransaction = {
        userId: user.uid,
        userEmail: user.email,
        amount,
        type: 'withdraw',
        status: 'pending',
        timestamp: new Date().toISOString(),
        paymentMethod,
        accountDetails
      };

      await addDoc(collection(db, 'transactions'), newTransaction);
      toast.success('Withdrawal request submitted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md relative my-8 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h2>

        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-gray-300 mb-2">Amount (NPR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Enter amount"
              min="0"
              max={currentBalance}
            />
            <div className="text-sm text-gray-400 mt-1">
              Available balance: NPR {currentBalance.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Withdrawal Instructions</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-500/10 rounded-lg p-3">
                <div className="w-5 h-5 text-red-400 mt-1 flex-shrink-0">
                  <div className="animate-pulse">⭐</div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-red-200 font-medium">Important:</p>
                  <p className="text-gray-300">Your Game ID:</p>
                  <div className="flex items-center bg-red-900/50 rounded-lg overflow-hidden border border-red-500/30 w-full">
                    <code className="px-3 py-1.5 text-white font-medium text-sm truncate flex-1">
                      12345
                    </code>
                    <button
                      onClick={handleCopyId}
                      className="p-2 hover:bg-red-700/50 transition-colors relative group shrink-0"
                      title="Copy Game ID"
                    >
                      <AnimatePresence>
                        {copied ? (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                          >
                            <IoCheckmark className="w-4 h-4 text-green-400" />
                          </motion.div>
                        ) : (
                          <FaCopy className="w-4 h-4 text-red-300 group-hover:text-white transition-colors" />
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Select Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: '1', name: 'Method 1', icon: 'icon1' },
                    { id: '2', name: 'Method 2', icon: 'icon2' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedMethod?.id === method.id
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-gray-700 hover:border-red-500/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="uppercase text-sm font-medium text-gray-300">
                          {method.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="w-5 h-5 text-yellow-400 mt-1" />
                <p className="text-gray-300">Please allow up to 24 hours for withdrawal processing</p>
              </div>

              <div className="flex items-start gap-3">
                <FaCheckCircle className="w-5 h-5 text-red-400 mt-1" />
                <p className="text-gray-300">Your balance will be updated automatically after withdrawal</p>
              </div>
            </div>

            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-300">
                <FaInfoCircle className="w-4 h-4" />
                <p>Keep your withdrawal reference ID for future inquiries</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={() => handleWithdraw(Number(amount), selectedMethod?.name || '', accountDetails || '')}
            disabled={!amount || isLoading || Number(amount) > currentBalance || !selectedMethod}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <FaMoneyBillWave className="w-5 h-5" />
            )}
            Confirm Withdrawal
          </Button>
        </div>
      </div>
    </div>
  );
}