import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJEhR_0OQT7d1m5RwbzrlX4iherFcpuyw",
  authDomain: "emojiq-1cfdd.firebaseapp.com",
  projectId: "emojiq-1cfdd",
  storageBucket: "emojiq-1cfdd.appspot.com",
  messagingSenderId: "813443134129",
  appId: "1:813443134129:web:95c5e8c0ef32b0e6852890",
  measurementId: "G-KLLGRJG48E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics, Firestore, Auth, and Google Provider
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export { analytics };
