import { useState, useEffect, useCallback } from "react";
import { getToken } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getMessagingInstance, db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";

export function useFcm() {
    const { currentUser } = useAuth();

    const [permission, setPermission] = useState<NotificationPermission>(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            return Notification.permission;
        }
        return "default";
    });

    const requestPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            logger.warn("Notifications are not supported in this browser environment.");
            return;
        }

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === "granted") {
                const messagingInstance = await getMessagingInstance();
                if (!messagingInstance) {
                    logger.warn("Firebase Messaging instance is not available in this environment.");
                    return;
                }

                const token = await getToken(messagingInstance, {
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
    }, [currentUser]);

    useEffect(() => {
        // Auto-initialize if already granted
        if (permission === 'granted') {
            requestPermission();
        }
        // If 'default', we wait for user interaction (called via UI)
    }, [currentUser, permission, requestPermission]);

    return { permission, requestPermission };
}
