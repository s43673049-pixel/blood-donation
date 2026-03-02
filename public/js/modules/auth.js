import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const registerForm = document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const email = registerForm.email.value;
const password = registerForm.password.value;

try{

await createUserWithEmailAndPassword(auth,email,password);

alert("User Created");

location.href="dashboard.html";

}catch(error){

alert(error.message);

}

});
}


const loginForm = document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit", async (e)=>{

e.preventDefault();

const email = loginForm.email.value;
const password = loginForm.password.value;

try{

await signInWithEmailAndPassword(auth,email,password);

location.href="dashboard.html";

}catch(error){

alert(error.message);

}

});
}


onAuthStateChanged(auth,(user)=>{

if(!user && location.pathname.includes("dashboard")){

location.href="login.html";

}

});


window.logout = async function(){

await signOut(auth);

location.href="login.html";

}