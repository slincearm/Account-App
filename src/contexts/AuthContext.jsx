import { createContext, useContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    getDoc
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); // Firestore data (isApproved)
    const [loading, setLoading] = useState(true);

    const login = () => {
        return signInWithPopup(auth, new GoogleAuthProvider());
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);

                // Reference to the user document
                const userRef = doc(db, "users", user.uid);

                // Check if user exists, if not create them
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        isApproved: false,
                        createdAt: serverTimestamp()
                    });
                }

                // Listen to real-time updates for approval status
                unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
                    const data = doc.data();
                    setUserData(data);
                    // Optionally merge into currentUser or keep separate
                }, (error) => {
                    console.error("Error fetching user data:", error);
                });

            } else {
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
