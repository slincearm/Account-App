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
import { Expense, UseExpensesReturn } from "../types";

export function useExpenses(groupId: string): UseExpensesReturn {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
            } as Expense));
            setExpenses(docs);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching expenses:", err);
            setLoading(false);
        });

        return unsubscribe;
    }, [groupId]);

    const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<void> => {
        try {
            await addDoc(collection(db, "groups", groupId, "expenses"), {
                ...expenseData,
                timestamp: expenseData.timestamp || serverTimestamp() // User might pick date
            });
        } catch (err) {
            console.error("Error adding expense:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            throw new Error(`Failed to add expense: ${errorMessage}`);
        }
    };

    return { expenses, loading, addExpense };
}
