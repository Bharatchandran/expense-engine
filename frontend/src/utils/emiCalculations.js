// Calculate the baseline monthly EMI using the standard amortization formula
export const calculateEmi = (principal, rateYearly, tenureMonths) => {
    if (principal > 0 && rateYearly > 0 && tenureMonths > 0) {
        const r = (rateYearly / 12) / 100;
        const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
        return emi;
    }
    return 0;
};

// Subroutine to calculate remaining balance (for fallback usage or offline preview)
export const calculateFallbackMetrics = (emi) => {
    let completed = 0;
    if (emi.explicitCompletedMonths != null) {
        completed = emi.explicitCompletedMonths;
    } else if (emi.startDate) {
        const start = new Date(emi.startDate);
        const now = new Date();
        let months = (now.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += now.getMonth();
        completed = months > 0 ? months : 0;
    }

    // Ensure we don't go negative or over tenure
    completed = Math.max(0, Math.min(completed, emi.tenureMonths));
    emi.calculatedCompletedMonths = completed;
    emi.remainingMonths = emi.tenureMonths - completed;

    // Remaining Balance Formula = P * [ (1+r)^n - (1+r)^p ] / [ (1+r)^n - 1 ]
    if (completed === 0) {
        emi.remainingPrincipal = emi.principal;
    } else if (completed === emi.tenureMonths) {
        emi.remainingPrincipal = 0;
    } else {
        const r = (emi.interestRate / 12) / 100;
        const num = Math.pow(1 + r, emi.tenureMonths) - Math.pow(1 + r, completed);
        const den = Math.pow(1 + r, emi.tenureMonths) - 1;
        emi.remainingPrincipal = (emi.principal * num) / den;
    }

    emi.monthlyEmi = calculateEmi(emi.principal, emi.interestRate, emi.tenureMonths);
    emi.totalAmountPaid = emi.monthlyEmi * completed;

    return emi;
};
