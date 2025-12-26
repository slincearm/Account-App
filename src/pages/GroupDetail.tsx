import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Plus, UserPlus, ArrowLeft, Calendar, Trash2, X } from "lucide-react";
import { useGroup } from "../hooks/useGroup";
import { useExpenses } from "../hooks/useExpenses";
import { Expense } from "../types";
import AddExpenseModal from "../components/AddExpenseModal";
import AddMemberModal from "../components/AddMemberModal";
import { useTranslation } from "react-i18next";

const PREDEFINED_CATEGORIES = ["food", "clothing", "housing", "transportation", "education", "entertainment", "miscellaneous"];

// Category color mapping - must match index.css definitions
const CATEGORY_COLORS: Record<string, string> = {
    food: '#10b981',        // Green
    clothing: '#ec4899',    // Pink
    housing: '#3b82f6',     // Blue
    transportation: '#f59e0b', // Amber
    education: '#8b5cf6',   // Purple
    entertainment: '#06b6d4', // Cyan
    miscellaneous: '#6366f1', // Indigo
    custom: '#64748b'       // Slate
};

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
    food: '🍔',
    clothing: '👕',
    housing: '🏠',
    transportation: '🚗',
    education: '📚',
    entertainment: '🎮',
    miscellaneous: '📦'
};

const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.custom!;
};

const getCategoryIcon = (category: string): string => {
    return CATEGORY_ICONS[category] || '⚙️';
};

// Category order for consistent display
const CATEGORY_ORDER = ['food', 'clothing', 'housing', 'transportation', 'education', 'entertainment', 'miscellaneous'];

