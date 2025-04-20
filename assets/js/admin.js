// Import Firebase modules
//import { initializeApp } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.8.0/firebase-app.min.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut ,
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getStorage, 
  ref, 
  getDownloadURL ,
  auth,
  storage,
  db
} from "./firebase-init.js";

// Your Firebase configuration
/*
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "college-notes-app.firebaseapp.com",
  projectId: "college-notes-app",
  storageBucket: "college-notes-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
*/
// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const auth = getAuth(app);
//const db = getFirestore(app);
//const storage = getStorage(app);

// DOM Elements
const userCountElement = document.getElementById('userCount');
const notesCountElement = document.getElementById('notesCount');
const pendingApprovalsElement = document.getElementById('pendingApprovals');
const totalDownloadsElement = document.getElementById('totalDownloads');
const pendingNotesTableBody = document.getElementById('pendingNotesTableBody');
const recentUsersContainer = document.getElementById('recentUsersContainer');
const popularNotesContainer = document.getElementById('popularNotesContainer');
const logoutButton = document.getElementById('logoutButton');
const userProfileElement = document.getElementById('userProfile');

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    checkAdminRole(user.uid);
    displayUserProfile(user);
  } else {
    // User is signed out, redirect to login
    window.location.href = 'login.html';
  }
});

// Check if user has admin role
async function checkAdminRole(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role !== "admin" ) {
        // Not an admin, redirect to home
        alert("You don't have permission to access the admin dashboard");
        window.location.href = 'index.html';
      } else {
        // User is admin, load dashboard data
        loadDashboardData();
      }
    } else {
      console.error("No user found!");
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error("Error checking admin role:", error);
  }
}

// Display user profile information
function displayUserProfile(user) {
  if (userProfileElement) {
    getDoc(doc(db, "users", user.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        userProfileElement.innerHTML = `
          <p class="text-sm font-medium">${userData.displayName || user.email}</p>
          <a href="#" id="logoutButton" class="text-xs text-gray-400 hover:text-white">Logout</a>
        `;
        document.getElementById("adminPhoto").src = user.photoURL;
        // Add event listener to logout button
        document.getElementById('logoutButton').addEventListener('click', handleLogout);
      }
    });
  }
}

// Handle user logout
function handleLogout() {
  signOut(auth).then(() => {
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error("Error signing out:", error);
  });
}

// Load all dashboard data
async function loadDashboardData() {
  fetchUserStatistics();
  fetchNotesStatistics();
  fetchPendingApprovals();
  fetchRecentUsers();
  fetchPopularNotes();
}

// Fetch user statistics
async function fetchUserStatistics() {
  try {
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const totalUsers = usersSnap.size;
    
    if (userCountElement) {
      userCountElement.textContent = totalUsers.toLocaleString();
    }
    
    // Get last month's user count for comparison
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const lastMonthQuery = query(
      collection(db, "users"),
      where("createdAt", "<", lastMonthDate)
    );
    
    const lastMonthSnap = await getDocs(lastMonthQuery);
    const lastMonthCount = lastMonthSnap.size;
    
    // Calculate growth percentage
    if (lastMonthCount > 0) {
      const growthPercentage = ((totalUsers - lastMonthCount) / lastMonthCount) * 100;
      document.getElementById('userGrowth').textContent = `${growthPercentage.toFixed(1)}% increase`;
    }
  } catch (error) {
    console.error("Error fetching user statistics:", error);
  }
}

// Fetch notes statistics
async function fetchNotesStatistics() {
  try {
    // Total notes count
    const notesRef = collection(db, "notes");
    const notesSnap = await getDocs(notesRef);
    const totalNotes = notesSnap.size;
    
    if (notesCountElement) {
      notesCountElement.textContent = totalNotes.toLocaleString();
    }
    
    // Pending approvals count
    const pendingQuery = query(
      collection(db, "notes"),
      where("status", "==", "pending")
    );
    
    const pendingSnap = await getDocs(pendingQuery);
    const pendingCount = pendingSnap.size;
    
    if (pendingApprovalsElement) {
      pendingApprovalsElement.textContent = pendingCount;
    }
    
    // Total downloads count
    const statsRef = doc(db, "statistics", "downloads");
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists() && totalDownloadsElement) {
      const totalDownloads = statsSnap.data().total;
      totalDownloadsElement.textContent = (totalDownloads / 1000).toFixed(1) + "k";
    }
  } catch (error) {
    console.error("Error fetching notes statistics:", error);
  }
}

