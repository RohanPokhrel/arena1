import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function WalletDisplay() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        
        // Force parse as numbers and set with default of 0
        setBalance(Number(data.balance || 0));
        setTotalDeposited(Number(data.totalDeposited || 0));
        setTotalWithdrawn(Number(data.totalWithdrawn || 0));
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <div className="space-y-6">
      <div className="bg-purple-600 rounded-xl p-6">
        <h2 className="text-white text-xl font-semibold mb-2">Current Balance</h2>
        <p className="text-white text-3xl font-bold">
          NPR {Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="bg-green-600 rounded-xl p-6">
        <h2 className="text-white text-xl font-semibold mb-2">Total Deposited</h2>
        <p className="text-white text-3xl font-bold">
          NPR {Number(totalDeposited).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="bg-red-600 rounded-xl p-6">
        <h2 className="text-white text-xl font-semibold mb-2">Total Withdrawn</h2>
        <p className="text-white text-3xl font-bold">
          NPR {Number(totalWithdrawn).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

export default WalletDisplay; 