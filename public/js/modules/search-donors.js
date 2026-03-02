import { db } from "../firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("searchForm");
const bloodSelect = document.getElementById("searchBlood");
const cityInput = document.getElementById("searchCity");
const nameInput = document.getElementById("searchName");
const searchBtn = document.getElementById("searchBtn");
const messageEl = document.getElementById("searchMessage");
const resultsTbody = document.querySelector(
  "#searchResultsTable tbody"
);

let allDonors = null; // cache

async function loadDonorsOnce() {
  if (allDonors) return allDonors;

  if (resultsTbody) {
    resultsTbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Loading donors...</td></tr>';
  }

  const donorsQuery = query(
    collection(db, "donors"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(donorsQuery);

  allDonors = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() || {})
  }));

  return allDonors;
}

function renderResults(list) {
  if (!resultsTbody) return;

  resultsTbody.innerHTML = "";

  if (!list.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="text-align:center;">No matching donors found.</td>`;
    resultsTbody.appendChild(tr);
    return;
  }

  list.forEach((donor, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${donor.name || "-"}</td>
      <td>${donor.bloodGroup || "-"}</td>
      <td>${donor.city || "-"}</td>
      <td>${donor.contact || "-"}</td>
    `;
    resultsTbody.appendChild(tr);
  });
}

async function handleSearch(e) {
  e.preventDefault();

  const blood = bloodSelect?.value || "";
  const city = (cityInput?.value || "").trim().toLowerCase();
  const name = (nameInput?.value || "").trim().toLowerCase();

  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
  }
  if (messageEl) {
    messageEl.textContent = "";
    messageEl.classList.remove("error", "success");
  }

  try {
    const donors = await loadDonorsOnce();

    const filtered = donors.filter((d) => {
      const bloodMatch = blood ? d.bloodGroup === blood : true;
      const cityMatch = city
        ? (d.city || "").toLowerCase().includes(city)
        : true;
      const nameMatch = name
        ? (d.name || "").toLowerCase().includes(name)
        : true;
      return bloodMatch && cityMatch && nameMatch;
    });

    renderResults(filtered);

    if (messageEl) {
      messageEl.textContent = `Found ${filtered.length} donor(s).`;
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    }
  } catch (error) {
    console.error("Failed to search donors:", error);
    if (messageEl) {
      messageEl.textContent =
        "Failed to load donors. Please try again in a moment.";
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
    }
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search";
    }
  }
}

if (form) {
  form.addEventListener("submit", handleSearch);
}

// optional: show all donors on first load
(async () => {
  try {
    const donors = await loadDonorsOnce();
    renderResults(donors);
    if (messageEl) {
      messageEl.textContent = `Showing ${donors.length} donor(s). Use filters to narrow results.`;
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    }
  } catch (error) {
    console.error("Failed to load donors on init:", error);
  }
})();

