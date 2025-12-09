import { Link } from "react-router-dom";
import { History as HistoryIcon, ArrowLeft, Calendar, Users, Trash2 } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { useTranslation } from "react-i18next";

export default function History() {
    const { settledGroups, loading, deleteGroup } = useGroups();
    const { t } = useTranslation();

    const handleDeleteGroup = async (groupId: string, groupName: string, e: React.MouseEvent): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(t('history.confirmDelete', { name: groupName }))) return;

        try {
            await deleteGroup(groupId);
        } catch (error) {
            console.error("Failed to delete group:", error);
            alert(t('errors.deleteGroupFailed'));
        }
    };

    if (loading) return <div className="container text-center mt-10">{t('common.loading')}</div>;

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <Link to="/" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                <h1 className="text-gradient" style={{ fontSize: "2rem" }}>{t('history.title')}</h1>
            </div>

            {settledGroups.length === 0 ? (
                <div className="card text-center" style={{ padding: "3rem" }}>
                    <HistoryIcon size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                    <p style={{ color: "var(--text-muted)" }}>{t('history.noHistory')}</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {settledGroups.map(group => (
                        <Link key={group.id} to={`/history/${group.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="card flex-between" style={{ transition: "transform 0.2s", cursor: "pointer" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{group.name}</h3>
                                    <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        <span className="flex-center" style={{ gap: "0.25rem" }}>
                                            <Users size={14} /> {group.members?.length} {t('dashboard.members')}
                                        </span>
                                        {group.settledAt && (
                                            <span className="flex-center" style={{ gap: "0.25rem" }}>
                                                <Calendar size={14} />
                                                {group.settledAt.toDate ?
                                                    group.settledAt.toDate().toLocaleDateString() :
                                                    t('group.unknown')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-center" style={{ gap: "0.5rem" }}>
                                    <div style={{ padding: "0.5rem 1rem", background: "rgba(16, 185, 129, 0.1)", color: "hsl(var(--color-success))", borderRadius: "2rem", fontSize: "0.85rem", fontWeight: "600" }}>
                                        {t('history.settled')}
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                                        title={t('common.delete')}
                                        style={{ padding: "0.5rem", color: "hsl(var(--color-danger))" }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
