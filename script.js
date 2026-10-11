// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD591mIObd4wYM44CC_qIjpt7zApu3M_o8",
  authDomain: "data-storage-323d9.firebaseapp.com",
  projectId: "data-storage-323d9",
  storageBucket: "data-storage-323d9.firebasestorage.app",
  messagingSenderId: "454552298889",
  appId: "1:454552298889:web:10bfc70798d489686c2d58",
  measurementId: "G-R4X205QQ57"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Grab the elements from HTML
const visitorList = document.querySelector("#visitor-list");
const visitorForm = document.querySelector("#visitor-form");
const nameInput = document.querySelector("#visitor-name");
const companyInput = document.querySelector("#company-visiting");
const visitorCount = document.querySelector("#visitor-count");
const emptyState = document.querySelector("#empty-state");
const statusBanner = document.querySelector("#status-banner");
const submitBtn = document.querySelector("#submit-btn");

// LISTEN to the 'visitors' collection in the cloud
onSnapshot(collection(db, "Visitors"), (snapshot) => {
  // Every time the cloud changes, clear the screen first
  visitorList.innerHTML = "";

  if (snapshot.empty) {
    if (emptyState) emptyState.classList.add("show");
    if (visitorCount) visitorCount.textContent = "0 Logged";
    return;
  }

  if (emptyState) emptyState.classList.remove("show");
  if (visitorCount) visitorCount.textContent = `${snapshot.size} Logged`;

  // Loop through all the documents currently in the cloud
  snapshot.forEach((doc) => {
    const visitor = doc.data(); // Extract the JSON object
    const name = visitor.Name || visitor.visitorName || visitor.Username || "Guest";
    const company = visitor.Company || visitor.companyVisiting || visitor.Company || "N/A";

    // Paint it onto the screen
    visitorList.innerHTML += `
      <li>
        <strong>${name}</strong>
        <br> Visiting: ${company}
      </li>
    `;
  });
}, (error) => {
  console.error("Firestore connection error:", error);
  if (statusBanner) {
    statusBanner.className = "status-banner error";
    statusBanner.innerHTML = `
      <strong>Firestore Notice:</strong> ${error.message}.<br>
      Make sure your Firestore Security Rules allow read/write: <code>allow read, write: if true;</code>
    `;
  }
});

// SUBMIT: Send visitor data to Firebase Firestore
if (visitorForm) {
  visitorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const company = companyInput.value.trim();

    if (!name || !company) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";
    }

    try {
      // Add document to the 'visitors' collection in Firestore
      await addDoc(collection(db, "visitors"), {
        name: name,
        company: company,
        createdAt: serverTimestamp()
      });

      // Clear the form
      visitorForm.reset();
      nameInput.focus();
    } catch (error) {
      console.error("Error saving visitor:", error);
      alert("Error saving visitor: " + error.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      }
    }
  });
}
