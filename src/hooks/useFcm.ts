import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { messaging, db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";

export function useFcm() {
    const { currentUser } = useAuth();

    useEffect(() => {
        const initFcm = async () => {
            if (!currentUser) return;

            try {
                // Check if notification permission is granted
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    logger.info("Notification permission not granted.");
                    return;
                }

                // Get FCM Token
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                });

                if (token) {
                    logger.info("FCM Token:", token);
                    // Save token to Firestore
                    const userRef = doc(db, "users", currentUser.uid);
                    await updateDoc(userRef, {
                        fcmTokens: arrayUnion(token),
                    });
                } else {
                    logger.warn("No registration token available. Request permission to generate one.");
                }
            } catch (error) {
                logger.error("An error occurred while retrieving token.", error);
            }
        };

        initFcm();
    }, [currentUser]);
}
