import { db } from "../firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================
// DOM ELEMENTS
// ==========================

const form = document.getElementById("campForm");
const table = document.getElementById("campTable");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

const campsCollection = collection(db, "camps");


// ==========================
// FORMAT DATE
// ==========================

function formatDate(dateString) {

  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

}


// ==========================
// FORMAT TIME
// ==========================

function formatTime(timeString) {

  const [hour, minute] = timeString.split(":");

  const date = new Date();
  date.setHours(hour, minute);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

}


// ==========================
// GET STATUS
// ==========================

function getStatus(campDate) {

  const today = new Date().setHours(0,0,0,0);
  const camp = new Date(campDate).setHours(0,0,0,0);

  return camp < today ? "Completed" : "Upcoming";

}


// ==========================
// LOAD CAMPS
// ==========================

async function loadCamps() {

  try {

    const q = query(campsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    table.innerHTML = "";

    if (snapshot.empty) {

      table.innerHTML = `
        <tr>
          <td colspan="7">No camps found</td>
        </tr>
      `;
      return;
    }

    let index = 1;

    snapshot.forEach(docSnap => {

      const camp = docSnap.data();
      const id = docSnap.id;

      table.innerHTML += `
        <tr>

          <td>${index++}</td>

          <td>${camp.name}</td>

          <td>${camp.location}</td>

          <td>${formatDate(camp.date)}</td>

          <td>${formatTime(camp.time)}</td>

          <td>${getStatus(camp.date)}</td>

          <td>
            <button onclick="deleteCamp('${id}')">
              Delete
            </button>
          </td>

        </tr>
      `;
    });

  }
  catch (error) {

    console.error(error);
    message.textContent = "Error loading camps";

  }

}


// ==========================
// ADD CAMP
// ==========================

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = document.getElementById("campName").value.trim();
  const location = document.getElementById("campLocation").value.trim();
  const date = document.getElementById("campDate").value;
  const time = document.getElementById("campTime").value;

  if (!name || !location || !date || !time) {

    message.textContent = "All fields required";
    message.style.color = "red";
    return;

  }

  try {

    await addDoc(campsCollection, {

      name,
      location,
      date,
      time,
      createdAt: serverTimestamp()

    });

    message.textContent = "Camp created successfully";
    message.style.color = "green";

    form.reset();

    loadCamps();

  }
  catch (error) {

    console.error(error);

    message.textContent = "Failed to create camp";
    message.style.color = "red";

  }

});


// ==========================
// DELETE CAMP
// ==========================

window.deleteCamp = async function(id) {

  if (!confirm("Delete this camp?")) return;

  try {

    await deleteDoc(doc(db, "camps", id));

    loadCamps();

  }
  catch (error) {

    console.error(error);

  }

};


// ==========================
// REFRESH BUTTON
// ==========================

refreshBtn.addEventListener("click", () => {

  loadCamps();

});


// ==========================
// INITIAL LOAD
// ==========================

loadCamps();