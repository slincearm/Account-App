import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useGroup } from "../hooks/useGroup";
import { useExpenses } from "../hooks/useExpenses";
import { useSettlement } from "../hooks/useSettlement";

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#6366f1'];

export default function HistoryDetail() {
    const { groupId } = useParams();
    if (!groupId) return <div className="container text-center mt-10">Invalid group ID</div>;

    const { group, members, loading: groupLoading } = useGroup(groupId);
    const { expenses, loading: expensesLoading } = useExpenses(groupId);
    const { totalSpend, plan: settlementPlan } = useSettlement(expenses, members); // Reusing logic

    // Pie Chart Data Logic (Replicated from GroupDetail, ideally could be a hook but it's small)
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(e => {
            const cat = e.category || 'Uncategorized';
            data[cat] = (data[cat] || 0) + Number(e.amount);
        });
        return Object.keys(data).map(key => ({ name: key, value: data[key] }));
    }, [expenses]);

    if (groupLoading || expensesLoading) return <div className="container text-center mt-10">Loading details...</div>;

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <Link to="/history" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: "2rem" }}>{group?.name}</h1>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Settled Group Summary</span>
                </div>
            </div>

            <div className="card" style={{ textAlign: "center", marginBottom: "2rem", padding: "2rem" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Total Spending</p>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                    ${totalSpend.toFixed(2)}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Payment Plan Summary */}
                <div>
                    <h3 style={{ marginBottom: "1rem" }}>Settled Payments</h3>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {settlementPlan.length === 0 ? (
                            <p style={{ color: "var(--text-muted)" }}>No payments were needed.</p>
                        ) : (
                            settlementPlan.map((item, idx) => (
                                <div key={idx} className="card flex-between" style={{ padding: "1rem" }}>
                                    <div className="flex-center" style={{ gap: "0.5rem", fontSize: "0.9rem" }}>
                                        <strong>{members.find(m => m.uid === item.from)?.displayName}</strong>
                                        <span style={{ color: "var(--text-muted)" }}>paid</span>
                                        <strong>{members.find(m => m.uid === item.to)?.displayName}</strong>
                                    </div>
                                    <div style={{ fontWeight: "bold", color: "hsl(var(--color-accent))" }}>
                                        ${item.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="card" style={{ minHeight: "300px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Spending Breakdown</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "8px", color: "white" }}
                                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-center" style={{ flex: 1, color: "var(--text-muted)" }}>No data</div>
                    )}
                </div>
            </div>
        </div>
    );
}
