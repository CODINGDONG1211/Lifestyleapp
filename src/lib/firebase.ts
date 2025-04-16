import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDxz6Q8_ds0_RW3b7dZFI9HZ0VgefwlVnc",
  authDomain: "lifehub-8c661.firebaseapp.com",
  projectId: "lifehub-8c661",
  storageBucket: "lifehub-8c661.firebasestorage.app",
  messagingSenderId: "976020284889",
  appId: "1:976020284889:web:f0d3f392a5bd0a4c0e65c8",
  measurementId: "G-8SKJ213GYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 