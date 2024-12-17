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

export interface DepositModalProps {
  onDeposit: (userId: string, amount: number, method: PaymentMethod) => Promise<void>;
  userId: string;
  onConfirm: () => void;
  isLoading: boolean;
  onClose: () => void;
}


export function DepositModal({ onClose, onConfirm, isLoading }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [gameId, setGameId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeposit = async () => {
    try {
      if (!user) {
        toast.error('Please log in to deposit');
        return;
      }

      if (!amount || !gameId) {
        toast.error('Please fill in all required fields');
        return;
      }

      const newTransaction = {
        userId: user.uid,
        userEmail: user.email,
        amount: Number(amount),
        type: 'deposit',
        status: 'pending',
        timestamp: new Date().toISOString(),
        gameId: gameId,
        esewa: '9827327006'
      };

      await addDoc(collection(db, 'transactions'), newTransaction);
      toast.success('Deposit request submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error('Failed to submit deposit request');
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

        <h2 className="text-2xl font-bold text-white mb-6">Deposit Funds</h2>

        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-gray-300 mb-2">Amount (NPR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter amount"
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Game ID</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="block w-full flex-1 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your Game ID"
              />
              <button
                type="button"
                onClick={handleCopyId}
                className="ml-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
                    <FaCopy className="h-4 w-4" />
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl p-4 border border-purple-500/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 relative">
                <Image
                  src="/esewa-logo.png"
                  alt="eSewa"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">eSewa Payment Instructions</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaMoneyBillWave className="w-5 h-5 text-green-400 mt-1" />
                <p className="text-gray-300">Send payment to eSewa ID: <span className="text-white font-medium">9827327006</span></p>
              </div>

              <div className="flex items-start gap-3 bg-purple-500/10 rounded-lg p-3">
                <div className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0">
                  <div className="animate-pulse">⭐</div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-purple-200 font-medium">Important:</p>
                  <p className="text-gray-300">Add your Game ID in the payment remarks</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="w-5 h-5 text-yellow-400 mt-1" />
                <p className="text-gray-300">Please allow up to 24 hours for your balance to be credited</p>
              </div>

              <div className="flex items-start gap-3">
                <FaCheckCircle className="w-5 h-5 text-purple-400 mt-1" />
                <p className="text-gray-300">After payment, your balance will be automatically updated</p>
              </div>
            </div>

            <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <FaInfoCircle className="w-4 h-4" />
                <p>Keep your payment screenshot for reference</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={!amount || !gameId || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <div className="flex items-center gap-2">
                <Image
                  src="/esewa-logo.png"
                  alt="eSewa"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                Confirm Deposit
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}