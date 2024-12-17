import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WithdrawalRequest } from '@/types/wallet';
import { toast } from 'react-hot-toast';

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'withdrawalRequests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests: WithdrawalRequest[] = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as WithdrawalRequest);
      });
      setRequests(requests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Request ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update request status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.userEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${request.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.paymentMethod}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

WithdrawalsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
}; 