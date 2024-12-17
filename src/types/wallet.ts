export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  paymentMethod: string;
  accountDetails: string;
} 