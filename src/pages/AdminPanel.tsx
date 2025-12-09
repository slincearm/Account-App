import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserData } from "../types";
import { useTranslation } from "react-i18next";
import { Shield, Check, X, Save, XCircle } from "lucide-react";

export default function AdminPanel() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modifiedUsers, setModifiedUsers] = useState<Map<string, boolean>>(new Map());
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            })) as UserData[];
            
            // Sort: admins first, then by approval status, then by creation date
            usersData.sort((a, b) => {
                if (a.isAdmin && !b.isAdmin) return -1;
                if (!a.isAdmin && b.isAdmin) return 1;
                if (a.isApproved && !b.isApproved) return -1;
                if (!a.isApproved && b.isApproved) return 1;
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            });
            
            setUsers(usersData);
        } catch (error) {
            console.error("Error loading users:", error);
            alert(t('errors.loadUsersFailed'));
        } finally {
            setLoading(false);
        }
    };

    const toggleUserApproval = (uid: string, currentStatus: boolean) => {
        const newModified = new Map(modifiedUsers);
        const originalUser = users.find(u => u.uid === uid);
        
        if (originalUser) {
            const newStatus = !currentStatus;
            
            // If the new status is same as original, remove from modified map
            if (newStatus === originalUser.isApproved) {
                newModified.delete(uid);
            } else {
                newModified.set(uid, newStatus);
            }
            
            setModifiedUsers(newModified);
            setHasChanges(newModified.size > 0);
            
            // Update local state
            setUsers(users.map(u => 
                u.uid === uid ? { ...u, isApproved: newStatus } : u
            ));
        }
    };

    const handleCancel = () => {
        // Reset to original data
        loadUsers();
        setModifiedUsers(new Map());
        setHasChanges(false);
    };

    const handleSave = async () => {
        if (modifiedUsers.size === 0) return;

        try {
            setLoading(true);
            
            // Update all modified users
            const updatePromises = Array.from(modifiedUsers.entries()).map(
                async ([uid, isApproved]) => {
                    const userRef = doc(db, "users", uid);
                    await updateDoc(userRef, { isApproved });
                }
            );

            await Promise.all(updatePromises);
            
            alert(t('admin.saveSuccess'));
            setModifiedUsers(new Map());
            setHasChanges(false);
            await loadUsers();
        } catch (error) {
            console.error("Error updating users:", error);
            alert(t('errors.updateUsersFailed'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container text-center mt-10">
                {t('common.loading')}
            </div>
        );
    }

    const approvedUsers = users.filter(u => u.isApproved);
    const unapprovedUsers = users.filter(u => !u.isApproved);

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                        <Shield size={32} style={{ display: "inline", marginRight: "0.5rem" }} />
                        {t('admin.title')}
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {t('admin.description')}
                    </p>
                </div>
                
                {hasChanges && (
                    <div className="flex-center" style={{ gap: "0.5rem" }}>
                        <button 
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            <XCircle size={18} />
                            {t('common.cancel')}
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            <Save size={18} />
                            {t('admin.saveChanges')}
                        </button>
                    </div>
                )}
            </div>

            {/* Unapproved Users Section */}
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ 
                    fontSize: "1.25rem", 
                    marginBottom: "1rem",
                    color: "var(--text-primary)"
                }}>
                    {t('admin.unapprovedUsers')} ({unapprovedUsers.length})
                </h2>
                
                {unapprovedUsers.length === 0 ? (
                    <div className="card text-center" style={{ padding: "2rem" }}>
                        <p style={{ color: "var(--text-muted)" }}>
                            {t('admin.noUnapprovedUsers')}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {unapprovedUsers.map(user => (
                            <div 
                                key={user.uid} 
                                className="card"
                                style={{ 
                                    opacity: user.isAdmin ? 0.6 : 1,
                                    cursor: user.isAdmin ? "not-allowed" : "pointer",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => !user.isAdmin && toggleUserApproval(user.uid, user.isApproved)}
                            >
                                <div className="flex-between">
                                    <div className="flex-center" style={{ gap: "1rem" }}>
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName}
                                            style={{ 
                                                width: 48, 
                                                height: 48, 
                                                borderRadius: "50%",
                                                border: "2px solid var(--glass-border)"
                                            }}
                                        />
                                        <div>
                                            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                                                {user.displayName}
                                                {user.isAdmin && (
                                                    <span style={{ 
                                                        marginLeft: "0.5rem",
                                                        fontSize: "0.75rem",
                                                        color: "hsl(var(--color-warning))",
                                                        background: "rgba(245, 158, 11, 0.1)",
                                                        padding: "0.125rem 0.5rem",
                                                        borderRadius: "4px"
                                                    }}>
                                                        {t('admin.adminBadge')}
                                                    </span>
                                                )}
                                            </h3>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                {user.email}
                                            </p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {t('admin.joined')}: {user.createdAt.toDate().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-center" style={{ gap: "0.5rem" }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "8px",
                                                background: user.isApproved 
                                                    ? "rgba(16, 185, 129, 0.1)" 
                                                    : "rgba(239, 68, 68, 0.1)",
                                                color: user.isApproved 
                                                    ? "hsl(var(--color-success))" 
                                                    : "hsl(var(--color-error))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            {user.isApproved ? <Check size={20} /> : <X size={20} />}
                                        </div>
                                        {modifiedUsers.has(user.uid) && (
                                            <span style={{
                                                fontSize: "0.75rem",
                                                color: "hsl(var(--color-warning))",
                                                background: "rgba(245, 158, 11, 0.1)",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "4px"
                                            }}>
                                                {t('admin.modified')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approved Users Section */}
            <div>
                <h2 style={{ 
                    fontSize: "1.25rem", 
                    marginBottom: "1rem",
                    color: "var(--text-primary)"
                }}>
                    {t('admin.approvedUsers')} ({approvedUsers.length})
                </h2>
                
                {approvedUsers.length === 0 ? (
                    <div className="card text-center" style={{ padding: "2rem" }}>
                        <p style={{ color: "var(--text-muted)" }}>
                            {t('admin.noApprovedUsers')}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {approvedUsers.map(user => (
                            <div 
                                key={user.uid} 
                                className="card"
                                style={{ 
                                    opacity: user.isAdmin ? 0.6 : 1,
                                    cursor: user.isAdmin ? "not-allowed" : "pointer",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => !user.isAdmin && toggleUserApproval(user.uid, user.isApproved)}
                            >
                                <div className="flex-between">
                                    <div className="flex-center" style={{ gap: "1rem" }}>
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName}
                                            style={{ 
                                                width: 48, 
                                                height: 48, 
                                                borderRadius: "50%",
                                                border: "2px solid var(--glass-border)"
                                            }}
                                        />
                                        <div>
                                            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                                                {user.displayName}
                                                {user.isAdmin && (
                                                    <span style={{ 
                                                        marginLeft: "0.5rem",
                                                        fontSize: "0.75rem",
                                                        color: "hsl(var(--color-warning))",
                                                        background: "rgba(245, 158, 11, 0.1)",
                                                        padding: "0.125rem 0.5rem",
                                                        borderRadius: "4px"
                                                    }}>
                                                        {t('admin.adminBadge')}
                                                    </span>
                                                )}
                                            </h3>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                {user.email}
                                            </p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {t('admin.joined')}: {user.createdAt.toDate().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-center" style={{ gap: "0.5rem" }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "8px",
                                                background: user.isApproved 
                                                    ? "rgba(16, 185, 129, 0.1)" 
                                                    : "rgba(239, 68, 68, 0.1)",
                                                color: user.isApproved 
                                                    ? "hsl(var(--color-success))" 
                                                    : "hsl(var(--color-error))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            {user.isApproved ? <Check size={20} /> : <X size={20} />}
                                        </div>
                                        {modifiedUsers.has(user.uid) && (
                                            <span style={{
                                                fontSize: "0.75rem",
                                                color: "hsl(var(--color-warning))",
                                                background: "rgba(245, 158, 11, 0.1)",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "4px"
                                            }}>
                                                {t('admin.modified')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
