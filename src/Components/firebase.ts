import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyCohvW0q3_4LEEKEgh9KngA34i80itTgjc",
    authDomain: "reactrpg-10b32.firebaseapp.com",
    projectId: "reactrpg-10b32",
    storageBucket: "reactrpg-10b32.firebasestorage.app",
    messagingSenderId: "1037481422687",
    appId: "1:1037481422687:web:6e20375d897ac8186550ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
