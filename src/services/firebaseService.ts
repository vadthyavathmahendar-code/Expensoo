import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export const firebaseService = {
  // Auth
  login: (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass),
  register: (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass),

  // Transactions
  getTransactions: async (userId: string) => {
    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to string if needed, or keep as is
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString() : doc.data().date
    }));
    
    // Sort in-memory to avoid requiring a composite index in Firestore
    return transactions.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  },

  addTransaction: async (userId: string, data: any) => {
    return await addDoc(collection(db, 'transactions'), {
      ...data,
      userId,
      createdAt: Timestamp.now()
    });
  },

  deleteTransaction: async (id: string) => {
    await deleteDoc(doc(db, 'transactions', id));
  }
};
