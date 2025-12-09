import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useGroup(groupId) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]); // Array of user objects
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) return;

        const unsubscribe = onSnapshot(doc(db, "groups", groupId), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setGroup({ id: docSnap.id, ...data });

                // Fetch member details
                if (data.members && data.members.length > 0) {
                    // Firestore 'in' query supports up to 10 items. 
                    // If more, we need to batch or fetch individually. 
                    // For MVP assume small groups < 10.
                    if (data.members.length <= 10) {
                        const q = query(collection(db, "users"), where("uid", "in", data.members));
                        const memberSnaps = await getDocs(q);
                        const memberList = memberSnaps.docs.map(d => d.data());
                        setMembers(memberList);
                    } else {
                        // Fallback: fetch all or individually (not implemented for MVP)
                        // Just fetching creators/others separately? 
                        // Let's just limit to 10 for now logic.
                        setMembers([]);
                    }
                }
            } else {
                setGroup(null);
                setMembers([]);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching group:", err);
            setLoading(false);
        });

        return unsubscribe;
    }, [groupId]);

    const addMember = async (uid) => {
        try {
            await updateDoc(doc(db, "groups", groupId), {
                members: arrayUnion(uid)
            });
        } catch (err) {
            console.error("Failed to add member:", err);
            throw err;
        }
    };

    return { group, members, loading, addMember };
}
