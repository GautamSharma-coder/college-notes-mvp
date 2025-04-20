// Firebase imports
import { auth, db, storage } from './firebase-init.js';
import {
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const joinedDate = document.getElementById("joinedDate");
const lastLogin = document.getElementById("lastLogin");
const emailVerified = document.getElementById("emailVerified");
const notesCount = document.getElementById("notesCount");
const recentNotesList = document.getElementById("recentNotesList");
const profileImage = document.getElementById("profileImage");
const profilePicInput = document.getElementById("profilePicInput");
const updateProfileBtn = document.getElementById("updateProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const nameInput = document.getElementById("nameInput");
const bioInput = document.getElementById("bioInput");
const saveDetailsBtn = document.getElementById("saveDetailsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "login.html";

  userEmail.textContent = user.email;
  joinedDate.textContent = `Joined: ${new Date(user.metadata.creationTime).toLocaleDateString()}`;
  lastLogin.textContent = `Last Login: ${new Date(user.metadata.lastSignInTime).toLocaleString()}`;
  emailVerified.textContent = user.emailVerified ? "Email Verified" : "Email Not Verified";
  emailVerified.className = user.emailVerified ? "text-green-600 text-sm" : "text-red-600 text-sm";

  // Get user data from Firestore
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  // Check if the user document exists in Firestore and create it if not
  try {
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        fullName: user.displayName || "",
        email: user.email,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error creating user in Firestore:", error);
  }

  if (userSnap.exists()) {
    const data = userSnap.data();
    userName.textContent = data.fullName || "Your Name";
    nameInput.value = data.fullName || "";
    bioInput.value = data.bio || "";
    profileImage.src = data.photoURL || "https://via.placeholder.com/100";
  }

  // Count notes
  const notesQuery = query(collection(db, "notes"), where("userId", "==", user.uid));
  const notesSnap = await getDocs(notesQuery);
  notesCount.textContent = `Total Notes Uploaded: ${notesSnap.size}`;

  // Show recent uploads
  const recentQuery = query(
    collection(db, "notes"),
    where("userId", "==", user.uid),
    orderBy("uploadedAt", "desc"),
    limit(3)
  );
  const recentSnap = await getDocs(recentQuery);
  recentSnap.forEach(doc => {
    const note = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `<a href="${note.downloadURL}" target="_blank">${note.title}</a>`;
    recentNotesList.appendChild(li);
  });

  // Update Profile Picture
  updateProfileBtn.addEventListener("click", async () => {
    if (!profilePicInput.files.length) return alert("Please select a file");
    const file = profilePicInput.files[0];
    const storageRef = ref(storage, `profile/${user.uid}/avatar`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    await updateDoc(userRef, { photoURL: downloadURL });
    profileImage.src = downloadURL;
    alert("Profile picture updated");
  });

  // Save Name & Bio
  saveDetailsBtn.addEventListener("click", async () => {
    await updateDoc(userRef, {
      fullName: nameInput.value,
      bio: bioInput.value
    });
    userName.textContent = nameInput.value;
    alert("Profile details updated");
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => window.location.href = "login.html");
  });

  // Dark mode toggle
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("bg-gray-900");
    document.body.classList.toggle("text-white");
  });

  // Delete Account (UI Only)
  deleteAccountBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your account? This is irreversible.")) {
      alert("You need to implement account deletion in Firebase Console or Cloud Function.");
    }
  });
});