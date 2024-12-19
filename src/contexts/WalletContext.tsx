import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, updateDoc, increment } from 'firebase/firestore';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description?: string;
  remarks?: string;
}

interface WalletContextType {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalLost: number;
  isLoading: boolean;
  transactions: Transaction[];
  updateBalance: (amount: number, type: 'deposit' | 'withdraw' | 'lost') => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  totalLost: 0,
  isLoading: true,
  transactions: [],
  updateBalance: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalLost, setTotalLost] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setBalance(0);
      setTotalDeposited(0);
      setTotalWithdrawn(0);
      setTotalLost(0);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    // Listen to user document for balance updates
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setBalance(Number(data.balance || 0));
        setTotalDeposited(Number(data.totalDeposited || 0));
        setTotalWithdrawn(Number(data.totalWithdrawn || 0));
        setTotalLost(Number(data.totalLost || 0));
      }
      setIsLoading(false);
    });

    // Listen to transactions
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('userId', '==', user.uid));
    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user?.uid]);

  const updateBalance = async (amount: number, type: 'deposit' | 'withdraw' | 'lost') => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(type === 'deposit' ? amount : -amount),
        totalDeposited: increment(type === 'deposit' ? amount : 0),
        totalWithdrawn: increment(type === 'withdraw' ? amount : 0),
        totalLost: increment(type === 'lost' ? amount : 0),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{
      balance,
      totalDeposited,
      totalWithdrawn,
      totalLost,
      transactions,
      isLoading,
      updateBalance,
    }}>
      {children}
    </WalletContext.Provider>
  );
} 