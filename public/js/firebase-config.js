// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAftUFZu78FeolEPnDtnxvp0cw7hkgY6qY",
  authDomain: "web-app-1a136.firebaseapp.com",
  projectId: "web-app-1a136",
  storageBucket: "web-app-1a136.firebasestorage.app",
  messagingSenderId: "245760724897",
  appId: "1:245760724897:web:52d9aa104977455fac05e0",
  measurementId: "G-0JN8P4LFW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);