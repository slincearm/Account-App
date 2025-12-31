import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Group, Member, UseGroupReturn } from "../types";

export function useGroup(groupId: string): UseGroupReturn & { addMember: (uid: string) => Promise<void>; addTemporaryMember: (name: string) => Promise<void> } {
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!groupId) return;
        let isMounted = true;

        const unsubscribe = onSnapshot(doc(db, "groups", groupId), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const groupData = { id: docSnap.id, ...data } as Group;

                if (isMounted) {
                    setGroup(groupData);
                }

                // Fetch member details
                const memberList: Member[] = [];

                // Fetch regular members
                if (data.members && data.members.length > 0) {
                    if (data.members.length <= 10) {
                        const q = query(collection(db, "users"), where("uid", "in", data.members));
                        const memberSnaps = await getDocs(q);
                        memberList.push(...memberSnaps.docs.map(d => d.data() as Member));
                    }
                }

                // Add temporary members if this is a temporary group
                if (groupData.isTemporary && groupData.temporaryMembers) {
                    groupData.temporaryMembers.forEach(tempMember => {
                        memberList.push({
                            uid: tempMember.id,
                            displayName: tempMember.displayName,
                            photoURL: '',
                            email: '',
                            isTemporary: true
                        });
                    });
                }

                if (isMounted) {
                    setMembers(memberList);
                }
            } else {
                if (isMounted) {
                    setGroup(null);
                    setMembers([]);
                }
            }
            if (isMounted) {
                setLoading(false);
            }
        }, (err) => {
            console.error("Error fetching group:", err);
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [groupId]);

    const addMember = async (uid: string): Promise<void> => {
        try {
            await updateDoc(doc(db, "groups", groupId), {
                members: arrayUnion(uid)
            });
        } catch (err) {
            console.error("Failed to add member:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            throw new Error(`Failed to add member: ${errorMessage}`);
        }
    };

    const addTemporaryMember = async (name: string): Promise<void> => {
        try {
            const tempMember = {
                id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                displayName: name
            };

            await updateDoc(doc(db, "groups", groupId), {
                temporaryMembers: arrayUnion(tempMember)
            });
        } catch (err) {
            console.error("Failed to add temporary member:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            throw new Error(`Failed to add temporary member: ${errorMessage}`);
        }
    };

    return { group, members, loading, addMember, addTemporaryMember };
}
