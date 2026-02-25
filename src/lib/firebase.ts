import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGkaVGyxiiol_CNCqxWWST3v0GEd7pV8I",
  authDomain: "expenso-785fb.firebaseapp.com",
  projectId: "expenso-785fb",
  storageBucket: "expenso-785fb.firebasestorage.app",
  messagingSenderId: "729971630916",
  appId: "1:729971630916:web:293d6b7bf79d35f0796d11"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
