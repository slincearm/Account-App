import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { useGroup } from "../hooks/useGroup";
import { useExpenses } from "../hooks/useExpenses";
import { useSettlement } from "../hooks/useSettlement";
import { useTranslation } from "react-i18next";

// Category color map (match GroupDetail)
const CATEGORY_COLORS: Record<string, string> = {
    food: '#10b981',
    clothing: '#ec4899',
    housing: '#3b82f6',
    transportation: '#f59e0b',
    education: '#8b5cf6',
    entertainment: '#06b6d4',
    miscellaneous: '#6366f1',
    uncategorized: '#64748b'
};

const getCategoryColor = (category: string): string => {
    return (CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? CATEGORY_COLORS.uncategorized) as string;
};

const CATEGORY_ORDER = ['food', 'clothing', 'housing', 'transportation', 'education', 'entertainment', 'miscellaneous'];

export default function HistoryDetail() {
    const { groupId } = useParams();
    const { t } = useTranslation();
    if (!groupId) return <div className="container text-center mt-10">{t('group.invalidGroupId')}</div>;

    const { group, members, loading: groupLoading } = useGroup(groupId);
    const { expenses, loading: expensesLoading } = useExpenses(groupId);
    const { totalSpend, plan: settlementPlan } = useSettlement(expenses, members); // Reusing logic
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Pie Chart Data Logic (Replicated from GroupDetail, ideally could be a hook but it's small)
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        expenses.forEach(e => {
            const cat = (e.category || 'uncategorized').toString();
            data[cat] = (data[cat] || 0) + Number(e.amount);
        });

        const sortedKeys = Object.keys(data).sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        return sortedKeys.map(key => ({
            name: key === 'uncategorized' ? t('group.uncategorized') : t(`expense.categories.${key}`, { defaultValue: key }),
            value: data[key],
            categoryKey: key
        }));
    }, [expenses, t]);

    // If a category is selected, we could filter list/details — reserved for future use

    if (groupLoading || expensesLoading) return <div className="container text-center mt-10">{t('group.loadingDetails')}</div>;

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <Link to="/history" style={{ color: "var(--text-secondary)" }}><ArrowLeft /></Link>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: "2rem" }}>{group?.name}</h1>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('history.summaryTitle')}</span>
                </div>
            </div>

            <div className="card" style={{ textAlign: "center", marginBottom: "2rem", padding: "2rem" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{t('group.totalSpending')}</p>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                    ${totalSpend.toFixed(2)}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Payment Plan Summary */}
                <div>
                    <h3 style={{ marginBottom: "1rem" }}>{t('history.settledPayments')}</h3>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {settlementPlan.length === 0 ? (
                            <p style={{ color: "var(--text-muted)" }}>{t('history.noPaymentsNeeded')}</p>
                        ) : (
                            settlementPlan.map((item, idx) => (
                                <div key={idx} className="card flex-between" style={{ padding: "1rem" }}>
                                    <div className="flex-center" style={{ gap: "0.5rem", fontSize: "0.9rem" }}>
                                        <strong>{members.find(m => m.uid === item.from)?.displayName}</strong>
                                        <span style={{ color: "var(--text-muted)" }}>{t('settlement.pays')}</span>
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

                {/* Pie Chart (match GroupDetail style) */}
                <div className="card" style={{ minHeight: "300px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1rem" }}>{t('history.spendingBreakdown')}</h3>

                    {chartData.length > 0 ? (
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
                                                background: selectedCategory === entry.categoryKey ? "rgba(139, 92, 246, 0.08)" : "transparent"
                                            }}
                                            onClick={() => setSelectedCategory(entry.categoryKey)}
                                        >
                                            <div style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 3,
                                                background: getCategoryColor(entry.categoryKey)
                                            }} />
                                            <div style={{ fontSize: "0.8rem" }}>
                                                <div style={{ color: getCategoryColor(entry.categoryKey), fontWeight: 600 }}>{entry.name}</div>
                                                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>${(entry.value || 0).toFixed(2)}</div>
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
                                                    const { cx, cy, midAngle, outerRadius, name, percent, payload } = props as any;
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
                                                labelLine={{ stroke: 'var(--text-secondary)', strokeWidth: 1 }}
                                            >
                                                {chartData.map((entry) => (
                                                    <Cell key={`cell-${entry.categoryKey}`} fill={getCategoryColor(entry.categoryKey)} />
                                                ))}
                                                <Label value={`${expenses.length}`} position="center" style={{ fontSize: '28px', fontWeight: 'bold', fill: 'var(--text-primary)' }} />
                                                <Label value={t('group.expenseCount')} position="center" dy={22} style={{ fontSize: '10px', fill: 'var(--text-secondary)' }} />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-center" style={{ flex: 1, color: "var(--text-muted)" }}>{t('common.noData')}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