export default function GroupDetail() {
    const { groupId } = useParams();
    const { t } = useTranslation();

    if (!groupId) return <div className="container text-center mt-10">{t('group.invalidGroupId')}</div>;

    const { group, members, addMember, addTemporaryMember, loading: groupLoading } = useGroup(groupId);
    const { expenses, addExpense, deleteExpense, updateExpense, loading: expensesLoading } = useExpenses(groupId);

    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

    const handleDeleteExpense = async (expenseId: string, description: string): Promise<void> => {
        if (!window.confirm(t('group.confirmDeleteExpense', { description }))) return;

        try {
            await deleteExpense(expenseId);
        } catch (error) {
            console.error("Failed to delete expense:", error);
            alert(t('errors.deleteExpenseFailed'));
        }
    };

    // Helper to find member name
    const getMemberName = (uid: string): string => members.find(m => m.uid === uid)?.displayName || t('group.unknown');

    // Calculate total spending
    const totalSpending = useMemo(() => {
        return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    }, [expenses]);

    // Get date range for the group (earliest expense to today)
    const dateRange = useMemo(() => {
        if (expenses.length === 0) return '';

        // Find earliest expense date
        const earliestExpense = expenses.reduce((earliest, expense) => {
            const expenseDate = expense.timestamp?.toDate();
            if (!expenseDate) return earliest;
            if (!earliest || expenseDate < earliest) return expenseDate;
            return earliest;
        }, null as Date | null);

        if (!earliestExpense) return '';

        const locale = t('common.locale', { defaultValue: 'zh-TW' });

        const formatDate = (date: Date) => {
            if (locale === 'en') {
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            } else {
                return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
            }
        };

        return `${formatDate(earliestExpense)} - ${t('group.today')}`;
    }, [expenses, t]);

    // Calculate who paid and who owes
    const balances = useMemo(() => {
        const paid: Record<string, number> = {};
        const share: Record<string, number> = {};

        // Initialize all members
        members.forEach(m => {
            paid[m.uid] = 0;
            share[m.uid] = 0;
        });

        // Calculate paid and share amounts
        expenses.forEach(expense => {
            paid[expense.payerUid] = (paid[expense.payerUid] || 0) + expense.amount;
            const splitCount = expense.involvedUids?.length || 1;
            const perPerson = expense.amount / splitCount;
            expense.involvedUids?.forEach(uid => {
                share[uid] = (share[uid] || 0) + perPerson;
            });
        });

        // Calculate balances (positive = owed money, negative = owes money)
        return Object.keys(paid).map(uid => ({
            uid,
            name: getMemberName(uid),
            paid: paid[uid] || 0,
            share: share[uid] || 0,
            balance: (paid[uid] || 0) - (share[uid] || 0)
        })).sort((a, b) => b.balance - a.balance);
    }, [expenses, members]);

    // Group expenses by category for Pie Chart
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(e => {
            const cat = e.category || 'uncategorized';
            data[cat] = (data[cat] || 0) + Number(e.amount);
        });

        // Sort by predefined category order
        const sortedKeys = Object.keys(data).sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);

            // If both are in predefined categories, sort by order
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // Predefined categories come first
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // Custom categories sorted alphabetically
            return a.localeCompare(b);
        });

        return sortedKeys.map(key => ({
            name: key === 'uncategorized' ? t('group.uncategorized') : t(`expense.categories.${key}`, { defaultValue: key }),
            value: data[key],
            categoryKey: key // Keep original category key for filtering
        }));
    }, [expenses, t]);

    // Get expenses for selected category
    const categoryExpenses = useMemo(() => {
        if (!selectedCategory) return [];
        return expenses
            .filter(e => (e.category || 'uncategorized') === selectedCategory)
            .sort((a, b) => {
                const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
                const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
                return timeB - timeA;
            });
    }, [expenses, selectedCategory]);

    // Group expenses by date
    const expensesByDate = useMemo(() => {
        const grouped: Record<string, typeof expenses> = {};

        // Filter expenses by selected member if active
        const filteredExpenses = selectedMember
            ? expenses.filter(e => e.payerUid === selectedMember)
            : expenses;

        filteredExpenses.forEach(expense => {
            if (!expense.timestamp?.toDate) return;

            const date = expense.timestamp.toDate();
            const dateKey = date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(expense);
        });

        // Sort by date (newest first) and sort expenses within each date by time (newest first)
        return Object.entries(grouped)
            .sort(([dateA], [dateB]) => {
                const [yearA = 0, monthA = 0, dayA = 0] = dateA.split('/').map(Number);
                const [yearB = 0, monthB = 0, dayB = 0] = dateB.split('/').map(Number);
                const timeA = new Date(yearA, monthA - 1, dayA).getTime();
                const timeB = new Date(yearB, monthB - 1, dayB).getTime();
                return timeB - timeA;
            })
            .map(([date, exps]) => ({
                date,
                expenses: exps.sort((a, b) => {
                    const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
                    const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
                    return timeB - timeA;
                }),
                totalAmount: exps.reduce((sum, e) => sum + e.amount, 0)
            }));
    }, [expenses, selectedMember]);

    if (groupLoading || expensesLoading) return <div className="container text-center mt-10">{t('group.loadingDetails')}</div>;
    if (!group) return <div className="container text-center mt-10">{t('group.groupNotFound')}</div>;

    return (
        <>
            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                <div className="flex-center" style={{ gap: "1rem" }}>
                    <Link to="/" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <h1 className="text-gradient" style={{ fontSize: "1.75rem", margin: 0 }}>{group.name}</h1>
                            {group.isTemporary && (
                                <span style={{
                                    fontSize: "0.75rem",
                                    color: "hsl(var(--color-primary))",
                                    padding: "0.3rem 0.6rem",
                                    background: "rgba(139, 92, 246, 0.15)",
                                    borderRadius: "6px",
                                    fontWeight: 600
                                }}>
                                    {t('group.temporary')}
                                </span>
                            )}
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                            {members.length} {t('group.members')}
                        </p>
                    </div>
                </div>
                <div className="flex-center" style={{ gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => setShowAddMember(true)} title={t('group.addMember')}>
                        <UserPlus size={18} />
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Chart Section */}
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "0.5rem" }}>{t('group.spendingByCategory')} </h3>
                    {chartData.length > 0 ? (
                        <>
                            {/* Total Spending */}
                            <div style={{
                                textAlign: "center",
                                marginBottom: "1rem",
                                padding: "0.75rem",
                                background: "rgba(139, 92, 246, 0.1)",
                                borderRadius: "8px",
                                border: "1px solid rgba(139, 92, 246, 0.2)"
                            }}  onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                                    {dateRange}
                                </div>
                                <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "hsl(var(--color-primary))" }}>
                                    ${totalSpending.toFixed(0)}
                                </div>
                            </div>
                            { isCategoryExpanded && (
                                <>
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                        {/* Category List */}
                                        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                            {chartData.map((entry) => (
                                                <div
                                                    key={entry.categoryKey}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        cursor: "pointer",
                                                        padding: "0.25rem 0.5rem",
                                                        borderRadius: "6px",
                                                        transition: "all 0.2s ease",
                                                        background: "transparent"
                                                    }}
                                                    onClick={() => setSelectedCategory(entry.categoryKey)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "transparent";
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: "1.2rem",
                                                        lineHeight: 1,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}>
                                                        {getCategoryIcon(entry.categoryKey)}
                                                    </div>
                                                    <div style={{ fontSize: "0.8rem" }}>
                                                        <div style={{
                                                            color: `var(--category-${entry.categoryKey})`,
                                                            fontWeight: "600"
                                                        }}>{entry.name}</div>
                                                        <div style={{
                                                            color: getCategoryColor(entry.categoryKey),
                                                            fontWeight: "600"
                                                        }}>
                                                            ${(entry.value || 0).toFixed(0)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pie Chart */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={35}
                                                        outerRadius={50}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={(props) => {
                                                            const { cx, cy, midAngle, outerRadius, name, percent, payload } = props;
                                                            const RADIAN = Math.PI / 180;
                                                            const radius = (outerRadius || 50) + 25;
                                                            const angle = midAngle || 0;
                                                            const x = (cx || 0) + radius * Math.cos(-angle * RADIAN);
                                                            const y = (cy || 0) + radius * Math.sin(-angle * RADIAN);
                                                            const percentage = ((percent || 0) * 100).toFixed(1);
                                                            const color = getCategoryColor(payload?.categoryKey || '');

                                                            return (
                                                                <text
                                                                    x={x}
                                                                    y={y}
                                                                    fill={color}
                                                                    textAnchor={x > cx ? 'start' : 'end'}
                                                                    dominantBaseline="central"
                                                                    fontSize="11px"
                                                                >
                                                                    <tspan x={x} dy="-0.5em">{name}</tspan>
                                                                    <tspan x={x} dy="1.2em">{percentage}%</tspan>
                                                                </text>
                                                            );
                                                        }}
                                                        labelLine={{
                                                            stroke: 'var(--text-secondary)',
                                                            strokeWidth: 1
                                                        }}
                                                    >
                                                        {chartData.map((entry) => (
                                                            <Cell key={`cell-${entry.categoryKey}`} fill={getCategoryColor(entry.categoryKey)} />
                                                        ))}
                                                        <Label
                                                            value={`${expenses.length}`}
                                                            position="center"
                                                            style={{
                                                                fontSize: '28px',
                                                                fontWeight: 'bold',
                                                                fill: 'var(--text-primary)'
                                                            }}
                                                        />
                                                        <Label
                                                            value={t('group.expenseCount')}
                                                            position="center"
                                                            dy={22}
                                                            style={{
                                                                fontSize: '10px',
                                                                fill: 'var(--text-secondary)'
                                                            }}
                                                        />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    {/* Balance Summary */}
                                    <div style={{ marginTop: "1rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1rem" }}>
                                        <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
                                            {t('group.balanceSummary')}
                                        </h4>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                            {balances.map(b => (
                                                <div key={b.uid} style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    fontSize: "0.85rem",
                                                    padding: "0.5rem",
                                                    background: selectedMember === b.uid ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.03)",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    border: selectedMember === b.uid ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent"
                                                }}
                                                onClick={() => setSelectedMember(selectedMember === b.uid ? null : b.uid)}
                                                onMouseEnter={(e) => {
                                                    if (selectedMember !== b.uid) {
                                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedMember !== b.uid) {
                                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                                                    }
                                                }}>
                                                    <div>
                                                        <span style={{ fontWeight: "500", color: selectedMember === b.uid ? "hsl(var(--color-primary))" : "var(--text-primary)" }}>{b.name}</span>
                                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                                                            {t('group.paid')}: ${b.paid.toFixed(0)}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        fontWeight: "600",
                                                        color: b.balance > 0.01 ? "hsl(var(--color-success))" :
                                                                b.balance < -0.01 ? "hsl(var(--color-danger))" :
                                                                "var(--text-muted)"
                                                    }}>
                                                        {b.balance > 0.01 ? `${t('group.receivable')} $${b.balance.toFixed(0)}` :
                                                            b.balance < -0.01 ? `${t('group.payable')} $${Math.abs(b.balance).toFixed(0)}` :
                                                            t('group.settled')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex-center" style={{ flex: 1, color: "var(--text-muted)" }}>{t('group.noExpenses')}</div>
                    )}
                </div>

                {/* Members List (Mini) */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem" }}>{t('group.members')}</h3>
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
                <h2 style={{ fontSize: "1.5rem" }}>{t('group.expenses')}</h2>
                <button className="btn btn-primary" onClick={() => setShowAddExpense(true)}>
                    <Plus size={18} /> {t('group.addItem')}
                </button>
            </div>

            {/* Filter Banner */}
            {selectedMember && (
                <div style={{
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            {t('group.paidBy')}: <strong style={{ color: "hsl(var(--color-primary))" }}>{getMemberName(selectedMember)}</strong>
                        </span>
                    </div>
                    <button
                        onClick={() => setSelectedMember(null)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "hsl(var(--color-primary))",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            transition: "background 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                        }}
                    >
                        <X size={16} /> {t('common.cancel')}
                    </button>
                </div>
            )}

            <div style={{ display: "grid", gap: "1rem" }}>
                {expensesByDate.map(({ date, expenses: dailyExpenses, totalAmount }) => (
                    <div key={date} className="card" style={{ padding: "1.25rem" }}>
                        {/* Date Header */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem",
                            paddingBottom: "0.75rem",
                            borderBottom: "1px solid var(--glass-border)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Calendar size={18} style={{ color: "hsl(var(--color-primary))" }} />
                                <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>{date}</h3>
                            </div>
                            <div style={{
                                fontSize: "0.95rem",
                                fontWeight: "600",
                                color: "hsl(var(--color-primary))"
                            }}>
                                ${totalAmount.toFixed(0)}
                            </div>
                        </div>

                        {/* Expenses List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {dailyExpenses.map(expense => {
                                const payerName = getMemberName(expense.payerUid);
                                const splitCount = expense.involvedUids?.length || 1;
                                const perPerson = expense.amount / splitCount;

                                return (
                                    <div
                                        key={expense.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.75rem",
                                            background: "rgba(255, 255, 255, 0.03)",
                                            borderRadius: "8px",
                                            border: "1px solid var(--glass-border)",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                                        }}
                                        onClick={() => setEditingExpense(expense)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                                            e.currentTarget.style.borderColor = "hsl(var(--color-primary) / 0.3)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                                            e.currentTarget.style.borderColor = "var(--glass-border)";
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: "50px",
                                                padding: "0.25rem 0.5rem",
                                                background: "rgba(139, 92, 246, 0.1)",
                                                borderRadius: "6px",
                                                border: "1px solid rgba(139, 92, 246, 0.2)",
                                                fontSize: "0.8rem",
                                                color: "var(--text-secondary)"
                                            }}>
                                                {expense.timestamp?.toDate ?
                                                    expense.timestamp.toDate().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
                                                    : '--:--'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: "1rem", margin: "0 0 0.25rem 0" }}>{expense.description}</h4>
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                                                    <span style={{
                                                        color: PREDEFINED_CATEGORIES.includes(expense.category)
                                                            ? `var(--category-${expense.category})`
                                                            : 'var(--category-custom)',
                                                        fontWeight: "600"
                                                    }}>
                                                        {t(`expense.categories.${expense.category}`, { defaultValue: expense.category })}
                                                    </span>
                                                    {' • '}
                                                    {t('group.paidBy')} <strong>{payerName}</strong>
                                                    {' • '}
                                                    <span style={{ color: "var(--text-muted)" }}>
                                                        ${perPerson.toFixed(1)} / {splitCount}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{
                                                fontSize: "1.05rem",
                                                fontWeight: "bold",
                                                color: "hsl(var(--color-success))",
                                                minWidth: "80px",
                                                textAlign: "right"
                                            }}>
                                                ${expense.amount.toFixed(0)}
                                            </div>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteExpense(expense.id, expense.description);
                                                }}
                                                title={t('common.delete')}
                                                style={{
                                                    padding: "0.5rem",
                                                    color: "hsl(var(--color-danger))",
                                                    minWidth: "auto"
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {expenses.length === 0 && (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "2rem" }}>{t('group.noExpensesRecorded')}</p>
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

            {editingExpense && (
                <AddExpenseModal
                    groupId={groupId}
                    groupMembers={members}
                    onClose={() => setEditingExpense(null)}
                    onAdd={addExpense}
                    editingExpense={editingExpense}
                    onUpdate={updateExpense}
                />
            )}

            {showAddMember && (
                <AddMemberModal
                    currentMemberIds={group.members}
                    onClose={() => setShowAddMember(false)}
                    isTemporary={group.isTemporary}
                    onAdd={async (uid) => {
                        try {
                            await addMember(uid);
                            setShowAddMember(false);
                        } catch (error) {
                            console.error("Failed to add member:", error);
                            alert(t('errors.addMemberFailed'));
                        }
                    }}
                    onAddTemporary={async (name) => {
                        try {
                            await addTemporaryMember(name);
                            setShowAddMember(false);
                        } catch (error) {
                            console.error("Failed to add temporary member:", error);
                            alert(t('errors.addMemberFailed'));
                        }
                    }}
                />
            )}

            {/* Category Details Modal */}
            {selectedCategory && (
                <div
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100
                    }}
                    onClick={() => setSelectedCategory(null)}
                >
                    <div
                        className="card"
                        style={{ width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", position: "relative" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer"
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>
                            {selectedCategory === 'uncategorized'
                                ? t('group.uncategorized')
                                : t(`expense.categories.${selectedCategory}`, { defaultValue: selectedCategory })}
                        </h3>

                        <div style={{
                            marginBottom: "1rem",
                            padding: "0.75rem",
                            background: "rgba(139, 92, 246, 0.1)",
                            borderRadius: "8px",
                            border: "1px solid rgba(139, 92, 246, 0.2)"
                        }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                {t('group.totalSpending')}
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(var(--color-primary))" }}>
                                ${categoryExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(0)}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                {categoryExpenses.length} {categoryExpenses.length === 1 ? t('group.expenses').slice(0, -1) : t('group.expenses')}
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {categoryExpenses.map(expense => {
                                const payerName = getMemberName(expense.payerUid);
                                const splitCount = expense.involvedUids?.length || 1;
                                const perPerson = expense.amount / splitCount;
                                const expenseDate = expense.timestamp?.toDate?.();

                                return (
                                    <div
                                        key={expense.id}
                                        style={{
                                            padding: "0.75rem",
                                            background: "rgba(255, 255, 255, 0.03)",
                                            borderRadius: "8px",
                                            border: "1px solid var(--glass-border)",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                                        }}
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setEditingExpense(expense);
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                                            e.currentTarget.style.borderColor = "hsl(var(--color-primary) / 0.3)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                                            e.currentTarget.style.borderColor = "var(--glass-border)";
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                                    <h4 style={{ fontSize: "1rem", margin: 0 }}>{expense.description}</h4>
                                                    {expenseDate && (
                                                        <span style={{
                                                            fontSize: "0.75rem",
                                                            color: "var(--text-muted)",
                                                            padding: "0.125rem 0.5rem",
                                                            background: "rgba(139, 92, 246, 0.1)",
                                                            borderRadius: "4px"
                                                        }}>
                                                            {expenseDate.toLocaleDateString('zh-TW')} {expenseDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                                                    {t('group.paidBy')} <strong>{payerName}</strong>
                                                    {' • '}
                                                    <span style={{ color: "var(--text-muted)" }}>
                                                        ${perPerson.toFixed(1)} / {splitCount}
                                                    </span>
                                                </p>
                                            </div>
                                            <div style={{
                                                fontSize: "1.1rem",
                                                fontWeight: "bold",
                                                color: "hsl(var(--color-success))",
                                                minWidth: "80px",
                                                textAlign: "right"
                                            }}>
                                                ${expense.amount.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {categoryExpenses.length === 0 && (
                            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                                {t('group.noExpenses')}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
