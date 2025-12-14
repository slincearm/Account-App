import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    addDoc,
    serverTimestamp,
    onSnapshot,
    orderBy,
    deleteDoc,
    doc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Group, UseGroupsReturn } from "../types";

export function useGroups(): UseGroupsReturn {
    const { currentUser } = useAuth();
    const [activeGroups, setActiveGroups] = useState<Group[]>([]);
    const [settledGroups, setSettledGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
            } as Group));

            setActiveGroups(allGroups.filter(g => g.status === 'active'));
            setSettledGroups(allGroups.filter(g => g.status === 'settled'));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching groups:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    const createGroup = async (name: string, isTemporary: boolean = false): Promise<void> => {
        if (!currentUser) return;

        // Default name if empty is current date YYYY-MM-DD (Handled by caller or here)
        const groupName = name || new Date().toISOString().split('T')[0];

        try {
            await addDoc(collection(db, "groups"), {
                name: groupName,
                createdByName: currentUser.displayName,
                createdByUid: currentUser.uid,
                members: [currentUser.uid],
                status: 'active',
                isTemporary: isTemporary,
                temporaryMembers: isTemporary ? [] : undefined,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error creating group:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            throw new Error(`Failed to create group: ${errorMessage}`);
        }
    };

    const deleteGroup = async (groupId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, "groups", groupId));
        } catch (err) {
            console.error("Error deleting group:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            throw new Error(`Failed to delete group: ${errorMessage}`);
        }
    };

    return { activeGroups, settledGroups, loading, createGroup, deleteGroup };
}
