import { db } from "../firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitRequestBtn");
const messageEl = document.getElementById("message");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const patientName = document.getElementById("patientName")?.value.trim();
    const requiredBlood = document.getElementById("requiredBlood")?.value;
    const units = document.getElementById("units")?.value;
    const hospital = document.getElementById("hospital")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const contact = document.getElementById("contact")?.value.trim();
    const urgency = document.getElementById("urgency")?.value;
    const notes = document.getElementById("notes")?.value.trim();

    if (
      !patientName ||
      !requiredBlood ||
      !units ||
      !hospital ||
      !city ||
      !contact ||
      !urgency
    ) {
      if (messageEl) {
        messageEl.textContent = "Please fill in all required fields.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.classList.remove("error", "success");
    }

    try {
      await addDoc(collection(db, "requests"), {
        patientName,
        requiredBlood,
        units: Number(units),
        hospital,
        city,
        contact,
        urgency,
        notes,
        createdAt: serverTimestamp()
      });

      if (messageEl) {
        messageEl.textContent = "Blood request submitted successfully.";
        messageEl.classList.remove("error");
        messageEl.classList.add("success");
      }

      form.reset();
    } catch (error) {
      console.error("Error adding request: ", error);
      if (messageEl) {
        messageEl.textContent =
          "Failed to submit request. Please try again in a moment.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
      }
    }
  });
}
