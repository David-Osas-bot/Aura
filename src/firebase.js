import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAy-Eme2jTediR639LCgpsOnjSgqnzWGgA",
  authDomain: "elite-dating-6609e.firebaseapp.com",
  projectId: "elite-dating-6609e",
  storageBucket: "elite-dating-6609e.firebasestorage.app",
  messagingSenderId: "349191139874",
  appId: "1:349191139874:web:25368bced32c491ffc107b"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;