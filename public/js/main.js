import { db } from "./firebase-config.js";
import { maskPhone } from "./utils/privacy.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const donorCountEl = document.getElementById("donorCount");
const donationCountEl = document.getElementById("donationCount");
const campCountEl = document.getElementById("campCount");
const facilityCountEl = document.getElementById("facilityCount");
const donorTable = document.getElementById("donorTable");
const systemStatusEl = document.getElementById("systemStatus");

async function loadDashboard() {
  try {
    if (donorCountEl) donorCountEl.textContent = "...";
    if (donationCountEl) donationCountEl.textContent = "...";
    if (campCountEl) campCountEl.textContent = "...";
    if (facilityCountEl) facilityCountEl.textContent = "...";

    if (donorTable) {
      donorTable.innerHTML =
        '<tr><td colspan="4" style="text-align:center;">Loading donors...</td></tr>';
    }

    const donorsSnap = await getDocs(collection(db, "donors"));
    const donationsSnap = await getDocs(collection(db, "donations"));
    const campsSnap = await getDocs(collection(db, "camps"));
    const facilitiesSnap = await getDocs(collection(db, "facilities"));

    if (donorCountEl) donorCountEl.textContent = String(donorsSnap.size);
    if (donationCountEl)
      donationCountEl.textContent = String(donationsSnap.size || 0);
    if (campCountEl) campCountEl.textContent = String(campsSnap.size || 0);
    if (facilityCountEl)
      facilityCountEl.textContent = String(facilitiesSnap.size || 0);

    const q = query(
      collection(db, "donors"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const snapshot = await getDocs(q);

    if (donorTable) {
      donorTable.innerHTML = "";
      snapshot.forEach((docSnap) => {
        const donor = docSnap.data() || {};
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${donor.name || "-"}</td>
          <td>${donor.bloodGroup || "-"}</td>
          <td>${maskPhone(donor.contact)}</td>
          <td><button>Contact</button></td>
        `;
        donorTable.appendChild(tr);
      });

      if (!snapshot.size) {
        donorTable.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">No donors yet.</td></tr>';
      }
    }

    if (systemStatusEl) {
      systemStatusEl.textContent = "System Status: Online";
    }
  } catch (error) {
    console.error("Failed to load landing dashboard:", error);
    if (systemStatusEl) {
      systemStatusEl.textContent = "System Status: Offline";
    }
  }
}

loadDashboard();

