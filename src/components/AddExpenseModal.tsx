import { useState, useEffect, FormEvent, memo } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Member, Expense } from "../types";
import { useTranslation } from "react-i18next";

const PREDEFINED_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Travel"];

interface AddExpenseModalProps {
    groupId: string;
    groupMembers: Member[];
    onClose: () => void;
    onAdd: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

function AddExpenseModal({ groupMembers, onClose, onAdd }: Omit<AddExpenseModalProps, 'groupId'> & {groupId?: string}) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [category, setCategory] = useState<string>("Breakfast");
    const [customCategory, setCustomCategory] = useState<string>("");
    const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
    const [payerUid, setPayerUid] = useState<string>(currentUser?.uid || '');
    const [involvedUids, setInvolvedUids] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Need mapping from uid to Display Name for the UI
    // groupMembers comes from parent: [{ uid, displayName, photoURL }]

    useEffect(() => {
        // Default all members involved
        if (groupMembers.length > 0) {
            setInvolvedUids(groupMembers.map(m => m.uid));
        }
    }, [groupMembers]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalCategory = isCustomCategory ? customCategory : category;
            const finalDescription = description.trim() === "" ? finalCategory : description;

            await onAdd({
                description: finalDescription,
                amount: parseFloat(amount),
                category: finalCategory as any,
                payerUid,
                involvedUids,
                timestamp: new Date(date) as any
            });
            onClose();
        } catch (error) {
            console.error("Failed to add expense:", error);
            alert(t('errors.addExpenseFailed'));
        } finally {
            setLoading(false);
        }
    };

    const toggleInvolved = (uid: string): void => {
        setInvolvedUids(prev => {
            if (prev.includes(uid)) {
                return prev.filter(id => id !== uid);
            } else {
                return [...prev, uid];
            }
        });
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
        }}>
            <div className="card" style={{ width: "90%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)"
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ marginBottom: "1.5rem" }}>Add New Expense</h3>

                <form onSubmit={handleSubmit}>
                    {/* Time */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Time</label>
                        <input
                            type="datetime-local"
                            className="input"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Category</label>
                        <div className="flex-center" style={{ gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-start" }}>
                            {!isCustomCategory && PREDEFINED_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                    onClick={() => setCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`btn ${isCustomCategory ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                onClick={() => setIsCustomCategory(!isCustomCategory)}
                            >
                                {isCustomCategory ? "Select List" : "Custom"}
                            </button>
                        </div>
                        {isCustomCategory && (
                            <input
                                type="text"
                                className="input"
                                style={{ marginTop: "0.5rem" }}
                                placeholder="Enter category name"
                                value={customCategory}
                                onChange={e => setCustomCategory(e.target.value)}
                                required={isCustomCategory}
                            />
                        )}
                    </div>

                    {/* Name/Description */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                            Description <span style={{ color: "var(--text-muted)" }}>(Optional)</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={`Defaults to "${isCustomCategory ? (customCategory || 'Category') : category}"`}
                        />
                    </div>

                    {/* Amount */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Amount</label>
                        <input
                            type="number"
                            className="input"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                        />
                    </div>

                    {/* Users Selection */}
                    <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Who Paid?</label>
                            <select
                                className="input"
                                value={payerUid}
                                onChange={e => setPayerUid(e.target.value)}
                            >
                                {groupMembers.map(m => (
                                    <option key={m.uid} value={m.uid}>{m.displayName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Split Amongst</label>
                            <div style={{ display: "grid", gap: "0.5rem" }}>
                                {groupMembers.map(m => (
                                    <div
                                        key={m.uid}
                                        onClick={() => toggleInvolved(m.uid)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            cursor: "pointer",
                                            opacity: involvedUids.includes(m.uid) ? 1 : 0.5
                                        }}
                                    >
                                        <div style={{
                                            width: 20, height: 20,
                                            borderRadius: "50%",
                                            border: "1px solid var(--text-muted)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: involvedUids.includes(m.uid) ? "hsl(var(--color-primary))" : "transparent"
                                        }}>
                                            {involvedUids.includes(m.uid) && <Check size={12} />}
                                        </div>
                                        <span>{m.displayName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-center" style={{ gap: "1rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(AddExpenseModal);
