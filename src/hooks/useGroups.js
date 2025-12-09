import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    addDoc,
    serverTimestamp,
    onSnapshot,
    orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export function useGroups() {
    const { currentUser } = useAuth();
    const [activeGroups, setActiveGroups] = useState([]);
    const [settledGroups, setSettledGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "groups"),
            where("members", "array-contains", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allGroups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setActiveGroups(allGroups.filter(g => g.status === 'active'));
            setSettledGroups(allGroups.filter(g => g.status === 'settled'));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching groups:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    const createGroup = async (name) => {
        if (!currentUser) return;

        // Default name if empty is current date YYYY-MM-DD (Handled by caller or here)
        const groupName = name || new Date().toISOString().split('T')[0];

        try {
            await addDoc(collection(db, "groups"), {
                name: groupName,
                createdByName: currentUser.displayName,
                createdByUid: currentUser.uid,
                members: [currentUser.uid], // Currently only creator starts in group, others added later? or select logic?
                // Requirement 2b: "Display members only".
                // Requirement 4a: "Select fields... share with users". 
                // implies we might select users per expense, BUT standard logic is group has members.
                // For now, assume creator is sole member initially unless we add "Add Member to Group" feature.
                // Actually, requirement 2b says "the user joined accounting groups". 
                // I'll stick to creator-only initially or maybe add logic to invite.
                // Wait, prompt 4a says "choose users to split". This implies users are ALREADY in the group.
                // I will add a way to add users to group later, or maybe ALL approved users are available to add?
                // Let's assume for MVP all approved users can be added to a group.
                status: 'active',
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error creating group:", err);
            throw err;
        }
    };

    return { activeGroups, settledGroups, loading, createGroup };
}
