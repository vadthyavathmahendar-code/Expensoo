import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export const firebaseService = {
  // Auth
  login: (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass),
  register: async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    // Initialize user doc in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: '',
      phoneNumber: '',
      bio: '',
      avatar: '',
      createdAt: Timestamp.now()
    });
    return userCredential;
  },
  resetPassword: (email: string) => sendPasswordResetEmail(auth, email),

  updateUserProfile: async (userId: string, data: { displayName?: string, photoURL?: string, phoneNumber?: string, bio?: string, avatar?: string }) => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (data.displayName !== undefined || data.photoURL !== undefined) {
          await updateProfile(user, {
            displayName: data.displayName,
            photoURL: data.photoURL
          });
        }
      } catch (authErr) {
        console.error("Auth profile update failed, continuing with Firestore update:", authErr);
      }
    }

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  },

  getUserProfile: async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  },

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
  },

  updatePushToken: async (userId: string, token: string) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      pushToken: token,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
};
