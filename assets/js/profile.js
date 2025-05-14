
// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    deleteUser,
    signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbwE7hFNe4eqDIOllJL99QUyHCxgzpS-o",
  authDomain: "datacoll-36cec.firebaseapp.com",
  databaseURL: "https://datacoll-36cec-default-rtdb.firebaseio.com",
  projectId: "datacoll-36cec",
  storageBucket: "datacoll-36cec.appspot.com",
  messagingSenderId: "1016604814091",
  appId: "1:1016604814091:web:413f4f753259580060d00e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Populate user profile
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            document.getElementById("userName").textContent = data.name || "No name";
            document.getElementById("userBio").textContent = data.bio || "";
            document.getElementById("userEmail").textContent = user.email;
            document.getElementById("emailInput").value = user.email;
            document.getElementById("nameInput").value = data.name || "";
            document.getElementById("bioInput").value = data.bio || "";
            document.getElementById("roleInput").value = data.role || "student";
            document.getElementById("majorInput").value = data.major || "cs";
            document.getElementById("universityInput").value = data.university || "";
            document.getElementById("joinedDate").textContent = "Joined " + new Date(user.metadata.creationTime).toLocaleDateString();
            document.getElementById("lastLogin").textContent = "Last active: " + new Date(user.metadata.lastSignInTime).toLocaleString();
            document.getElementById("emailVerified").textContent = user.emailVerified ? "Email verified" : "Email not verified";
        }
    } else {
        window.location.href = "/login.html";
    }
});

// Save profile updates
document.getElementById("profileForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);

        const data = {
            name: document.getElementById("nameInput").value,
            bio: document.getElementById("bioInput").value,
            role: document.getElementById("roleInput").value,
            major: document.getElementById("majorInput").value,
            university: document.getElementById("universityInput").value
        };

        await setDoc(userRef, data, { merge: true });
        alert("Profile updated successfully!");
    }
});

// Password reset
document.getElementById("resetPasswordBtn").addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
        sendPasswordResetEmail(auth, user.email).then(() => {
            alert("Password reset email sent.");
        });
    }
});

// Account deletion
document.getElementById("deleteAccountBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
        const user = auth.currentUser;
        if (user) {
            deleteUser(user).then(() => {
                alert("Your account has been deleted.");
                window.location.href = "/login.html";
            }).catch((error) => {
                alert("Error deleting account: " + error.message);
            });
        }
    }
});

// Update badges dynamically (mock logic, expand with real data logic)
function updateBadges() {
    // You can enhance this by fetching stats from Firestore (e.g., note count, ratings, etc.)
    const stats = {
        notes: 42,
        downloads: 256,
        followers: 89
    };

    document.querySelector("#profileStats").innerHTML = `
        <div class="text-center">
            <div class="font-bold text-lg">${stats.notes}</div>
            <div>Notes</div>
        </div>
        <div class="text-center">
            <div class="font-bold text-lg">${stats.downloads}</div>
            <div>Downloads</div>
        </div>
        <div class="text-center">
            <div class="font-bold text-lg">${stats.followers}</div>
            <div>Followers</div>
        </div>
    `;
}

// Load stats and badges on page load
window.addEventListener("load", () => {
    updateBadges();
});
