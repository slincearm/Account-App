import { useState, useEffect } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export function useExpenses(groupId) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) return;

        const q = query(
            collection(db, "groups", groupId, "expenses"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExpenses(docs);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching expenses:", err);
            setLoading(false);
        });

        return unsubscribe;
    }, [groupId]);

    const addExpense = async (expenseData) => {
        // expenseData: { description, amount, payerUid, involvedUids, category, timestamp }
        try {
            await addDoc(collection(db, "groups", groupId, "expenses"), {
                ...expenseData,
                timestamp: expenseData.timestamp || serverTimestamp() // User might pick date
            });
        } catch (err) {
            console.error("Error adding expense:", err);
            throw err;
        }
    };

    return { expenses, loading, addExpense };
}
