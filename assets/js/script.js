// Dark Mode Toggle

document.getElementById("dark-mode-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

// Load saved theme
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
});
// Bookmark System
document.querySelectorAll('.bookmark-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.innerHTML = '✓ Bookmarked';
    btn.classList.add('text-green-600');
  });
});

// Form Submissions
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your submission! (Demo Message)');
    form.reset();
  });
});

// Mock Authentication

if(document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'dashboard.html';
  });
}
// Request Form Handling
if(document.getElementById('requestForm')) {
  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Request submitted successfully! We\'ll notify you when it\'s available.');
    e.target.reset();
  });
}

// Login/Signup Handling
if(window.location.pathname.includes('login.html')) {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'dashboard.html';
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Account created successfully! Please login.');
    document.querySelector('[data-tab="login"]').click();
  });
}

// Review Submission
if(window.location.pathname.includes('review.html')) {
  document.getElementById('reviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your review!');
    e.target.reset();
    document.querySelectorAll('[data-rating]').forEach(s => s.textContent = '☆');
  });
}
import { sessionMonitor } from './session-manager.js';
sessionMonitor();


//login btn updation
import { auth, signOut } from './assets/js/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("authBtn");

    if (!authBtn) {
        console.error("❌ authBtn not found in DOM.");
        return;
    }

    // ✅ Listen for Authentication State Changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ User is logged in:", user.email);
            authBtn.textContent = "Logout";
            authBtn.href = "#"; // Prevent navigation
            authBtn.onclick = () => {
                signOut(auth).then(() => {
                    console.log("✅ User logged out successfully.");
                }).catch(error => {
                    console.error("❌ Logout Error:", error);
                });
            };
        } else {
            console.log("❌ User is logged out.");
            authBtn.textContent = "Login";
            authBtn.href = "login.html"; // Redirect to login page
            authBtn.onclick = null; // Remove logout function
        }
    });
});