import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, where, getCountFromServer } from 'firebase/firestore';
import { FaChartLine, FaGamepad, FaUsers, FaMoneyBillWave } from 'react-icons/fa';

interface Analytics {
  dailyActiveUsers: number;
  totalRevenue: number;
  gamesPlayed: number;
  userGrowth: number;
  revenueGrowth: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    dailyActiveUsers: 0,
    totalRevenue: 0,
    gamesPlayed: 0,
    userGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get active users in the last 24 hours
        const usersQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', today.toISOString())
        );
        const activeUsersCount = await getCountFromServer(usersQuery);

        // Get total revenue
        const transactionsQuery = query(collection(db, 'transactions'));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const totalRevenue = transactionsSnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return data.type === 'deposit' ? sum + data.amount : sum;
        }, 0);

        // Get games played
        const gamesQuery = query(collection(db, 'games'));
        const gamesCount = await getCountFromServer(gamesQuery);

        setAnalytics({
          dailyActiveUsers: activeUsersCount.data().count,
          totalRevenue,
          gamesPlayed: gamesCount.data().count,
          userGrowth: 0, // You can calculate this based on historical data
          revenueGrowth: 0 // You can calculate this based on historical data
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: 'Daily Active Users',
      value: analytics.dailyActiveUsers,
      icon: FaUsers,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: `NPR ${analytics.totalRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'green'
    },
    {
      title: 'Games Played',
      value: analytics.gamesPlayed,
      icon: FaGamepad,
      color: 'blue'
    }
  ];

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${stat.color}-500`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add more analytics components here like charts and graphs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Coming Soon: Advanced Analytics
            </h2>
            <p className="text-gray-600">
              We're working on adding more detailed analytics, including:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>User engagement metrics</li>
              <li>Revenue trends</li>
              <li>Game statistics</li>
              <li>User retention rates</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
