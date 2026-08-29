import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "firebase/firestore";
import { logger } from "../utils/logger";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable offline persistence with multi-tab support (New API)
// This allows the app to work offline and sync when back online
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// Safely get messaging instance only if supported in current environment/browser
let messagingPromise: ReturnType<typeof getMessaging> | null = null;
export const getMessagingInstance = async () => {
    if (typeof window === "undefined") return null;
    try {
        const supported = await isSupported();
        if (supported) {
            if (!messagingPromise) {
                messagingPromise = getMessaging(app);
            }
            return messagingPromise;
        }
    } catch (e) {
        logger.warn("Firebase Messaging not supported in this environment:", e);
    }
    return null;
};

logger.info("Firebase initialized with persistent local cache enabled.");
