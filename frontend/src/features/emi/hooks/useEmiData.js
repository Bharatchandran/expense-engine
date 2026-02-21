import { useState, useEffect } from 'react';
import * as emiService from '../api/emiService';
import { calculateFallbackMetrics } from '../../../utils/emiCalculations';

export const useEmiData = () => {
    const [emis, setEmis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadEmis = async () => {
        setLoading(true);
        try {
            const data = await emiService.fetchEmis();
            setEmis(data);
            setError(null);
            // Sync with local storage for fallback
            localStorage.setItem('demo_emis', JSON.stringify(data));
        } catch (err) {
            console.error("Backend unreachable, using local fallback", err);
            const localData = localStorage.getItem('demo_emis');
            if (localData) {
                setEmis(JSON.parse(localData));
            } else {
                setEmis([{
                    id: 1,
                    name: "Demo Car Loan (Backend offline)",
                    principal: 800000,
                    interestRate: 8.5,
                    tenureMonths: 60,
                    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
                    calculatedCompletedMonths: 12,
                    remainingMonths: 48,
                    remainingPrincipal: 668000,
                    monthlyEmi: 16413,
                    totalAmountPaid: 196956
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmis();
    }, []);

    const addEmi = async (emiData) => {
        setLoading(true);
        try {
            const newEmi = await emiService.addEmi(emiData);
            setEmis(prev => [...prev, newEmi]);
        } catch (err) {
            console.error('Fallback addition', err);
            emiData.id = Date.now();
            calculateFallbackMetrics(emiData);
            setEmis(prev => {
                const next = [...prev, emiData];
                localStorage.setItem('demo_emis', JSON.stringify(next));
                return next;
            });
            alert("Saved locally since backend is unreachable.");
        } finally {
            setLoading(false);
        }
    };

    const deleteEmi = async (id) => {
        setLoading(true);
        try {
            await emiService.deleteEmi(id);
            setEmis(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Fallback deletion', err);
            setEmis(prev => {
                const next = prev.filter(e => e.id !== id);
                localStorage.setItem('demo_emis', JSON.stringify(next));
                return next;
            });
        } finally {
            setLoading(false);
        }
    };

    const payEmi = async (id) => {
        setLoading(true);
        try {
            const updated = await emiService.payEmi(id);
            setEmis(prev => prev.map(e => e.id === id ? updated : e));
        } catch (err) {
            console.error('Fallback payment', err);
            setEmis(prev => {
                const next = [...prev];
                const index = next.findIndex(e => e.id === id);
                if (index !== -1 && next[index].calculatedCompletedMonths < next[index].tenureMonths) {
                    next[index] = { ...next[index] };
                    next[index].explicitCompletedMonths = next[index].calculatedCompletedMonths + 1;
                    calculateFallbackMetrics(next[index]);
                }
                localStorage.setItem('demo_emis', JSON.stringify(next));
                return next;
            });
        } finally {
            setLoading(false);
        }
    };

    const payBulk = async (ids) => {
        setLoading(true);
        try {
            await emiService.payBulk(ids);
            await loadEmis();
        } catch (err) {
            console.error('Fallback bulk payment', err);
            setEmis(prev => {
                const next = prev.map(e => {
                    if (ids.includes(e.id) && e.calculatedCompletedMonths < e.tenureMonths) {
                        const updated = { ...e };
                        updated.explicitCompletedMonths = updated.calculatedCompletedMonths + 1;
                        calculateFallbackMetrics(updated);
                        return updated;
                    }
                    return e;
                });
                localStorage.setItem('demo_emis', JSON.stringify(next));
                return next;
            });
        } finally {
            setLoading(false);
        }
    };

    return { emis, loading, error, addEmi, deleteEmi, payEmi, payBulk, loadEmis };
};
