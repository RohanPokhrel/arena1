import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePaymentStore } from "@/store/paymentStore";
import { FaWallet, FaMoneyBillWave } from "react-icons/fa";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

interface UserData {
  username: string;
  uid: string;
  stats: {
    wins: number;
    losses: number;
    draws: number;
  };
  createdAt: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const { stats, fetchStats } = usePaymentStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch user data
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            ...data,
            // Ensure numeric values have defaults
            balance: Number(data.balance || 0),
            totalDeposited: Number(data.totalDeposited || 0),
            totalWithdrawn: Number(data.totalWithdrawn || 0)
          } as UserData);
        }
      };

      fetchUserData();
      fetchStats(user.uid);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {userData?.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userData?.username || "Player"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Player ID: {userData?.uid || user?.uid || "Loading..."}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Joined{" "}
                {new Date(
                  userData?.createdAt || Date.now()
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transform hover:scale-105 transition-transform"
            >
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userData?.stats?.wins || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Wins
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transform hover:scale-105 transition-transform"
            >
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userData?.stats?.losses || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Losses
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transform hover:scale-105 transition-transform"
            >
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userData?.stats?.draws || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Draws
              </div>
            </motion.div>
          </div>

          {/* Wallet Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaWallet className="w-6 h-6" />
                <h2 className="text-xl font-bold">Wallet Balance</h2>
              </div>
              <Link href="/wallet">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Manage Wallet
                </motion.button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-gray-200">Current Balance</span>
                </div>
                <p className="text-2xl font-bold">
                  NPR {userData?.balance?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm text-gray-200">Total Deposited</span>
                </div>
                <p className="text-2xl font-bold">
                  NPR {userData?.totalDeposited?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Add Sign Out Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <FiLogOut className="w-5 h-5" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
