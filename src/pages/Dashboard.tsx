import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Users, History, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useGroups } from "../hooks/useGroups";
import CreateGroupModal from "../components/CreateGroupModal";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { activeGroups, loading, createGroup } = useGroups();
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSettleClick = (groupId: string): void => {
        navigate(`/settle/${groupId}`);
    };

    if (loading) return <div className="container text-center mt-10">{t('common.loading')}</div>;

    return (
        <>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{t('dashboard.title')}</h1>
                    <p style={{ color: "var(--text-secondary)" }}>{t('common.welcome')}, {currentUser?.displayName}</p>
                </div>
                <div className="flex-center" style={{ gap: "1rem" }}>
                    <Link to="/history" className="btn btn-secondary">
                        <History size={18} />
                        <span className="hide-mobile">{t('dashboard.history')}</span>
                    </Link>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        {t('dashboard.newGroup')}
                    </button>
                </div>
            </div>

            <div>
                <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>{t('dashboard.activeGroups')}</h2>

                {activeGroups.length === 0 ? (
                    <div className="card text-center" style={{ padding: "3rem" }}>
                        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>{t('dashboard.noGroups')}</p>
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            {t('dashboard.createFirst')}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {activeGroups.map(group => (
                            <div key={group.id} className="card flex-between">
                                <Link to={`/group/${group.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                                    <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem" }}>
                                        <div style={{
                                            width: 48, height: 48,
                                            background: "rgba(139, 92, 246, 0.1)",
                                            borderRadius: "12px",
                                            color: "hsl(var(--color-primary))"
                                        }} className="flex-center">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{group.name}</h3>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                {group.members?.length} {t('dashboard.members')}
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <button
                                    className="btn btn-secondary"
                                    style={{ marginLeft: "1rem" }}
                                    onClick={() => handleSettleClick(group.id)}
                                    title={t('dashboard.settle')}
                                >
                                    <CheckCircle size={18} style={{ color: "hsl(var(--color-success))" }} />
                                    <span className="hide-mobile">{t('dashboard.settle')}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createGroup}
                />
            )}
        </>
    );
}
