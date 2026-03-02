import { db, auth } from "../firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const tableBody = document.querySelector("#requestsTable tbody");
const filterReqBlood = document.getElementById("filterReqBlood");
const filterReqCity = document.getElementById("filterReqCity");
const filterUrgency = document.getElementById("filterUrgency");
const refreshRequestsBtn = document.getElementById("refreshRequestsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const logoutLink = document.getElementById("logoutLink");

let allRequests = [];

async function fetchRequests() {
  const requestsQuery = query(
    collection(db, "requests"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(requestsQuery);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() || {})
  }));
}

function formatTimestamp(ts) {
  if (!ts) return "-";
  try {
    // serverTimestamp -> Firestore Timestamp with toDate()
    if (typeof ts.toDate === "function") {
      return ts.toDate().toLocaleString();
    }
  } catch {
    // ignore
  }
  return "-";
}

function applyFilters() {
  if (!tableBody) return;

  const bloodFilter = filterReqBlood?.value || "";
  const cityFilter = (filterReqCity?.value || "").trim().toLowerCase();
  const urgencyFilter = filterUrgency?.value || "";

  tableBody.innerHTML = "";

  const filtered = allRequests.filter((req) => {
    const bloodMatch = bloodFilter
      ? req.requiredBlood === bloodFilter
      : true;

    const cityMatch = cityFilter
      ? (req.city || "").toLowerCase().includes(cityFilter)
      : true;

    const urgencyMatch = urgencyFilter
      ? req.urgency === urgencyFilter
      : true;

    return bloodMatch && cityMatch && urgencyMatch;
  });

  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="10" style="text-align:center;">No matching requests found.</td>';
    tableBody.appendChild(tr);
    return;
  }

  filtered.forEach((req, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${req.patientName || "-"}</td>
      <td>${req.requiredBlood || "-"}</td>
      <td>${req.units ?? "-"}</td>
      <td>${req.hospital || "-"}</td>
      <td>${req.city || "-"}</td>
      <td>${req.contact || "-"}</td>
      <td>${req.urgency || "-"}</td>
      <td>${req.notes || "-"}</td>
      <td>${formatTimestamp(req.createdAt)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

async function loadRequests() {
  try {
    if (tableBody) {
      tableBody.innerHTML =
        '<tr><td colspan="10" style="text-align:center;">Loading requests...</td></tr>';
    }
    if (refreshRequestsBtn) {
      refreshRequestsBtn.disabled = true;
      refreshRequestsBtn.textContent = "Refreshing...";
    }

    allRequests = await fetchRequests();
    applyFilters();
  } catch (error) {
    console.error("Failed to load requests:", error);
  } finally {
    if (refreshRequestsBtn) {
      refreshRequestsBtn.disabled = false;
      refreshRequestsBtn.textContent = "Refresh";
    }
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

if (filterReqBlood) {
  filterReqBlood.addEventListener("change", () => applyFilters());
}

if (filterReqCity) {
  filterReqCity.addEventListener("input", () => applyFilters());
}

if (filterUrgency) {
  filterUrgency.addEventListener("change", () => applyFilters());
}

if (refreshRequestsBtn) {
  refreshRequestsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loadRequests();
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

  // initial load for authenticated user
  loadRequests();
});

