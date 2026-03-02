import { db } from "../firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("donorForm");
const alertBox = document.getElementById("successAlert");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const contact = document.getElementById("contact")?.value.trim();
    const bloodGroup = document.getElementById("bloodGroup")?.value;
    const city = document.getElementById("city")?.value.trim();

    // basic front‑end validation
    if (!name || !email || !contact || !bloodGroup || !city) {
      if (messageEl) {
        messageEl.textContent = "Please fill in all required fields.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
      return;
    }

    // optional simple email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      if (messageEl) {
        messageEl.textContent = "Please enter a valid email address.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";
    }
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.classList.remove("error", "success");
    }

    try {
      await addDoc(collection(db, "donors"), {
        name,
        email,
        contact,
        bloodGroup,
        city,
        createdAt: serverTimestamp()
      });

      if (alertBox) {
        alertBox.classList.add("show");
        setTimeout(() => {
          alertBox.classList.remove("show");
        }, 3000);
      }

      // clear any previous error text so only the green alert shows on success
      if (messageEl) {
        messageEl.textContent = "";
        messageEl.classList.remove("error", "success");
      }

      form.reset();
    } catch (error) {
      console.error("Registration failed:", error);
      if (messageEl) {
        messageEl.textContent =
          "Registration failed. Please try again in a moment.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
      }
    }
  });
}