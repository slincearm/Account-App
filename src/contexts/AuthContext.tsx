import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    UserCredential
} from "firebase/auth";
import {
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    getDoc,
    Unsubscribe,
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { AuthContextType, UserData } from "../types";
import { logger } from "../utils/logger";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const login = (): Promise<UserCredential> => {
        logger.info("Initiating login...");
        return signInWithPopup(auth, new GoogleAuthProvider());
    };

    const logout = (): Promise<void> => {
        logger.info("Initiating logout...");
        return signOut(auth);
    };

    useEffect(() => {
        let unsubscribeSnapshot: Unsubscribe | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            if (user) {
                logger.info(`User authenticated: ${user.email}`);
                setCurrentUser(user);

                // Reference to the user document
                const userRef = doc(db, "users", user.uid);

                // Check if user exists, if not create them
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    logger.info(`Creating new user profile for ${user.email}`);
                    // Check if user is admin by comparing with admin collection
                    let isAdmin = false;
                    try {
                        if (user.email) {
                            const adminQuery = query(collection(db, "admin"), where("email", "==", user.email));
                            const adminSnapshot = await getDocs(adminQuery);
                            isAdmin = !adminSnapshot.empty;
                        }
                    } catch (error) {
                        logger.error("Error checking admin status:", error);
                    }

                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        isApproved: isAdmin, // Auto-approve admins
                        isAdmin: isAdmin,
                        createdAt: serverTimestamp()
                    });
                }

                // Listen to real-time updates for approval status
                unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
                    const data = doc.data() as UserData | undefined;
                    setUserData(data || null);
                    logger.debug(`User data updated: isApproved=${data?.isApproved}, isAdmin=${data?.isAdmin}`);
                    // Optionally merge into currentUser or keep separate
                }, (error) => {
                    logger.error("Error fetching user data:", error);
                });

            } else {
                logger.info("User signed out");
                setCurrentUser(null);
                setUserData(null);
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const value = {
        currentUser,
        userData,
        isApproved: userData?.isApproved ?? false,
        isAdmin: userData?.isAdmin ?? false,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
