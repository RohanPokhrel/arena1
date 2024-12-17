import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaClock } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-6">
          <div className="w-full space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium text-gray-600 border-b sticky top-0 bg-white">
                  <div>USER</div>
                  <div>EMAIL</div>
                  <div>JOINED</div>
                  <div>LAST LOGIN</div>
                </div>
                
                {users.length > 0 ? (
                  <div className="p-4 text-gray-500 text-sm">
                    {users.map((user) => (
                      <div key={user.id} className="grid grid-cols-4 gap-4 p-2 border-b">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName || 'Anonymous'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaEnvelope className="mr-2 h-4 w-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="mr-2 h-4 w-4" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-gray-500 text-sm">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
