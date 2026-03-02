// admin-dashboard.js

import { db, auth } from "../firebase-config.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ==========================
// DOM Elements
// ==========================

const totalDonorsEl = document.getElementById("totalDonors");
const activeCampsEl = document.getElementById("activeCamps");
const bloodRequestsEl = document.getElementById("bloodRequests");

const donorsTableBody = document.querySelector("#donorsTable tbody");

const logoutBtn = document.getElementById("logoutBtn");
const logoutLink = document.getElementById("logoutLink");


// ==========================
// REALTIME LISTENER: DONORS
// ==========================

function listenToDonors() {

  const donorsQuery = query(
    collection(db, "donors"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(donorsQuery, (snapshot) => {

    // Update count
    if (totalDonorsEl) {
      totalDonorsEl.textContent = snapshot.size;
    }

    // Update table
    if (donorsTableBody) {

      donorsTableBody.innerHTML = "";

      if (snapshot.empty) {

        donorsTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;">
              No donors found
            </td>
          </tr>
        `;

        return;
      }

      snapshot.docs.slice(0, 10).forEach((document, index) => {

        const data = document.data();

        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${data.name || "-"}</td>
          <td>${data.bloodGroup || "-"}</td>
          <td>${data.contact || "-"}</td>
          <td>${data.city || "-"}</td>
        `;

        donorsTableBody.appendChild(row);

      });

    }

  }, (error) => {

    console.error("Donors listener failed:", error);

  });

}


// ==========================
// REALTIME LISTENER: CAMPS
// ==========================

function listenToCamps() {

  return onSnapshot(collection(db, "camps"), (snapshot) => {

    if (activeCampsEl) {
      activeCampsEl.textContent = snapshot.size;
    }

  });

}


// ==========================
// REALTIME LISTENER: REQUESTS
// ==========================

function listenToRequests() {

  return onSnapshot(collection(db, "requests"), (snapshot) => {

    if (bloodRequestsEl) {
      bloodRequestsEl.textContent = snapshot.size;
    }

  });

}


// ==========================
// VERIFY USER FUNCTION
// ==========================

async function verifyUser(userId) {

  try {

    await updateDoc(
      doc(db, "verifications", userId),
      {
        status: "verified"
      }
    );

    console.log("User verified:", userId);

  } catch (error) {

    console.error("Verification failed:", error);

  }

}

window.verifyUser = verifyUser;


// ==========================
// LOGOUT
// ==========================

async function handleLogout() {

  try {

    await signOut(auth);

    window.location.href = "../auth/login.html";

  } catch (error) {

    console.error("Logout failed:", error);

  }

}


if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

if (logoutLink) logoutLink.addEventListener("click", handleLogout);


// ==========================
// AUTH PROTECTION + START LISTENERS
// ==========================

let unsubscribeDonors;
let unsubscribeCamps;
let unsubscribeRequests;

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "../auth/login.html";
    return;

  }

  // Start realtime listeners

  unsubscribeDonors = listenToDonors();
  unsubscribeCamps = listenToCamps();
  unsubscribeRequests = listenToRequests();

});


// ==========================
// NAV ACTIVE LINK
// ==========================

const navLinks = document.querySelectorAll(".nav-link");

const currentPage =
  window.location.pathname.split("/").pop();

navLinks.forEach(link => {

  if (link.getAttribute("href") === currentPage) {

    link.classList.add("active");

  }

});