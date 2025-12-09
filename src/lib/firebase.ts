import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    enableMultiTabIndexedDbPersistence
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCs5Xm3VtAfohicyQqUQhgm5nSfxkexVMM",
    authDomain: "accounting-app-30d42.firebaseapp.com",
    projectId: "accounting-app-30d42",
    storageBucket: "accounting-app-30d42.firebasestorage.app",
    messagingSenderId: "855630912434",
    appId: "1:855630912434:web:2940f1ceb9e84e4e3de2ab",
    measurementId: "G-3HE3DZKGHG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence with multi-tab support
// This allows the app to work offline and sync when back online
enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            // The current browser doesn't support persistence
            console.warn('Firestore persistence not supported by this browser');
        } else {
            console.error('Firestore persistence error:', err);
        }
    });
