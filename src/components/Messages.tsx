import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { FaSearch, FaUserShield, FaComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import UserListItem from '@/components/UserListItem';

export default function Messages() {
  const { user } = useAuth();
  const { chatUsers, isLoadingUsers, filteredUsers, setFilteredUsers, adminMessages, markAdminMessageAsRead } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'admin' | 'normal' | null>(null);

  // Update filtered users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show all users except current user when no search term
      setFilteredUsers(chatUsers.filter(chatUser => chatUser.uid !== user?.uid));
      return;
    }

    const filtered = chatUsers.filter(chatUser => 
      (chatUser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chatUser.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      chatUser.uid !== user?.uid // Filter out current user
    );
    setFilteredUsers(filtered);
  }, [searchTerm, chatUsers, user, setFilteredUsers]);

  const handleOptionSelect = (option: 'admin' | 'normal') => {
    setSelectedOption(option);
    setShowPopup(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Select Message Type
              </h2>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect('admin')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <FaUserShield className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Messages from Admin</div>
                    <div className="text-sm opacity-90">View official announcements and updates</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect('normal')}
                  className="w-full p-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white flex items-center gap-3 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                >
                  <FaComments className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Regular Messages</div>
                    <div className="text-sm opacity-70">Chat with other users</div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOption === 'admin' ? (
        <AdminMessages />
      ) : (
        // Regular messages UI
        <>
          {/* Search Bar */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingUsers ? (
              // Loading skeleton
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-3 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              // Users list
              filteredUsers.map((chatUser) => (
                <UserListItem key={chatUser.uid} user={chatUser} />
              ))
            ) : (
              // No users found
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchTerm ? 'No users found matching your search.' : 'No users available.'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// New AdminMessages component
function AdminMessages() {
  const { adminMessages, markAdminMessageAsRead } = useChat();
  
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaUserShield className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold">Messages from Admin</h2>
        </div>
        {adminMessages?.length > 0 && (
          <span className="text-sm text-gray-500">
            {adminMessages.length} message{adminMessages.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {adminMessages?.length ? (
          adminMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border-l-4 
                ${message.read ? 'border-gray-300 dark:border-gray-600' : 'border-purple-500'}
                ${!message.read && 'ring-2 ring-purple-500/20'}`}
              onClick={() => !message.read && markAdminMessageAsRead(message.id)}
            >
              {message.title && (
                <h3 className="font-semibold text-lg mb-2">{message.title}</h3>
              )}
              <p className="text-gray-900 dark:text-white">{message.text}</p>
              <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                {message.type && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-xs">
                    {message.type}
                  </span>
                )}
                {!message.read && (
                  <span className="ml-auto text-purple-500 text-xs font-medium">
                    New
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No messages from admin yet.
          </div>
        )}
      </div>
    </div>
  );
} 