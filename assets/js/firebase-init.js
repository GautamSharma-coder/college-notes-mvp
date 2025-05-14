// 🔹 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbwE7hFNe4eqDIOllJL99QUyHCxgzpS-o",
  authDomain: "datacoll-36cec.firebaseapp.com",
  databaseURL: "https://datacoll-36cec-default-rtdb.firebaseio.com",
  projectId: "datacoll-36cec",
  storageBucket: "datacoll-36cec.appspot.com",
  messagingSenderId: "1016604814091",
  appId: "1:1016604814091:web:413f4f753259580060d00e"
};

// 🔹 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  query,
  where,
  doc,
  limit,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 🔹 Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔹 Export Firebase Services & Functions
export { 
  auth, 
  getAuth,
  db, 
  storage, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  collection, 
  getFirestore,
  getStorage,
  addDoc,
  getDocs, 
  setDoc,
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  doc, 
  getDoc, 
  onAuthStateChanged,
  limit,
  deleteDoc,
  updateDoc,
  where,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  increment
};