// assets/js/protected-route.js
import { requireAuth } from './auth-check.js';

export const protectedRoute = (callback) => {
  requireAuth()
    .then(user => {
      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = '/dashboard.html';
      }
      if (callback) callback(user);
    })
    .catch(error => {
      console.log('Authentication required');
      window.location.href = '/login.html'; // Redirect to login if not authenticated
    });
};
