import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useExpenses } from "../hooks/useExpenses";
import { useSettlement } from "../hooks/useSettlement";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Settlement() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { group, members, loading: groupLoading } = useGroup(groupId);
    const { expenses, loading: expensesLoading } = useExpenses(groupId);

    const { totalSpend, plan: settlementPlan } = useSettlement(expenses, members);

    if (groupLoading || expensesLoading) return <div className="container text-center mt-10">Calculating...</div>;

    const handleSettle = async () => {
        if (!window.confirm("Are you sure you want to settle this group? This will mark it as settled.")) return;

        try {
            await updateDoc(doc(db, "groups", groupId), {
                status: 'settled',
                settledAt: serverTimestamp()
            });
            navigate("/");
        } catch (err) {
            console.error("Failed to settle:", err);
            // alert("Failed to settle group. Please try again.");
        }
    };

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <Link to="/" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                <h1 className="text-gradient" style={{ fontSize: "2rem" }}>Settlement</h1>
            </div>

            <div className="card" style={{ textAlign: "center", marginBottom: "2rem", padding: "3rem 1rem" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Total Group Spending</p>
                <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                    ${totalSpend.toFixed(2)}
                </div>
            </div>

            <h2 style={{ marginBottom: "1rem" }}>Payment Plan</h2>
            <div style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
                {settlementPlan.length === 0 ? (
                    <div className="card text-center" style={{ padding: "2rem" }}>
                        <CheckCircle size={48} style={{ color: "hsl(var(--color-success))", marginBottom: "1rem" }} />
                        <h3>All Settled!</h3>
                        <p style={{ color: "var(--text-muted)" }}>Everyone is even. No payments needed.</p>
                    </div>
                ) : (
                    settlementPlan.map((item, idx) => (
                        <div key={idx} className="card flex-between">
                            <div className="flex-center" style={{ gap: "1rem" }}>
                                <UserBadge uid={item.from} members={members} />
                                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>pays</div>
                                <UserBadge uid={item.to} members={members} />
                            </div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "hsl(var(--color-accent))" }}>
                                ${item.amount.toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
                onClick={handleSettle}
            >
                <CheckCircle size={24} />
                Confirm Settlement
            </button>
        </div>
    );
}

function UserBadge({ uid, members }) {
    const user = members.find(m => m.uid === uid);
    return (
        <div className="flex-center" style={{ gap: "0.5rem" }}>
            {user?.photoURL ? (
                <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: "50%" }} />
            ) : (
                <div style={{ width: 32, height: 32, background: "gray", borderRadius: "50%" }} />
            )}
            <span style={{ fontWeight: 500 }}>{user?.displayName || "Unknown"}</span>
        </div>
    );
}
