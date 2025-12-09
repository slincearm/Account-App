import { useMemo } from 'react';

export function useSettlement(expenses, members) {
    return useMemo(() => {
        if (!members || members.length === 0) return { totalSpend: 0, plan: [] };

        const balances = {};
        let totalSpend = 0;

        // Initialize all members with 0
        members.forEach(m => balances[m.uid] = 0);

        expenses.forEach(exp => {
            totalSpend += parseFloat(exp.amount);
            const payer = exp.payerUid;
            const involved = exp.involvedUids || [];
            const splitCount = involved.length;
            if (splitCount === 0) return;

            const splitAmount = parseFloat(exp.amount) / splitCount;

            // Payer paid full amount (credited)
            balances[payer] = (balances[payer] || 0) + parseFloat(exp.amount);

            // Involved subtract share (debited)
            involved.forEach(uid => {
                balances[uid] = (balances[uid] || 0) - splitAmount;
            });
        });

        // Calculate Settlement Plan
        const debtors = [];
        const creditors = [];

        Object.keys(balances).forEach(uid => {
            const net = balances[uid];
            if (net < -0.01) debtors.push({ uid, amount: net });
            if (net > 0.01) creditors.push({ uid, amount: net });
        });

        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const plan = [];
        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const debtAmount = Math.abs(debtor.amount);
            const creditAmount = creditor.amount;
            const settleAmount = Math.min(debtAmount, creditAmount);

            plan.push({
                from: debtor.uid,
                to: creditor.uid,
                amount: settleAmount
            });

            debtor.amount += settleAmount;
            creditor.amount -= settleAmount;

            if (Math.abs(debtor.amount) < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }

        return { totalSpend, plan };
    }, [expenses, members]);
}
