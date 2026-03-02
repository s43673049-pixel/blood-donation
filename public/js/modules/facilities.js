import { db } from "../firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// DOM elements
const nameInput = document.getElementById("name");
const cityInput = document.getElementById("city");
const contactInput = document.getElementById("contact");
const tableBody = document.getElementById("table");
const searchInput = document.getElementById("search");


// Firestore collection reference
const facilitiesRef = collection(db, "facilities");


// ==========================
// LOAD FACILITIES (Realtime)
// ==========================

function loadFacilities() {

  const q = query(facilitiesRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {

    if (snapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty">No facilities found</td>
        </tr>
      `;
      return;
    }

    let html = "";
    let index = 1;

    snapshot.forEach(docSnap => {

      const facility = docSnap.data();
      const id = docSnap.id;

      html += `
        <tr>
          <td>${index++}</td>
          <td>${facility.name}</td>
          <td>—</td>
          <td>${facility.contact}</td>
          <td>${facility.city}</td>
          <td>
            <button class="delete-btn" data-id="${id}">
              Delete
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

  }, error => {
    console.error("Error loading facilities:", error);
  });

}


// ==========================
// ADD FACILITY
// ==========================

window.addFacility = async function () {

  const name = nameInput.value.trim();
  const city = cityInput.value.trim();
  const contact = contactInput.value.trim();

  if (!name || !city || !contact) {
    alert("All fields required");
    return;
  }

  try {

    await addDoc(facilitiesRef, {
      name,
      city,
      contact,
      createdAt: serverTimestamp()
    });

    nameInput.value = "";
    cityInput.value = "";
    contactInput.value = "";

    alert("Facility added successfully");

  }
  catch (error) {
    console.error("Add failed:", error);
    alert("Failed to add facility");
  }

};


// ==========================
// DELETE FACILITY
// ==========================

tableBody.addEventListener("click", async (e) => {

  if (!e.target.classList.contains("delete-btn")) return;

  const id = e.target.dataset.id;

  if (!confirm("Delete this facility?")) return;

  try {

    await deleteDoc(doc(db, "facilities", id));

  }
  catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete");
  }

});


// ==========================
// SEARCH FACILITY
// ==========================

searchInput.addEventListener("input", () => {

  const term = searchInput.value.toLowerCase();

  const rows = tableBody.querySelectorAll("tr");

  rows.forEach(row => {

    const text = row.textContent.toLowerCase();

    row.style.display =
      text.includes(term) ? "" : "none";

  });

});


// ==========================
// INITIAL LOAD
// ==========================

loadFacilities();