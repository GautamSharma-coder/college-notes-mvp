// assets/js/session-manager.js
import { auth } from './firebase-init.js';

export const sessionMonitor = () => {
  auth.onAuthStateChanged(user => {
    if (!user) {
      sessionStorage.clear();
      if(!window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
      }
    }
  });
  
  // Auto-logout after 1 hour
  setTimeout(() => {
    auth.signOut();
  }, 3600000);
};