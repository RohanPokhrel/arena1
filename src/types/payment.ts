export interface PaymentStats {
  totalDeposited: number;
  totalWithdrawn: number;
  currentBalance: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'game_win' | 'game_loss';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'esewa' | 'khalti';
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  phoneNumber?: string;
} 