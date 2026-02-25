// event listeners for form submissions, button clicks, and page interactions
// global initialization code for setting up the application state and UI components
// routes and navigation handling for single-page application behavior

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadDashboard(){
    const donors = await getDocs(collection(db, "donors"));
    const donations = await getDocs(collection(db, "donations"));
    const camps = await getDocs(collection(db, "camps"));
    const facilities = await getDocs(collection(db, "facilities"));

    document.getElementById("donorCount").textContent = donors.size;
    document.getElementById("donationCount").textContent = donations.size;
    document.getElementById("campCount").textContent = camps.size;
    document.getElementById("facilityCount").textContent = facilities.size;

    const q = query(collection(db, "donors"), orderBy("createdAt", "desc"), limit(5));
    const snapshot = await getDocs(q);
    const table = document.getElementById("donorTable");
    table.innerHTML = "";

    snapshot.forEach(doc => {
        const donor = doc.data();
        table.innerHTML += `<tr><td>${donor.name}</td><td>${donor.bloodGroup}</td><td>${donor.contact}</td></tr>`;
    });
}

document.getElementById("refreshBtn").addEventListener("click", loadDashboard);
loadDashboard();

