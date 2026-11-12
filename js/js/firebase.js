// ==========================================
// AMAN PORTFOLIO - FIREBASE CONFIGURATION
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    initializeAuth,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyDhu9gBGRzw7tTLOsRJjpmN39m1Our4P1E",
    authDomain: "aman-portfolio-3a57c.firebaseapp.com",
    projectId: "aman-portfolio-3a57c",
    storageBucket: "aman-portfolio-3a57c.firebasestorage.app",
    messagingSenderId: "889205742467",
    appId: "1:889205742467:web:b39c21c2d8c57514cef4b6"
};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

// ==========================================
// AUTHENTICATION - NO PERSISTENT SESSION
// ==========================================

const auth = initializeAuth(app, {
    persistence: browserSessionPersistence
});

// ==========================================
// FIRESTORE
// ==========================================

const db = getFirestore(app);

export { auth, db };