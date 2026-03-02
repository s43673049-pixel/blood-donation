import { db, storage } from "../firebase.js";

import {
doc,
setDoc,
getDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
ref,
uploadBytes,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


const form = document.getElementById("form");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

const statusText = document.getElementById("status");
const message = document.getElementById("message");

let uploadedFile = null;


/* ======================
FILE SELECT
====================== */

fileInput.addEventListener("change", e => {

uploadedFile = e.target.files[0];

preview.src = URL.createObjectURL(uploadedFile);

preview.hidden = false;

});


/* ======================
LOAD STATUS
====================== */

async function loadStatus(userId){

const docRef = doc(db, "verifications", userId);

const snap = await getDoc(docRef);

if(snap.exists()){

const data = snap.data();

statusText.textContent = data.status;

statusText.className = data.status;

}

}


/* ======================
SUBMIT
====================== */

form.addEventListener("submit", async e => {

e.preventDefault();

const userId = document.getElementById("userId").value;

if(!uploadedFile){

message.textContent = "Upload ID proof";
message.style.color = "red";
return;

}

try{

/* upload file */

const storageRef = ref(storage,
"verificationFiles/" + userId + "_" + uploadedFile.name
);

await uploadBytes(storageRef, uploadedFile);

const fileURL = await getDownloadURL(storageRef);


/* save firestore */

await setDoc(doc(db, "verifications", userId), {

userId,
fileURL,
status: "review",
createdAt: serverTimestamp()

});


message.textContent = "Verification submitted!";
message.style.color = "green";

loadStatus(userId);

}catch(err){

console.error(err);

message.textContent = "Error uploading";
message.style.color = "red";

}

});

// ======================
// ADMIN PANEL
// ======================


const table = document.getElementById("verificationTable");


async function loadVerifications(){

const querySnapshot =
await getDocs(collection(db, "verifications"));

table.innerHTML = "";

querySnapshot.forEach(documentSnapshot => {

const data = documentSnapshot.data();

const tr = document.createElement("tr");

tr.innerHTML = `

<td>${data.userId}</td>

<td>
<a href="${data.fileURL}" target="_blank">
View ID
</a>
</td>

<td>${data.status}</td>

<td>
<button onclick="approve('${data.userId}')">
Approve
</button>
</td>

`;

table.appendChild(tr);

});

// Handle empty state
if(querySnapshot.empty){

table.innerHTML = "<tr><td colspan='4'>No verifications found.</td></tr>";
}

 
}

window.approve = async function(userId){

await updateDoc(doc(db, "verifications", userId), {

status: "verified"

});

loadVerifications();

}


loadVerifications();