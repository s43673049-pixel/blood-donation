import { auth, db } from "../firebase/firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.getElementById("btn").addEventListener("click", async () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const user = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered:", user);
    } catch (error) {
        console.error("Error registering user:", error);
    }
});