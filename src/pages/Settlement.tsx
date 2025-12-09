import { useParams, useNavigate, Link } from "react-router-dom";
import { memo } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useExpenses } from "../hooks/useExpenses";
import { useSettlement } from "../hooks/useSettlement";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useTranslation } from "react-i18next";
import { Member } from "../types";

export default function Settlement() {
    const { groupId } = useParams();
    if (!groupId) return <div className="container text-center mt-10">Invalid group ID</div>;

    const navigate = useNavigate();
    const { members, loading: groupLoading } = useGroup(groupId);
    const { expenses, loading: expensesLoading } = useExpenses(groupId);
    const { t } = useTranslation();

    const { totalSpend, plan: settlementPlan } = useSettlement(expenses, members);

    if (groupLoading || expensesLoading) return <div className="container text-center mt-10">{t('common.loading')}</div>;

    const handleSettle = async () => {
        if (!window.confirm(t('settlement.confirmMessage'))) return;

        try {
            await updateDoc(doc(db, "groups", groupId), {
                status: 'settled',
                settledAt: serverTimestamp()
            });
            navigate("/");
        } catch (err) {
            console.error("Failed to settle:", err);
            alert(t('settlement.failed'));
        }
    };

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <Link to="/" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                <h1 className="text-gradient" style={{ fontSize: "2rem" }}>{t('settlement.title')}</h1>
            </div>

            <div className="card" style={{ textAlign: "center", marginBottom: "2rem", padding: "3rem 1rem" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{t('settlement.totalSpend')}</p>
                <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                    ${totalSpend.toFixed(2)}
                </div>
            </div>

            <h2 style={{ marginBottom: "1rem" }}>{t('settlement.paymentPlan')}</h2>
            <div style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
                {settlementPlan.length === 0 ? (
                    <div className="card text-center" style={{ padding: "2rem" }}>
                        <CheckCircle size={48} style={{ color: "hsl(var(--color-success))", marginBottom: "1rem" }} />
                        <h3>{t('settlement.allSettled')}</h3>
                        <p style={{ color: "var(--text-muted)" }}>{t('settlement.noPayments')}</p>
                    </div>
                ) : (
                    settlementPlan.map((item, idx) => (
                        <div key={idx} className="card flex-between">
                            <div className="flex-center" style={{ gap: "1rem" }}>
                                <UserBadge uid={item.from} members={members} />
                                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t('settlement.pays')}</div>
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
                {t('settlement.confirmSettle')}
            </button>
        </div>
    );
}

const UserBadge = memo(({ uid, members }: { uid: string; members: Member[] }) => {
    const user = members.find((m: Member) => m.uid === uid);
    return (
        <div className="flex-center" style={{ gap: "0.5rem" }}>
            {user?.photoURL ? (
                <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: "50%" }} alt={user.displayName} />
            ) : (
                <div style={{ width: 32, height: 32, background: "gray", borderRadius: "50%" }} />
            )}
            <span style={{ fontWeight: 500 }}>{user?.displayName || "Unknown"}</span>
        </div>
    );
});
