import { create } from 'zustand';
import { PaymentStats, Transaction, PaymentMethod } from '@/types/payment';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';

interface PaymentStore {
  stats: PaymentStats | null;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  fetchStats: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  fetchPaymentMethods: (userId: string) => Promise<void>;
  addPaymentMethod: (userId: string, method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  initiateDeposit: (userId: string, amount: number, method: PaymentMethod) => Promise<void>;
  initiateWithdraw: (userId: string, amount: number, method: PaymentMethod) => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  stats: null,
  transactions: [],
  paymentMethods: [],
  isLoading: false,
  error: null,

  fetchStats: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const statsRef = doc(db, 'users', userId, 'payment', 'stats');
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        set({ stats: statsDoc.data() as PaymentStats });
      } else {
        // Initialize stats if they don't exist
        const initialStats: PaymentStats = {
          totalDeposited: 0,
          totalWithdrawn: 0,
          currentBalance: 0,
          lastUpdated: new Date().toISOString()
        };
        await setDoc(statsRef, initialStats);
        set({ stats: initialStats });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      const q = query(transactionsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      set({ transactions });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPaymentMethods: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const methodsRef = collection(db, 'users', userId, 'paymentMethods');
      const querySnapshot = await getDocs(methodsRef);
      
      const methods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentMethod[];
      
      set({ paymentMethods: methods });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addPaymentMethod: async (userId: string, method: Omit<PaymentMethod, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      const methodsRef = collection(db, 'users', userId, 'paymentMethods');
      await addDoc(methodsRef, {
        ...method,
        timestamp: new Date().toISOString()
      });
      
      // Refresh payment methods
      await get().fetchPaymentMethods(userId);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  initiateDeposit: async (userId: string, amount: number, method: PaymentMethod) => {
    try {
      set({ isLoading: true, error: null });
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      
      // Create transaction record
      const transaction: Omit<Transaction, 'id'> = {
        type: 'deposit',
        amount,
        status: 'pending',
        timestamp: new Date().toISOString(),
        description: `Deposit via ${method.type}`
      };
      
      await addDoc(transactionsRef, transaction);
      
      // Refresh transactions
      await get().fetchTransactions(userId);
      await get().fetchStats(userId);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  initiateWithdraw: async (userId: string, amount: number, method: PaymentMethod) => {
    try {
      set({ isLoading: true, error: null });
      const stats = get().stats;
      
      if (!stats || stats.currentBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      
      // Create transaction record
      const transaction: Omit<Transaction, 'id'> = {
        type: 'withdraw',
        amount,
        status: 'pending',
        timestamp: new Date().toISOString(),
        description: `Withdrawal via ${method.type}`
      };
      
      await addDoc(transactionsRef, transaction);
      
      // Refresh transactions
      await get().fetchTransactions(userId);
      await get().fetchStats(userId);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));