// Fetch pending approval notes
async function fetchPendingApprovals() {
  try {
    const pendingQuery = query(
      collection(db, "notes"),
      where("status", "==", "pending"),
      orderBy("uploadDate", "desc"),
      limit(10)
    );
    
    const pendingSnap = await getDocs(pendingQuery);
    
    if (pendingNotesTableBody) {
      pendingNotesTableBody.innerHTML = ''; // Clear existing content
      
      if (pendingSnap.empty) {
        pendingNotesTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              No pending notes found
            </td>
          </tr>
        `;
        return;
      }
      
      // Process each pending note
      pendingSnap.forEach(async (noteDoc) => {
        const noteData = noteDoc.data();
        const noteId = noteDoc.id;
        
        // Get uploader data
        const uploaderRef = doc(db, "users", noteData.uploaderId);
        const uploaderSnap = await getDoc(uploaderRef);
        const uploaderData = uploaderSnap.exists() ? uploaderSnap.data() : { displayName: "Unknown User" };
        
        // Format date
        const uploadDate = noteData.uploadDate.toDate ? noteData.uploadDate.toDate() : new Date(noteData.uploadDate);
        const formattedDate = uploadDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Get file icon based on file type
        let fileIcon = 'fas fa-file';
        switch (noteData.fileType) {
          case 'pdf':
            fileIcon = 'fas fa-file-pdf text-red-500';
            break;
          case 'doc':
          case 'docx':
            fileIcon = 'fas fa-file-word text-blue-500';
            break;
          case 'ppt':
          case 'pptx':
            fileIcon = 'fas fa-file-powerpoint text-orange-500';
            break;
          case 'xls':
          case 'xlsx':
            fileIcon = 'fas fa-file-excel text-green-500';
            break;
        }
        
        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <i class="${fileIcon} mr-2"></i>
              <div class="text-sm font-medium text-gray-900">${noteData.title}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${noteData.subject}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <img class="h-8 w-8 rounded-full" src="${uploaderData.photoURL || '/api/placeholder/32/32'}" alt="User avatar">
              <div class="ml-2 text-sm font-medium text-gray-900">${uploaderData.displayName}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedDate}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <button class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs mr-2 hover:bg-green-200" 
                    data-note-id="${noteId}" 
                    onclick="approveNote('${noteId}')">Approve</button>
            <button class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs hover:bg-red-200" 
                    data-note-id="${noteId}" 
                    onclick="rejectNote('${noteId}')">Reject</button>
          </td>
        `;
        
        pendingNotesTableBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
  }
}

// Approve a note
window.approveNote = async function(noteId) {
  try {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      status: "approved",
      approvedAt: new Date(),
      approvedBy: auth.currentUser.uid
    });
    
    // Refresh the pending approvals list
    fetchPendingApprovals();
    fetchNotesStatistics();
    
    // Show success message
    showNotification("Note approved successfully", "success");
  } catch (error) {
    console.error("Error approving note:", error);
    showNotification("Failed to approve note", "error");
  }
}

// Reject a note
window.rejectNote = async function(noteId) {
  try {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: auth.currentUser.uid
    });
    
    // Refresh the pending approvals list
    fetchPendingApprovals();
    fetchNotesStatistics();
    
    // Show success message
    showNotification("Note rejected", "success");
  } catch (error) {
    console.error("Error rejecting note:", error);
    showNotification("Failed to reject note", "error");
  }
}

