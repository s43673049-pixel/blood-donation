import { db, auth } from "../firebase-config.js";
import { maskPhone } from "../utils/privacy.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const tableBody = document.querySelector("#allDonorsTable tbody");
const searchNameInput = document.getElementById("searchName");
const filterBloodSelect = document.getElementById("filterBlood");
const filterCityInput = document.getElementById("filterCity");
const refreshDonorsBtn = document.getElementById("refreshDonorsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const logoutLink = document.getElementById("logoutLink");

let allDonors = [];

async function fetchDonors() {
  const donorsQuery = query(
    collection(db, "donors"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(donorsQuery);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() || {})
  }));
}

function applyFilters() {
  if (!tableBody) return;

  const nameTerm = (searchNameInput?.value || "").trim().toLowerCase();
  const bloodFilter = filterBloodSelect?.value || "";
  const cityFilter = (filterCityInput?.value || "").trim().toLowerCase();

  tableBody.innerHTML = "";

  const filtered = allDonors.filter((donor) => {
    const nameMatch = donor.name
      ? donor.name.toLowerCase().includes(nameTerm)
      : false;

    const bloodMatch = bloodFilter
      ? donor.bloodGroup === bloodFilter
      : true;

    const cityMatch = cityFilter
      ? (donor.city || "").toLowerCase().includes(cityFilter)
      : true;

    return nameMatch && bloodMatch && cityMatch;
  });

  filtered.forEach((donor, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${donor.name || "-"}</td>
      <td>${donor.bloodGroup || "-"}</td>
      <td>${maskPhone(donor.contact)}</td>
      <td>${donor.city || "-"}</td>
      <td>
        <button class="btn btn-delete" data-id="${donor.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

async function loadDonors() {
  try {
    if (tableBody) {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;">Loading donors...</td></tr>';
    }
    if (refreshDonorsBtn) {
      refreshDonorsBtn.disabled = true;
      refreshDonorsBtn.textContent = "Refreshing...";
    }

    allDonors = await fetchDonors();
    applyFilters();
  } catch (error) {
    console.error("Failed to load donors:", error);
  } finally {
    if (refreshDonorsBtn) {
      refreshDonorsBtn.disabled = false;
      refreshDonorsBtn.textContent = "Refresh";
    }
  }
}

async function handleDelete(id) {
  if (!id) return;

  const confirmed = window.confirm(
    "Are you sure you want to delete this donor?"
  );
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "donors", id));
    // remove locally and re-render
    allDonors = allDonors.filter((d) => d.id !== id);
    applyFilters();
  } catch (error) {
    console.error("Failed to delete donor:", error);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
  } finally {
    window.location.href = "../auth/login.html";
  }
}

// event wiring
if (tableBody) {
  tableBody.addEventListener("click", (e) => {
    const target = e.target;
    if (
      target instanceof HTMLElement &&
      target.matches("button.btn-delete")
    ) {
      const id = target.getAttribute("data-id");
      handleDelete(id);
    }
  });
}

if (searchNameInput) {
  searchNameInput.addEventListener("input", () => applyFilters());
}

if (filterBloodSelect) {
  filterBloodSelect.addEventListener("change", () => applyFilters());
}

if (filterCityInput) {
  filterCityInput.addEventListener("input", () => applyFilters());
}

if (refreshDonorsBtn) {
  refreshDonorsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loadDonors();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
}

if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
}

// protect this page: redirect to login if user not authenticated
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../auth/login.html";
    return;
  }

  // initial load once we know user is logged in
  loadDonors();
});

