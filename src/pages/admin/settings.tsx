import { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { FaCog, FaGamepad, FaMoneyBillWave, FaLock } from 'react-icons/fa';

export default function Settings() {
  const [gameSettings, setGameSettings] = useState({
    matchmakingTimeout: 30,
    maxPlayersPerGame: 2,
    turnTimeLimit: 30
  });

  const [paymentSettings, setPaymentSettings] = useState({
    minDeposit: 100,
    minWithdrawal: 100,
    transactionFee: 2
  });

  const handleSaveGameSettings = async () => {
    // Implement saving game settings to Firebase
    console.log('Saving game settings:', gameSettings);
  };

  const handleSavePaymentSettings = async () => {
    // Implement saving payment settings to Firebase
    console.log('Saving payment settings:', paymentSettings);
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Configure your game and payment settings</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Settings Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FaGamepad className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Game Settings</h2>
                  <p className="text-sm text-gray-500">Configure gameplay parameters</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matchmaking Timeout
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={gameSettings.matchmakingTimeout}
                      onChange={(e) => setGameSettings({
                        ...gameSettings,
                        matchmakingTimeout: parseInt(e.target.value)
                      })}
                      className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm group-hover:border-purple-400"
                      min={10}
                      max={120}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">sec</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Time to wait for opponent (10-120s)</p>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Players
                  </label>
                  <select
                    value={gameSettings.maxPlayersPerGame}
                    onChange={(e) => setGameSettings({
                      ...gameSettings,
                      maxPlayersPerGame: parseInt(e.target.value)
                    })}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm group-hover:border-purple-400"
                  >
                    <option value={2}>2 Players</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Players per game session</p>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turn Time Limit
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      value={gameSettings.turnTimeLimit}
                      onChange={(e) => setGameSettings({
                        ...gameSettings,
                        turnTimeLimit: parseInt(e.target.value)
                      })}
                      min={10}
                      max={60}
                      step={5}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">10s</span>
                      <span className="text-sm font-medium text-purple-600">{gameSettings.turnTimeLimit}s</span>
                      <span className="text-sm text-gray-500">60s</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Time limit per turn</p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSaveGameSettings}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FaGamepad className="w-5 h-5" />
                    Save Game Settings
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Payment Settings Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Settings</h2>
                  <p className="text-sm text-gray-500">Configure transaction limits</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Deposit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">NPR</span>
                    </div>
                    <input
                      type="number"
                      value={paymentSettings.minDeposit}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        minDeposit: parseInt(e.target.value)
                      })}
                      className="block w-full pl-16 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm group-hover:border-green-400"
                      min={100}
                      step={100}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Minimum deposit amount</p>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Withdrawal
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">NPR</span>
                    </div>
                    <input
                      type="number"
                      value={paymentSettings.minWithdrawal}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        minWithdrawal: parseInt(e.target.value)
                      })}
                      className="block w-full pl-16 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm group-hover:border-green-400"
                      min={100}
                      step={100}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Minimum withdrawal amount</p>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Fee
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={paymentSettings.transactionFee}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        transactionFee: parseInt(e.target.value)
                      })}
                      className="block w-full pr-8 pl-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm group-hover:border-green-400"
                      min={0}
                      max={10}
                      step={0.5}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Fee per transaction (0-10%)</p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSavePaymentSettings}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave className="w-5 h-5" />
                    Save Payment Settings
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
