import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { FaUser, FaClock, FaCheck, FaTimes, FaSpinner, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Modal } from '@/components/ui/Modal';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  userId: string;
  userEmail: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsQuery = query(
          collection(db, 'transactions'),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(transactionsQuery);
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Transaction));
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'failed':
        return <FaTimes className="text-red-500" />;
      case 'pending':
        return <FaSpinner className="text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === 'All Types' || transaction.type === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All Status' || transaction.status === statusFilter.toLowerCase();
    return matchesType && matchesStatus;
  });

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'transactions', selectedTransaction.id));
      
      // Update local state
      setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
      
      toast.success('Transaction deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
      setSelectedTransaction(null);
    }
  };

  const handleDeleteAllClick = () => {
    setDeleteAllModalOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    if (confirmationText !== 'DELETE ALL TRANSACTIONS') return;

    try {
      setIsDeletingAll(true);
      const batch = writeBatch(db);
      
      transactions.forEach((transaction) => {
        const transactionRef = doc(db, 'transactions', transaction.id);
        batch.delete(transactionRef);
      });

      await batch.commit();
      setTransactions([]);
      toast.success('All transactions deleted successfully');
      setDeleteAllModalOpen(false);
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      toast.error('Failed to delete all transactions');
    } finally {
      setIsDeletingAll(false);
      setConfirmationText('');
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option>All Types</option>
                  <option>Deposit</option>
                  <option>Withdraw</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>

                <button
                  onClick={handleDeleteAllClick}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  disabled={transactions.length === 0}
                >
                  <FaTrash className="w-4 h-4" />
                  Delete All
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-4 p-4 font-medium text-gray-600 border-b bg-gray-50">
                    <div>#</div>
                    <div>TYPE</div>
                    <div className="col-span-2">USER</div>
                    <div>AMOUNT</div>
                    <div>STATUS</div>
                    <div>DATE</div>
                    <div>ACTIONS</div>
                  </div>

                  <div className="divide-y">
                    {filteredTransactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-gray-50 transition-colors"
                      >
                        {/* Number */}
                        <div className="text-sm font-medium text-gray-500">
                          {filteredTransactions.length - index}
                        </div>

                        {/* Type */}
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <span className={`text-sm ${
                              transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' ? '↓' : '↑'}
                            </span>
                          </div>
                          <span className="capitalize text-sm">{transaction.type}</span>
                        </div>

                        {/* User */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <FaUser className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate">
                                {transaction.userEmail}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {transaction.userId?.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-sm">
                          NPR {transaction.amount.toLocaleString()}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`text-sm capitalize ${
                            transaction.status === 'completed' ? 'text-green-600' :
                            transaction.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaClock className="w-4 h-4" />
                          <div className="flex flex-col">
                            <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
                            <span className="text-xs">
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions Column */}
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteClick(transaction)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            title="Delete Transaction"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredTransactions.length === 0 && (
                      <div className="p-8 text-center text-gray-500 col-span-8">
                        No transactions found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={deleteModalOpen}
            onClose={() => {
              if (!isDeleting) {
                setDeleteModalOpen(false);
                setSelectedTransaction(null);
              }
            }}
            title="Confirm Delete Transaction"
          >
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedTransaction(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>

          {/* Delete All Confirmation Modal */}
          <Modal
            isOpen={deleteAllModalOpen}
            onClose={() => {
              if (!isDeletingAll) {
                setDeleteAllModalOpen(false);
                setConfirmationText('');
              }
            }}
            title="Delete All Transactions"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <FaExclamationTriangle className="w-6 h-6" />
                <span className="font-semibold">Warning: This action cannot be undone!</span>
              </div>
              
              <p className="text-gray-600 mb-6">
                To confirm deletion of all transactions, please type "DELETE ALL TRANSACTIONS" in the field below:
              </p>

              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE ALL TRANSACTIONS"
                className="w-full px-4 py-2 border rounded-lg mb-6 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isDeletingAll}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => {
                    setDeleteAllModalOpen(false);
                    setConfirmationText('');
                  }}
                  disabled={isDeletingAll}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllConfirm}
                  disabled={isDeletingAll || confirmationText !== 'DELETE ALL TRANSACTIONS'}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAll ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Deleting All...
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4" />
                      Delete All Transactions
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
