import { useState, useEffect, FormEvent, memo } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Member, Expense } from "../types";
import { useTranslation } from "react-i18next";

const PREDEFINED_CATEGORIES = ["food", "clothing", "housing", "transportation", "education", "entertainment", "miscellaneous"];

// Helper function to get meal description based on time
const getMealDescriptionByTime = (date: Date, t: any): string => {
    const hour = date.getHours();

    if (hour >= 6 && hour < 10) {
        return t('expense.mealTimes.breakfast');
    } else if (hour >= 10 && hour < 11) {
        return t('expense.mealTimes.brunch');
    } else if (hour >= 11 && hour < 14) {
        return t('expense.mealTimes.lunch');
    } else if (hour >= 17 && hour < 21) {
        return t('expense.mealTimes.dinner');
    } else {
        return t('expense.mealTimes.snack');
    }
};

interface AddExpenseModalProps {
    groupId: string;
    groupMembers: Member[];
    onClose: () => void;
    onAdd: (expense: Omit<Expense, 'id'>) => Promise<void>;
    editingExpense?: Expense | null;
    onUpdate?: (expenseId: string, expense: Partial<Omit<Expense, 'id'>>) => Promise<void>;
}

function AddExpenseModal({ groupMembers, onClose, onAdd, editingExpense, onUpdate }: Omit<AddExpenseModalProps, 'groupId'> & {groupId?: string}) {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const isEditMode = !!editingExpense;
    const [description, setDescription] = useState<string>(editingExpense?.description || "");
    const [amount, setAmount] = useState<string>(editingExpense?.amount.toString() || "");
    const [category, setCategory] = useState<string>(editingExpense?.category || "food");
    const [customCategory, setCustomCategory] = useState<string>("");
    const [isCustomCategory, setIsCustomCategory] = useState<boolean>(editingExpense ? !PREDEFINED_CATEGORIES.includes(editingExpense.category) : false);

    // Helper function to format date to local datetime-local format
    const formatLocalDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [date, setDate] = useState<string>(
        editingExpense?.timestamp?.toDate
            ? formatLocalDateTime(new Date(editingExpense.timestamp.toDate()))
            : formatLocalDateTime(new Date())
    );
    const [payerUid, setPayerUid] = useState<string>(editingExpense?.payerUid || currentUser?.uid || '');
    const [involvedUids, setInvolvedUids] = useState<string[]>(editingExpense?.involvedUids || []);
    const [loading, setLoading] = useState<boolean>(false);

    // Need mapping from uid to Display Name for the UI
    // groupMembers comes from parent: [{ uid, displayName, photoURL }]

    useEffect(() => {
        // Default all members involved only in add mode
        if (!isEditMode && groupMembers.length > 0) {
            setInvolvedUids(groupMembers.map(m => m.uid));
        }
        // In edit mode, set custom category if needed
        if (isEditMode && editingExpense && !PREDEFINED_CATEGORIES.includes(editingExpense.category)) {
            setCustomCategory(editingExpense.category);
        }
    }, [groupMembers, isEditMode, editingExpense]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalCategory = isCustomCategory ? customCategory : category;
            // Determine default description
            let defaultDescription: string;
            if (isCustomCategory) {
                defaultDescription = customCategory;
            } else if (category === 'food' && description.trim() === '') {
                // For food category with empty description, use meal time
                defaultDescription = getMealDescriptionByTime(new Date(date), t);
            } else {
                defaultDescription = t(`expense.categories.${category}`);
            }
            const finalDescription = description.trim() === "" ? defaultDescription : description;

            const expenseData = {
                description: finalDescription,
                amount: parseFloat(amount),
                category: finalCategory as any,
                payerUid,
                involvedUids,
                timestamp: new Date(date) as any
            };

            if (isEditMode && editingExpense && onUpdate) {
                await onUpdate(editingExpense.id, expenseData);
            } else {
                await onAdd(expenseData);
            }
            onClose();
        } catch (error) {
            console.error(isEditMode ? "Failed to update expense:" : "Failed to add expense:", error);
            alert(t(isEditMode ? 'errors.updateExpenseFailed' : 'errors.addExpenseFailed'));
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

                <h3 style={{ marginBottom: "1.5rem", color: "var(--text-primary)" }}>{isEditMode ? t('expense.edit') : t('expense.add')}</h3>

                <form onSubmit={handleSubmit}>
                    {/* Date and Time */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>{t('expense.time')}</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <input
                                type="date"
                                className="input"
                                value={date.slice(0, 10)}
                                onChange={e => setDate(e.target.value + 'T' + (date.slice(11, 16) || '12:00'))}
                                required
                            />
                            <input
                                type="time"
                                className="input"
                                value={date.slice(11, 16)}
                                onChange={e => setDate(date.slice(0, 10) + 'T' + e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>{t('expense.category')}</label>
                        <div className="flex-center" style={{ gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-start" }}>
                            {!isCustomCategory && PREDEFINED_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                    onClick={() => setCategory(cat)}
                                >
                                    {t(`expense.categories.${cat}`)}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`btn ${isCustomCategory ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                onClick={() => setIsCustomCategory(!isCustomCategory)}
                            >
                                {isCustomCategory ? t('expense.selectList') : t('expense.custom')}
                            </button>
                        </div>
                        {isCustomCategory && (
                            <input
                                type="text"
                                className="input"
                                style={{ marginTop: "0.5rem" }}
                                placeholder={t('expense.enterCategoryName')}
                                value={customCategory}
                                onChange={e => setCustomCategory(e.target.value)}
                                required={isCustomCategory}
                            />
                        )}
                    </div>

                    {/* Name/Description */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>
                            {t('expense.description')} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({t('expense.descriptionOptional')})</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={`${t('expense.descriptionDefaultsTo')} "${isCustomCategory ? (customCategory || t('expense.category')) : (category === 'food' ? getMealDescriptionByTime(new Date(date), t) : t(`expense.categories.${category}`))}"`}
                        />
                    </div>

                    {/* Amount */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>{t('expense.amount')}</label>
                        <input
                            type="number"
                            className="input"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            required
                            placeholder={t('expense.amountPlaceholder')}
                        />
                    </div>

                    {/* Users Selection */}
                    <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--glass-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>{t('expense.whoPaid')}</label>
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
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>{t('expense.splitAmongst')}</label>
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
                                            {involvedUids.includes(m.uid) && <Check size={12} color="white" />}
                                        </div>
                                        <span style={{ color: "var(--text-primary)" }}>{m.displayName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-center" style={{ gap: "1rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }} disabled={loading}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? (isEditMode ? t('expense.updating') : t('expense.adding')) : (isEditMode ? t('expense.updateExpense') : t('expense.addExpense'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(AddExpenseModal);
