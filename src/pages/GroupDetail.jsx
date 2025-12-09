import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Plus, UserPlus, ArrowLeft, Calendar, Timer } from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useExpenses } from "../hooks/useExpenses";
import AddExpenseModal from "../components/AddExpenseModal";
import AddMemberModal from "../components/AddMemberModal";
import { useAuth } from "../contexts/AuthContext";

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#6366f1'];

export default function GroupDetail() {
    const { groupId } = useParams();
    const { group, members, addMember, loading: groupLoading } = useGroup(groupId);
    const { expenses, addExpense, loading: expensesLoading } = useExpenses(groupId);

    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    // Group expenses by category for Pie Chart
    const chartData = useMemo(() => {
        const data = {};
        expenses.forEach(e => {
            const cat = e.category || 'Uncategorized';
            data[cat] = (data[cat] || 0) + parseFloat(e.amount);
        });
        return Object.keys(data).map(key => ({ name: key, value: data[key] }));
    }, [expenses]);

    if (groupLoading || expensesLoading) return <div className="container text-center mt-10">Loading details...</div>;
    if (!group) return <div className="container text-center mt-10">Group not found</div>;

    // Helper to find member name
    const getMemberName = (uid) => members.find(m => m.uid === uid)?.displayName || "Unknown";

    return (
        <>
            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                <div className="flex-center" style={{ gap: "1rem" }}>
                    <Link to="/" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: "1.75rem" }}>{group.name}</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {members.length} Members
                        </p>
                    </div>
                </div>
                <div className="flex-center" style={{ gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => setShowAddMember(true)} title="Add Member">
                        <UserPlus size={18} />
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Chart Section */}
                <div className="card" style={{ minHeight: "300px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Spending by Category</h3>
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
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "8px", color: "white" }}
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-center" style={{ flex: 1, color: "var(--text-muted)" }}>No expenses yet</div>
                    )}
                </div>

                {/* Members List (Mini) */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem" }}>Members</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {members.map(m => (
                            <div key={m.uid} className="flex-center" style={{
                                background: "rgba(255,255,255,0.05)",
                                padding: "0.5rem 1rem",
                                borderRadius: "2rem",
                                border: "1px solid var(--glass-border)",
                                gap: "0.5rem"
                            }}>
                                {m.photoURL ? (
                                    <img src={m.photoURL} alt="" style={{ width: 20, height: 20, borderRadius: "50%" }} />
                                ) : <div style={{ width: 20, height: 20, background: "gray", borderRadius: "50%" }} />}
                                <span style={{ fontSize: "0.9rem" }}>{m.displayName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.5rem" }}>Expenses</h2>
                <button className="btn btn-primary" onClick={() => setShowAddExpense(true)}>
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {expenses.map(expense => {
                    const payerName = getMemberName(expense.payerUid);
                    const splitCount = expense.involvedUids?.length || 1;
                    const perPerson = expense.amount / splitCount;

                    return (
                        <div key={expense.id} className="card flex-between">
                            <div className="flex-center" style={{ gap: "1rem", justifyContent: "flex-start" }}>
                                <div style={{
                                    width: 48, height: 48,
                                    borderRadius: "12px",
                                    background: "var(--surface-dark)",
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    border: "1px solid var(--glass-border)"
                                }}>
                                    <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                                    <span style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                                        {expense.timestamp?.toDate ?
                                            expense.timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                            : ''}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: "1.1rem" }}>{expense.description}</h4>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                        <span style={{ color: "hsl(var(--color-primary))" }}>{expense.category}</span> • Paid by <strong>{payerName}</strong>
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "hsl(var(--color-success))" }}>
                                    ${expense.amount.toFixed(2)}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    (${perPerson.toFixed(2)} / {splitCount})
                                </div>
                            </div>
                        </div>
                    );
                })}
                {expenses.length === 0 && (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "2rem" }}>No expenses recorded.</p>
                )}
            </div>

            {showAddExpense && (
                <AddExpenseModal
                    groupId={groupId}
                    groupMembers={members}
                    onClose={() => setShowAddExpense(false)}
                    onAdd={addExpense}
                />
            )}

            {showAddMember && (
                <AddMemberModal
                    currentMemberIds={group.members}
                    onClose={() => setShowAddMember(false)}
                    onAdd={async (uid) => {
                        await addMember(uid);
                        setShowAddMember(false);
                    }}
                />
            )}
        </>
    );
}
