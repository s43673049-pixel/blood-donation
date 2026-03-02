import { auth } from "../firebase-config.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const messageEl = document.getElementById("loginMessage");

// if already logged in, go straight to admin dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "../admin/admin.html";
  }
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      if (messageEl) {
        messageEl.textContent = "Please enter email and password.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      if (messageEl) {
        messageEl.textContent = "Please enter a valid email address.";
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
      return;
    }

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";
    }
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.classList.remove("error", "success");
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (messageEl) {
        messageEl.textContent = "Login successful, redirecting...";
        messageEl.classList.remove("error");
        messageEl.classList.add("success");
      }

      // redirect to admin dashboard
      setTimeout(() => {
        window.location.href = "../admin/admin.html";
      }, 800);
    } catch (error) {
      console.error("Login failed:", error);
      if (messageEl) {
        let text = "Login failed. Please check your credentials.";
        if (error && typeof error === "object" && "code" in error) {
          const code = /** @type {{ code?: string }} */ (error).code || "";
          if (code === "auth/user-not-found") {
            text = "No user found with this email.";
          } else if (code === "auth/wrong-password") {
            text = "Incorrect password.";
          }
        }
        messageEl.textContent = text;
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
    }
  });
}

