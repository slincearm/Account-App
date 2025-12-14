import { useState, useEffect, memo } from "react";
import { X, UserPlus } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserData } from "../types";
import { useTranslation } from "react-i18next";

interface AddMemberModalProps {
    currentMemberIds: string[];
    onClose: () => void;
    onAdd: (uid: string) => Promise<void>;
    isTemporary?: boolean;
    onAddTemporary?: (name: string) => Promise<void>;
}

function AddMemberModal({ currentMemberIds, onClose, onAdd, isTemporary = false, onAddTemporary }: AddMemberModalProps) {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [temporaryName, setTemporaryName] = useState<string>("");
    const [addingTemporary, setAddingTemporary] = useState<boolean>(false);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUsers = async () => {
            // Skip fetching users for temporary groups
            if (isTemporary) {
                setLoading(false);
                return;
            }

            try {
                // Fetch all approved users
                const q = query(
                    collection(db, "users"),
                    where("isApproved", "==", true)
                );
                const snap = await getDocs(q);
                const allUsers = snap.docs.map(d => d.data() as UserData);
                // Filter out existing members
                setUsers(allUsers.filter(u => !currentMemberIds.includes(u.uid)));
            } catch (error) {
                console.error("Failed to fetch users:", error);
                alert(t('errors.fetchUsersFailed'));
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentMemberIds, isTemporary, t]);

    const handleAddTemporary = async () => {
        if (!temporaryName.trim()) {
            alert(t('modal.enterTemporaryName'));
            return;
        }

        if (!onAddTemporary) return;

        setAddingTemporary(true);
        try {
            await onAddTemporary(temporaryName.trim());
            setTemporaryName("");
            onClose();
        } catch (error) {
            console.error("Failed to add temporary member:", error);
            alert(t('errors.addMemberFailed'));
        } finally {
            setAddingTemporary(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{ width: "90%", maxWidth: "400px", position: "relative" }}
                onClick={(e) => e.stopPropagation()}
            >
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

                <h3 style={{ marginBottom: "1rem" }}>{t('modal.addMember')}</h3>

                {isTemporary ? (
                    <div>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                            {t('modal.temporaryMemberDescription')}
                        </p>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                                {t('modal.temporaryMemberName')}
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={temporaryName}
                                onChange={(e) => setTemporaryName(e.target.value)}
                                placeholder={t('modal.temporaryMemberNamePlaceholder')}
                                disabled={addingTemporary}
                            />
                        </div>
                        <div className="flex-center" style={{ gap: "1rem" }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose} 
                                style={{ flex: 1 }}
                                disabled={addingTemporary}
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={handleAddTemporary} 
                                style={{ flex: 1 }}
                                disabled={addingTemporary || !temporaryName.trim()}
                            >
                                {addingTemporary ? t('common.loading') : t('modal.add')}
                            </button>
                        </div>
                    </div>
                ) : (
                    loading ? (
                        <div className="text-center">{t('modal.loadingUsers')}</div>
                    ) : (
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {users.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", textAlign: "center" }}>{t('modal.noOtherUsers')}</p>
                            ) : (
                                <div style={{ display: "grid", gap: "0.5rem" }}>
                                    {users.map(u => (
                                        <div key={u.uid} className="flex-between" style={{ padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)" }}>
                                            <div className="flex-center" style={{ gap: "0.5rem" }}>
                                                {u.photoURL ? (
                                                    <img src={u.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: "50%" }} />
                                                ) : (
                                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "gray" }} />
                                                )}
                                                <span>{u.displayName}</span>
                                            </div>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                                onClick={() => onAdd(u.uid)}
                                            >
                                                <UserPlus size={14} /> Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default memo(AddMemberModal);