// Fetch recent users
async function fetchRecentUsers() {
  try {
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(4)
    );
    
    const usersSnap = await getDocs(usersQuery);
    
    if (recentUsersContainer) {
      recentUsersContainer.innerHTML = ''; // Clear existing content
      
      usersSnap.forEach((userDoc) => {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        // Determine user status class
        let statusClass = "bg-green-100 text-green-800";
        let statusText = "Active";
        
        if (userData.status === "suspended") {
          statusClass = "bg-red-100 text-red-800";
          statusText = "Suspended";
        } else if (userData.status === "pending") {
          statusClass = "bg-yellow-100 text-yellow-800";
          statusText = "Pending";
        }
        
        // Create user card
        const userCard = document.createElement('div');
        userCard.className = "flex items-center justify-between";
        userCard.innerHTML = `
          <div class="flex items-center">
            <img class="h-10 w-10 rounded-full" src="${userData.photoURL || '/api/placeholder/40/40'}" alt="User avatar">
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">${userData.displayName || userData.email}</div>
              <div class="text-sm text-gray-500">${userData.email}</div>
            </div>
          </div>
          <div class="flex space-x-2">
            <span class="${statusClass} text-xs px-2 py-1 rounded-full">${statusText}</span>
            <div class="dropdown relative">
              <button class="text-gray-400 hover:text-gray-500" id="user-dropdown-${userId}">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div class="dropdown-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" 
                   id="dropdown-content-${userId}">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                   onclick="viewUserDetails('${userId}')">View Details</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                   onclick="toggleUserStatus('${userId}', '${userData.status}')">
                   ${userData.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100" 
                   onclick="deleteUser('${userId}')">Delete User</a>
              </div>
            </div>
          </div>
        `;
        
        recentUsersContainer.appendChild(userCard);
        
        // Add dropdown toggle functionality
        document.getElementById(`user-dropdown-${userId}`).addEventListener('click', function() {
          document.getElementById(`dropdown-content-${userId}`).classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        window.addEventListener('click', function(event) {
          if (!event.target.matches(`#user-dropdown-${userId}`) && 
              !event.target.closest(`#user-dropdown-${userId}`)) {
            const dropdown = document.getElementById(`dropdown-content-${userId}`);
            if (!dropdown.classList.contains('hidden')) {
              dropdown.classList.add('hidden');
            }
          }
        });
      });
    }
  } catch (error) {
    console.error("Error fetching recent users:", error);
  }
}

// View user details
window.viewUserDetails = function(userId) {
  // Redirect to user details page with user ID
  window.location.href = `user-details.html?id=${userId}`;
}

// Toggle user status (activate/suspend)
window.toggleUserStatus = async function(userId, currentStatus) {
  try {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    
    await updateDoc(doc(db, "users", userId), {
      status: newStatus,
      updatedAt: new Date()
    });
    
    // Refresh recent users
    fetchRecentUsers();
    
    // Show success message
    showNotification(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`, "success");
  } catch (error) {
    console.error("Error updating user status:", error);
    showNotification("Failed to update user status", "error");
  }
}

// Delete user (this would typically require additional checks and confirmations)
window.deleteUser = async function(userId) {
  // Show confirmation dialog
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    return;
  }
  
  try {
    // In a real app, you might want to:
    // 1. Delete user's content (notes, comments, etc.)
    // 2. Update statistics
    // 3. Delete user authentication record
    
    // For now, just delete the user document
    await deleteDoc(doc(db, "users", userId));
    
    // Refresh recent users
    fetchRecentUsers();
    fetchUserStatistics();
    
    // Show success message
    showNotification("User deleted successfully", "success");
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification("Failed to delete user", "error");
  }
}

// Fetch popular notes
async function fetchPopularNotes() {
  try {
    const notesQuery = query(
      collection(db, "notes"),
      where("status", "==", "approved"),
      orderBy("downloadCount", "desc"),
      limit(4)
    );
    
    const notesSnap = await getDocs(notesQuery);
    
    if (popularNotesContainer) {
      popularNotesContainer.innerHTML = ''; // Clear existing content
      
      notesSnap.forEach((noteDoc) => {
        const noteData = noteDoc.data();
        
        // Determine file icon class based on file type
        let fileIconClass = "bg-blue-100";
        let fileIcon = "fas fa-file-alt text-blue-500";
        
        switch (noteData.fileType) {
          case 'pdf':
            fileIconClass = "bg-red-100";
            fileIcon = "fas fa-file-pdf text-red-500";
            break;
          case 'doc':
          case 'docx':
            fileIconClass = "bg-purple-100";
            fileIcon = "fas fa-file-word text-purple-500";
            break;
          case 'xls':
          case 'xlsx':
            fileIconClass = "bg-green-100";
            fileIcon = "fas fa-file-excel text-green-500";
            break;
          case 'ppt':
          case 'pptx':
            fileIconClass = "bg-orange-100";
            fileIcon = "fas fa-file-powerpoint text-orange-500";
            break;
        }
        
        // Create note card
        const noteCard = document.createElement('div');
        noteCard.className = "flex items-center justify-between";
        noteCard.innerHTML = `
          <div class="flex items-center">
            <div class="${fileIconClass} p-3 rounded-lg">
              <i class="${fileIcon}"></i>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">${noteData.title}</div>
              <div class="text-sm text-gray-500">${noteData.subject} • ${noteData.pageCount || 'N/A'} Pages</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-gray-900">${noteData.downloadCount.toLocaleString()}</div>
            <div class="text-xs text-gray-500">downloads</div>
          </div>
        `;
        
        popularNotesContainer.appendChild(noteCard);
      });
    }
  } catch (error) {
    console.error("Error fetching popular notes:", error);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
    type === 'success' ? 'bg-green-600' : 
    type === 'error' ? 'bg-red-600' : 
    'bg-blue-600'
  }`;
  notification.innerHTML = message;
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Logout button
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        // Implement search functionality here
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          console.log("Searching for:", searchTerm);
          // Implement search logic
        }
      }
    });
  }
});

// Export functions for global access
window.handleLogout = handleLogout;