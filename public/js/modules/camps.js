import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// DOM ELEMENTS
const form = document.getElementById("campForm");
const table = document.getElementById("campTable");
const message = document.getElementById("message");

const campNameInput = document.getElementById("campName");
const campLocationInput = document.getElementById("campLocation");
const campDateInput = document.getElementById("campDate");
const campTimeInput = document.getElementById("campTime");

const logoutBtn = document.getElementById("logoutBtn");


// COLLECTION REF
const campsCollection = collection(db, "camps");


// LOAD CAMPS
async function loadCamps() {

  table.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

  try {

    const snapshot = await getDocs(campsCollection);

    if (snapshot.empty) {

      table.innerHTML =
        "<tr><td colspan='7'>No camps found</td></tr>";

      return;
    }

    let html = "";
    let index = 1;

    const today = new Date().toISOString().split("T")[0];

    snapshot.forEach((campDoc) => {

      const camp = campDoc.data();
      const id = campDoc.id;

      const status =
        camp.date >= today ? "Upcoming" : "Past";

      html += `
        <tr>
          <td>${index++}</td>
          <td>${camp.name}</td>
          <td>${camp.location}</td>
          <td>${camp.date}</td>
          <td>${camp.time}</td>

          <td>
            <span class="status ${status.toLowerCase()}">
              ${status}
            </span>
          </td>

          <td>
            <button
              onclick="deleteCamp('${id}')"
              class="deleteBtn">
              Delete
            </button>
          </td>

        </tr>
      `;
    });

    table.innerHTML = html;

  }
  catch (error) {

    table.innerHTML =
      `<tr><td colspan="7">${error.message}</td></tr>`;

  }

}


// INITIAL LOAD
loadCamps();


// CREATE CAMP
form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = campNameInput.value.trim();
  const location = campLocationInput.value.trim();
  const date = campDateInput.value;
  const time = campTimeInput.value;

  if (!name || !location || !date || !time) {

    message.style.color = "red";
    message.innerText = "All fields required";
    return;
  }

  try {

    message.innerText = "Creating...";

    await addDoc(campsCollection, {
      name,
      location,
      date,
      time,
      createdAt: serverTimestamp()
    });

    message.style.color = "green";
    message.innerText = "Camp created successfully";

    form.reset();

    loadCamps();

  }
  catch (error) {

    message.style.color = "red";
    message.innerText = error.message;

  }

});


// DELETE CAMP
window.deleteCamp = async (id) => {

  const confirmDelete =
    confirm("Delete this camp?");

  if (!confirmDelete) return;

  try {

    await deleteDoc(doc(db, "camps", id));

    loadCamps();

  }
  catch (error) {

    alert(error.message);

  }

};


// LOGOUT
logoutBtn.onclick = () => {

  localStorage.clear();

  location.href = "../../index.html";

};