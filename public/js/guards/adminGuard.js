import { auth } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const ADMIN_EMAIL = "hellodonate@gmail.com";

if (document.body) {
  document.body.style.visibility = "hidden";
}

onAuthStateChanged(auth, (user) => {
  const isAdmin =
    user?.email && user.email.toLowerCase() === ADMIN_EMAIL;

  if (!isAdmin) {
    window.location.replace("../auth/login.html");
    return;
  }

  document.body.style.visibility = "visible";
});
