import { db } from "./firebase-config.js";
import { collection, addDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Donor Registration
const donorForm = document.getElementById("donorForm");

donorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const bloodGroup = document.getElementById("bloodGroup").value;
    const contact = document.getElementById("contact").value;

    try {
        await addDoc(collection(db, "donors"), {
            name: name,
            age: age,
            bloodGroup: bloodGroup,
            contact: contact,
            createdAt: new Date()
        });

        alert("Donor Registered Successfully ✅");
        donorForm.reset();
    } catch (error) {
        console.error("Error adding donor: ", error);
    }
});

// Blood Request
const requestForm = document.getElementById("requestForm");

requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const patientName = document.getElementById("patientName").value;
    const requiredBlood = document.getElementById("requiredBlood").value;
    const hospital = document.getElementById("hospital").value;

    try {
        await addDoc(collection(db, "requests"), {
            patientName: patientName,
            requiredBlood: requiredBlood,
            hospital: hospital,
            createdAt: new Date()
        });

        alert("Blood Request Submitted ✅");
        requestForm.reset();
    } catch (error) {
        console.error("Error adding request: ", error);
    }
});
