import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_EMAIL } from '@/lib/adminAuth';
import { FaUsers, FaMoneyBillWave, FaChartLine, FaGamepad, FaBell } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { formatCurrency } from '@/utils/format';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface DashboardStats {
  totalUsers: number;
  totalGames: number;
  totalTransactions: number;
  recentTransactions: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGames: 0,
    totalTransactions: 0,
    recentTransactions: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get total users count
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        const totalUsers = usersSnapshot.data().count;

        // Get total games count
        const gamesSnapshot = await getCountFromServer(collection(db, 'games'));
        const totalGames = gamesSnapshot.data().count;

        // Get total transactions count
        const transactionsSnapshot = await getCountFromServer(collection(db, 'transactions'));
        const totalTransactions = transactionsSnapshot.data().count;

        // Get recent transactions
        const recentTransactionsQuery = query(
          collection(db, 'transactions'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery);
        const recentTransactions = recentTransactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get recent users
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsers = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalUsers,
          totalGames,
          totalTransactions,
          recentTransactions,
          recentUsers,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-md"
            >
              <div className="flex items-center gap-4">
                <FaUsers className="w-8 h-8 opacity-80" />
                <div>
                  <h3 className="text-lg font-semibold opacity-80">Total Users</h3>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md"
            >
              <div className="flex items-center gap-4">
                <FaGamepad className="w-8 h-8 opacity-80" />
                <div>
                  <h3 className="text-lg font-semibold opacity-80">Total Games</h3>
                  <p className="text-3xl font-bold">{stats.totalGames}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-md"
            >
              <div className="flex items-center gap-4">
                <FaMoneyBillWave className="w-8 h-8 opacity-80" />
                <div>
                  <h3 className="text-lg font-semibold opacity-80">Transactions</h3>
                  <p className="text-3xl font-bold">{stats.totalTransactions}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-md"
            >
              <div className="flex items-center gap-4">
                <FaChartLine className="w-8 h-8 opacity-80" />
                <div>
                  <h3 className="text-lg font-semibold opacity-80">Active Games</h3>
                  <p className="text-3xl font-bold">
                    {stats.totalGames > 0 ? Math.floor(stats.totalGames * 0.3) : 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
              <div className="space-y-4">
                {stats.recentUsers?.map((user: any) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FaUsers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.displayName || user.email}</h3>
                      <p className="text-sm text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                {stats.recentTransactions?.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FaMoneyBillWave className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount)} NPR
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}