import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBChOCygDTjNezPC_6vc45wHfgrLI5ZPq0",
  authDomain: "binakink.firebaseapp.com",
  projectId: "binakink",
  storageBucket: "binakink.firebasestorage.app",
  messagingSenderId: "226868969064",
  appId: "1:226868969064:web:3b72088a6249115d3845dd",
  measurementId: "G-2LPLQP0QE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
