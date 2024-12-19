import React from 'react';
import { useChat } from '../contexts/ChatContext';

interface UserListItemProps {
  user: {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    online?: boolean;
  };
}

export default function UserListItem({ user }: UserListItemProps) {
  const { setSelectedUser } = useChat();

  return (
    <div
      onClick={() => setSelectedUser(user)}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-semibold">
          {user.displayName[0].toUpperCase()}
        </div>
        {user.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{user.displayName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>
    </div>
  );
} 