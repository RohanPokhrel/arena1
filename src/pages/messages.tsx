import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { FaSearch, FaPaperPlane, FaTimes, FaUserPlus, FaUserShield, FaComments } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/contexts/ChatContext';
import Image from 'next/image';

// Add AdminMessages component definition
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

export default function Messages() {
  const { user } = useAuth();
  const {
    selectedUser,
    setSelectedUser,
    messages,
    sendMessage,
    chatRequests,
    chatUsers,
    isLoadingUsers,
    filteredUsers,
    setFilteredUsers,
    sendChatRequest,
    adminMessages,
    markAdminMessageAsRead,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'admin' | 'normal' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleOptionSelect = (option: 'admin' | 'normal') => {
    setSelectedOption(option);
    setShowPopup(false);
  };

  // Update search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      const otherUsers = chatUsers.filter(chatUser => chatUser.uid !== user?.uid);
      setFilteredUsers(otherUsers);
    } else {
      const filtered = chatUsers.filter(chatUser => 
        chatUser.uid !== user?.uid &&
        (
          chatUser.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chatUser.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, chatUsers, user?.uid, setFilteredUsers]);

  // Debug logs with more details
  useEffect(() => {
    console.log('Current user:', user?.email);
    console.log('All chat users:', chatUsers.map(u => u.email));
    console.log('Filtered users:', filteredUsers.map(u => u.email));
  }, [chatUsers, filteredUsers, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add debug logging
  useEffect(() => {
    console.log('Messages component - Current user:', user);
    console.log('Messages component - Chat users:', chatUsers);
    console.log('Messages component - Loading state:', isLoadingUsers);
  }, [user, chatUsers, isLoadingUsers]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    await sendMessage(messageText);
    setMessageText('');
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden min-h-[600px]">
          {/* Message Type Selection Popup */}
          <AnimatePresence>
            {showPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
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

          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Show content based on selected option */}
            {selectedOption === 'admin' ? (
              <div className="col-span-4">
                <AdminMessages />
              </div>
            ) : (
              <>
                {/* Left Sidebar - User Search and Chat List */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700">
                  {/* Search Input */}
                  <div className="mb-6">
                    <form onSubmit={(e) => e.preventDefault()} className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Chat Requests Section */}
                  {chatRequests && chatRequests.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Chat Requests ({chatRequests.length})
                      </h3>
                      <div className="space-y-2">
                        {chatRequests.map((request) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-900 dark:text-white">{request.senderId}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => acceptChatRequest(request.id)}
                                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => rejectChatRequest(request.id)}
                                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        All Users
                      </h3>
                      <span className="text-xs text-gray-500">
                        {isLoadingUsers ? 'Loading...' : `${filteredUsers.length} users found`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {isLoadingUsers ? (
                        // Loading skeleton
                        <div className="animate-pulse space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        <div className="space-y-2">
                          {filteredUsers.map((chatUser) => (
                            <motion.div
                              key={chatUser.uid}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => setSelectedUser(chatUser)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                                      {chatUser.displayName?.[0] || chatUser.email[0]}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                      chatUser.online ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                      {chatUser.displayName || chatUser.email.split('@')[0]}
                                    </h3>
                                    <p className="text-sm text-gray-500">{chatUser.email}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendChatRequest(chatUser.uid);
                                  }}
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  <FaUserPlus className="w-5 h-5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'No users found matching your search' : 'No users available'}
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {searchQuery ? 'Try a different search term' : 'Waiting for other users to join'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="col-span-3 flex flex-col h-[600px]">
                  {selectedUser ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                            {selectedUser.displayName?.[0] || selectedUser.email[0]}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {selectedUser.displayName || selectedUser.email}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {selectedUser.online ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4">
                        {messages && messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                message.senderId === user?.uid
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                            >
                              <p>{message.text}</p>
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="submit"
                            className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors"
                          >
                            <FaPaperPlane />
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Select a chat or start a new conversation
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
} 