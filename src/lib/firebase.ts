import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
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

// Enable offline persistence with multi-tab support (New API)
// This allows the app to work offline and sync when back online
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
