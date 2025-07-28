import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, getDoc, onSnapshot, limit, orderBy, startAfter, updateDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIzgQqxHMTdCsW0UG4MOEuFWwjEYAFYbk",
    authDomain: "effect-builder.firebaseapp.com",
    projectId: "effect-builder",
    storageBucket: "effect-builder.appspot.com",
    messagingSenderId: "638106955712",
    appId: "1:638106955712:web:e98ee4cd023fd84d466225",
    measurementId: "G-4TBX7711GH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Make Firebase services and functions globally available for other scripts
window.auth = getAuth(app);
window.db = getFirestore(app);
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.runTransaction = runTransaction;
window.doc = doc;
window.deleteDoc = deleteDoc;
window.query = query;
window.where = where;
window.getDoc = getDoc;
window.onSnapshot = onSnapshot;
window.limit = limit;
window.orderBy = orderBy;
window.startAfter = startAfter;
window.updateDoc = updateDoc; // This line is added

// Wait for the DOM to be fully loaded before setting up UI event listeners
document.addEventListener('DOMContentLoaded', () => {
    const provider = new window.GoogleAuthProvider();
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.signInWithPopup(window.auth, provider).catch(console.error);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.signOut(window.auth).catch(console.error);
        });
    }

    // This listener handles all UI changes related to authentication state.
    window.onAuthStateChanged(window.auth, user => {
        const loginBtn = document.getElementById('login-btn');
        const userSessionGroup = document.getElementById('user-session-group');
        const userPhotoEl = document.getElementById('user-photo');
        const userDisplay = document.getElementById('user-display');
        const saveWsBtn = document.getElementById('save-ws-btn');
        const loadWsBtn = document.getElementById('load-ws-btn');
        const isLoggedIn = !!user;
        const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZHRoPSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktcGVyc29uLWNpcmNsZSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTFhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAweiIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOHJhOCA4IDAgMTAxNiAwQTggOCAwIDAwMCA4em04LTdhNyA3IDAgMDE3IDcgNyA3IDAgMDEtNyA3QTcgNyAwIDAxMSA4YTcgNyAwIDAxNy03eiIvPgo8L3N2Zz4=';

        if (isLoggedIn) {
            // Show the logged-in group and hide the login button
            if(loginBtn) loginBtn.classList.add('d-none');
            if(userSessionGroup) userSessionGroup.classList.remove('d-none');

            // Populate user info
            if(userDisplay) userDisplay.textContent = user.displayName || user.email;
            if(userPhotoEl) {
                userPhotoEl.src = user.photoURL || defaultIcon;
                userPhotoEl.onerror = () => {
                    userPhotoEl.src = defaultIcon;
                    userPhotoEl.onerror = null;
                };
            }
        } else {
            // Show the login button and hide the logged-in group
            if(loginBtn) loginBtn.classList.remove('d-none');
            if(userSessionGroup) userSessionGroup.classList.add('d-none');
        }

        // Enable/disable other buttons
        if(saveWsBtn) saveWsBtn.disabled = !isLoggedIn;
        if(loadWsBtn) loadWsBtn.disabled = !isLoggedIn;
    });
});