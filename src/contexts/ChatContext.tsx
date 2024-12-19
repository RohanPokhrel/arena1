import { createContext, useContext, useEffect, useState } from 'react';
import { realtimeDb } from '@/lib/firebase';
import { ref, onValue, push, set, get } from 'firebase/database';
import { useAuth } from './AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  online?: boolean;
  lastSeen?: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

interface ChatRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

interface AdminMessage {
  id: string;
  text: string;
  timestamp: number;
  senderId: string;
  title?: string;
  type?: 'announcement' | 'notification' | 'alert';
  read?: boolean;
}

interface ChatContextType {
  selectedUser: ChatUser | null;
  setSelectedUser: (user: ChatUser | null) => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  sendChatRequest: (userId: string) => Promise<void>;
  acceptChatRequest: (requestId: string) => Promise<void>;
  rejectChatRequest: (requestId: string) => Promise<void>;
  chatRequests: ChatRequest[];
  chatUsers: ChatUser[];
  searchUsers: (query: string) => Promise<ChatUser[]>;
  isLoadingUsers: boolean;
  filteredUsers: ChatUser[];
  setFilteredUsers: (users: ChatUser[]) => void;
  adminMessages: AdminMessage[];
  markAdminMessageAsRead: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);

  // Listen to chat requests
  useEffect(() => {
    if (!user) return;

    const requestsRef = ref(realtimeDb, `chatRequests/${user.uid}`);
    return onValue(requestsRef, (snapshot) => {
      const requests: ChatRequest[] = [];
      snapshot.forEach((child) => {
        requests.push({ id: child.key!, ...child.val() });
      });
      setChatRequests(requests);
    });
  }, [user]);

  // Listen to messages when a user is selected
  useEffect(() => {
    if (!user || !selectedUser) return;

    const chatId = [user.uid, selectedUser.uid].sort().join('-');
    const messagesRef = ref(realtimeDb, `messages/${chatId}`);
    
    return onValue(messagesRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((child) => {
        msgs.push({ id: child.key!, ...child.val() });
      });
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
    });
  }, [user, selectedUser]);

  // Monitor all users
  useEffect(() => {
    if (!user) {
      console.log('No user logged in');
      setIsLoadingUsers(false);
      setChatUsers([]);
      setFilteredUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    const unsubscribe = fetchChatUsers();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Update the admin messages listener
  useEffect(() => {
    if (!user) return;

    // Listen to all admin messages
    const adminMessagesRef = ref(realtimeDb, 'adminMessages');
    return onValue(adminMessagesRef, (snapshot) => {
      const messages: AdminMessage[] = [];
      snapshot.forEach((child) => {
        const messageData = child.val();
        // Only include messages that are meant for this user
        if (messageData.recipients && messageData.recipients[user.uid]) {
          messages.push({
            id: child.key!,
            text: messageData.text,
            timestamp: messageData.timestamp,
            senderId: messageData.senderId,
            title: messageData.title,
            type: messageData.type,
            read: messageData.recipients[user.uid].read || false
          });
        }
      });
      setAdminMessages(messages.sort((a, b) => b.timestamp - a.timestamp));
    });
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!user || !selectedUser) return;

    const chatId = [user.uid, selectedUser.uid].sort().join('-');
    const messagesRef = ref(realtimeDb, `messages/${chatId}`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      senderId: user.uid,
      text,
      timestamp: Date.now(),
      read: false,
    });
  };

  const sendChatRequest = async (userId: string) => {
    if (!user) return;
    
    const chatRequestRef = ref(realtimeDb, `chatRequests/${userId}`);
    const newRequest = {
      senderId: user.uid,
      receiverId: userId,
      status: 'pending',
      timestamp: Date.now()
    };
    
    try {
      await push(chatRequestRef, newRequest);
      console.log('Chat request sent successfully');
    } catch (error) {
      console.error('Error sending chat request:', error);
      throw error;
    }
  };

  const acceptChatRequest = async (requestId: string) => {
    if (!user) return;
    
    const requestRef = ref(realtimeDb, `chatRequests/${user.uid}/${requestId}`);
    await set(requestRef, { status: 'accepted' });
  };

  const rejectChatRequest = async (requestId: string) => {
    if (!user) return;
    
    const requestRef = ref(realtimeDb, `chatRequests/${user.uid}/${requestId}`);
    await set(requestRef, { status: 'rejected' });
  };

  const searchUsers = async (query: string): Promise<ChatUser[]> => {
    if (!query.trim()) return chatUsers; // Return all users if no query
    
    return chatUsers.filter(chatUser => 
      chatUser.email?.toLowerCase().includes(query.toLowerCase()) ||
      chatUser.displayName?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const fetchChatUsers = () => {
    try {
      console.log('Fetching users from Realtime Database...');
      const usersRef = ref(realtimeDb, 'users');
      
      return onValue(usersRef, (snapshot) => {
        const snapshotData = snapshot.val();
        console.log('Raw snapshot data:', snapshotData);
        
        if (!snapshotData) {
          console.log('No users found in database');
          setChatUsers([]);
          setFilteredUsers([]);
          setIsLoadingUsers(false);
          return;
        }

        const usersData: ChatUser[] = Object.entries(snapshotData).map(([key, value]: [string, any]) => ({
          uid: key,
          displayName: value.displayName || value.email?.split('@')[0] || '',
          email: value.email,
          photoURL: value.photoURL || '',
          online: value.online || false,
          lastSeen: value.lastSeen
        })).filter(user => user.email); // Only include users with email

        console.log('Processed users data:', usersData);
        setChatUsers(usersData);
        // Initial filtering to exclude current user
        if (user) {
          setFilteredUsers(usersData.filter(chatUser => chatUser.uid !== user.uid));
        }
        setIsLoadingUsers(false);
      });
    } catch (error) {
      console.error('Error fetching chat users:', error);
      setIsLoadingUsers(false);
    }
  };

  // Add function to mark message as read
  const markAdminMessageAsRead = async (messageId: string) => {
    if (!user) return;
    
    const messageRef = ref(realtimeDb, `adminMessages/${messageId}/recipients/${user.uid}`);
    await set(messageRef, {
      read: true,
      readAt: Date.now()
    });
  };

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        messages,
        sendMessage,
        sendChatRequest,
        acceptChatRequest,
        rejectChatRequest,
        chatRequests,
        chatUsers,
        searchUsers,
        isLoadingUsers,
        filteredUsers,
        setFilteredUsers,
        adminMessages,
        markAdminMessageAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
} 