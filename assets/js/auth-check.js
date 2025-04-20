// assets/js/auth-check.js
import { auth, db,doc, getDoc  } from './firebase-init.js';
//import { } from 'firebase/firestore';

export const requireAuth = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      unsubscribe();
      if (!user) {
        sessionStorage.setItem('redirectPath', window.location.pathname);
        window.location.href = '/dashboard.html';
        reject(new Error('User not authenticated'));
      } else {
        try {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            user.role = userData.role || 'normal'; // Default to normal user
          } else {
            user.role = 'normal'; // Default role if no document found
          }
          resolve(user);
        } catch (error) {
          reject(new Error('Error fetching user data'));
        }
      }
    });
  });
};
