import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc, writeBatch, updateDoc, increment } from 'firebase/firestore';
import { FaUser, FaClock, FaCheck, FaTimes, FaSpinner, FaTrash, FaExclamationTriangle, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Modal } from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { createPortal } from 'react-dom';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  userId: string;
  userEmail: string;
}

function MenuPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

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

  const handleStatusUpdate = async (transactionId: string, newStatus: 'completed' | 'failed') => {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionDoc = transactions.find(t => t.id === transactionId);
      
      if (!transactionDoc) {
        throw new Error('Transaction not found');
      }

      const batch = writeBatch(db);
      const userRef = doc(db, 'users', transactionDoc.userId);
      
      // Update transaction status
      batch.update(transactionRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // If completing the transaction, update user's balance
      if (newStatus === 'completed') {
        if (transactionDoc.type === 'deposit') {
          batch.update(userRef, {
            balance: increment(transactionDoc.amount),
            totalDeposited: increment(transactionDoc.amount),
            updatedAt: new Date().toISOString()
          });
        } else if (transactionDoc.type === 'withdraw') {
          batch.update(userRef, {
            balance: increment(-transactionDoc.amount),
            totalWithdrawn: increment(transactionDoc.amount),
            updatedAt: new Date().toISOString()
          });
        }
      }

      await batch.commit();
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status: newStatus } : t)
      );
      
      toast.success(`Transaction ${newStatus === 'completed' ? 'accepted' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction status');
    }
  };

  const updateMenuPosition = (event: React.MouseEvent) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 110 // Offset to align with button
    });
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-2">
          <div className="mb-2 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-1.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full sm:w-32 px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 appearance-none cursor-pointer hover:border-purple-400 transition-colors"
              >
                <option value="All Types">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full sm:w-32 px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 appearance-none cursor-pointer hover:border-purple-400 transition-colors"
              >
                <option value="All Status">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <button
              onClick={handleDeleteAllClick}
              className="w-full sm:w-auto px-2 py-1 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
              disabled={transactions.length === 0}
            >
              <FaTrash className="w-3 h-3" />
              Delete All
            </button>
          </div>

          <div className="hidden md:block overflow-x-auto relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th scope="col" className="relative px-1.5 py-1.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="relative">
                    <td className="px-1.5 py-1.5 whitespace-nowrap text-sm text-gray-500">
                      {filteredTransactions.length - index}
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {transaction.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap text-sm text-gray-900">
                      NPR {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap relative">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                        
                        <Menu>
                          {({ open }) => (
                            <>
                              <Menu.Button 
                                onClick={updateMenuPosition}
                                className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100"
                              >
                                <FaEllipsisV className="h-4 w-4" />
                              </Menu.Button>

                              <MenuPortal>
                                <Transition
                                  show={open}
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items 
                                    static
                                    className="fixed z-[9999] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    style={{
                                      top: `${menuPosition.top}px`,
                                      left: `${menuPosition.left}px`
                                    }}
                                  >
                                    <div className="py-1">
                                      {transaction.status === 'pending' && (
                                        <>
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={() => handleStatusUpdate(transaction.id, 'completed')}
                                                className={`${
                                                  active ? 'bg-gray-50' : ''
                                                } flex w-full items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50`}
                                              >
                                                <FaCheck className="mr-2 h-4 w-4" />
                                                Accept Payment
                                              </button>
                                            )}
                                          </Menu.Item>
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={() => handleStatusUpdate(transaction.id, 'failed')}
                                                className={`${
                                                  active ? 'bg-gray-50' : ''
                                                } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50`}
                                              >
                                                <FaTimes className="mr-2 h-4 w-4" />
                                                Reject Payment
                                              </button>
                                            )}
                                          </Menu.Item>
                                        </>
                                      )}
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleDeleteClick(transaction)}
                                            className={`${
                                              active ? 'bg-gray-50' : ''
                                            } flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                                          >
                                            <FaTrash className="mr-2 h-4 w-4" />
                                            Delete
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </MenuPortal>
                            </>
                          )}
                        </Menu>
                      </div>
                    </td>
                    <td className="px-1.5 py-1.5 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
                          <span className="text-xs">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {transaction.type}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {transaction.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{transaction.userEmail}</div>
                    <div className="text-sm font-medium text-gray-900">
                      NPR {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                  <Menu>
                    {({ open }) => (
                      <>
                        <Menu.Button 
                          onClick={updateMenuPosition}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full hover:bg-gray-100"
                        >
                          <FaEllipsisV className="h-4 w-4" />
                        </Menu.Button>

                        <MenuPortal>
                          <Transition
                            show={open}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items 
                              static
                              className="fixed z-[9999] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              style={{
                                top: `${menuPosition.top}px`,
                                left: `${menuPosition.left}px`
                              }}
                            >
                              <div className="py-1">
                                {transaction.status === 'pending' && (
                                  <>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleStatusUpdate(transaction.id, 'completed')}
                                          className={`${
                                            active ? 'bg-gray-50' : ''
                                          } flex w-full items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50`}
                                        >
                                          <FaCheck className="mr-2 h-4 w-4" />
                                          Accept Payment
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleStatusUpdate(transaction.id, 'failed')}
                                          className={`${
                                            active ? 'bg-gray-50' : ''
                                          } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50`}
                                        >
                                          <FaTimes className="mr-2 h-4 w-4" />
                                          Reject Payment
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </>
                                )}
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeleteClick(transaction)}
                                      className={`${
                                        active ? 'bg-gray-50' : ''
                                      } flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                                    >
                                      <FaTrash className="mr-2 h-4 w-4" />
                                      Delete
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </MenuPortal>
                      </>
                    )}
                  </Menu>
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {new Date(transaction.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">20</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {/* Add pagination buttons here */}
                </nav>
              </div>
            </div>
          </div>
        </div>

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
      </AdminLayout>
    </ProtectedRoute>
  );
}
