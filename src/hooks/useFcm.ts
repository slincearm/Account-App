import { useState, useEffect } from "react";
import { getToken } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { messaging, db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";

export function useFcm() {
    const { currentUser } = useAuth();

    const [permission, setPermission] = useState<NotificationPermission>(
        Notification.permission
    );

    const requestPermission = async () => {
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === "granted") {
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                });

                if (token && currentUser) {
                    logger.info("FCM Token:", token);
                    const userRef = doc(db, "users", currentUser.uid);
                    await updateDoc(userRef, {
                        fcmTokens: arrayUnion(token),
                    });
                }
            } else {
                logger.warn("Notification permission denied");
            }
        } catch (error) {
            logger.error("Error requesting permission:", error);
        }
    };

    useEffect(() => {
        // Auto-initialize if already granted
        if (permission === 'granted') {
            requestPermission();
        }
        // If 'default', we wait for user interaction (called via UI)
    }, [currentUser, permission]);

    return { permission, requestPermission };
}
