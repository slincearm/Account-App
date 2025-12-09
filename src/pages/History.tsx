import { Link } from "react-router-dom";
import { History as HistoryIcon, ArrowLeft, Calendar, Users } from "lucide-react";
import { useGroups } from "../hooks/useGroups";

export default function History() {
    const { settledGroups, loading } = useGroups();

    if (loading) return <div className="container text-center mt-10">Loading history...</div>;

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <Link to="/" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                <h1 className="text-gradient" style={{ fontSize: "2rem" }}>History</h1>
            </div>

            {settledGroups.length === 0 ? (
                <div className="card text-center" style={{ padding: "3rem" }}>
                    <HistoryIcon size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                    <p style={{ color: "var(--text-muted)" }}>No history of settled groups yet.</p>
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
                                            <Users size={14} /> {group.members?.length} Members
                                        </span>
                                        {group.settledAt && (
                                            <span className="flex-center" style={{ gap: "0.25rem" }}>
                                                <Calendar size={14} />
                                                {group.settledAt.toDate ?
                                                    group.settledAt.toDate().toLocaleDateString() :
                                                    "Unknown Date"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: "0.5rem 1rem", background: "rgba(16, 185, 129, 0.1)", color: "hsl(var(--color-success))", borderRadius: "2rem", fontSize: "0.85rem", fontWeight: "600" }}>
                                    Settled
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
