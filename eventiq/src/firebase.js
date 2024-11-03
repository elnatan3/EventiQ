// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { analytics, db, auth, provider, storage };
