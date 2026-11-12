// ==========================================
// AMAN PORTFOLIO - AUTHENTICATION
// ==========================================

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ==========================================
// LOGIN ELEMENTS
// ==========================================

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginBtn = document.getElementById("loginBtn");

// ==========================================
// LOGIN FORM SUBMISSION
// ==========================================

if (loginForm && message && loginBtn) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // Prevent repeated submissions
        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        message.style.color = "orange";
        message.textContent = "Please wait, verifying your login...";

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (userCredential.user.email.toLowerCase() !== "amanvahora227@gmail.com") {
                await signOut(auth);
                throw new Error("Access denied! Only authorized admin can login.");
            }

            sessionStorage.setItem("amanDashboardLogin", "1");

            message.style.color = "green";
            message.textContent = "Login successful! Redirecting...";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (error) {
            console.error("Login error:", error.code);

            message.style.color = "red";

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                message.textContent = "Invalid email or password.";
            } else if (error.code === "auth/too-many-requests") {
                message.textContent =
                    "Too many attempts. Please try again later.";
            } else if (error.code === "auth/network-request-failed") {
                message.textContent =
                    "Network error. Check your internet connection.";
            } else {
                message.textContent =
                    "Login failed. Please try again.";
            }

            loginBtn.disabled = false;
            loginBtn.textContent = "Login to Dashboard";
        }
    });
}

