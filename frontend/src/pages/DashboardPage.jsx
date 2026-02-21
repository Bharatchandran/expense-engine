import React, { useState } from 'react';
import { useEmiData } from '../features/emi/hooks/useEmiData';
import { AddEmiForm } from '../features/emi/components/AddEmiForm';
import { EmiCard } from '../features/emi/components/EmiCard';
import { BatchPayModal } from '../features/emi/components/BatchPayModal';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileWarning, Layers } from 'lucide-react';

export const DashboardPage = () => {
    const { emis, loading, addEmi, deleteEmi, payEmi, payBulk } = useEmiData();
    const [isBatchModalOpen, setBatchModalOpen] = useState(false);

    // Dashboard calculations
    const activeEmis = emis.filter(e => e.calculatedCompletedMonths < e.tenureMonths);
    const totalMonthly = activeEmis.reduce((sum, e) => sum + e.monthlyEmi, 0);
    const totalPrincipal = activeEmis.reduce((sum, e) => sum + e.remainingPrincipal, 0);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex justify-center selection:bg-primary/30">
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
                <header className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent inline-block">Expense Engine</h1>
                        <p className="text-muted-foreground mt-1">Track your financial liabilities</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card/60 backdrop-blur border-white/5 pt-6">
                        <CardContent>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Monthly EMIs</h3>
                            <div className="text-3xl font-bold text-primary">{formatCurrency(totalMonthly)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur border-white/5 pt-6">
                        <CardContent>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Remaining Balance</h3>
                            <div className="text-3xl font-bold text-white">{formatCurrency(totalPrincipal)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur border-white/5 pt-6">
                        <CardContent>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Loans</h3>
                            <div className="text-3xl font-bold text-white">{activeEmis.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 sticky top-8">
                        <AddEmiForm onAdd={addEmi} loading={loading} />
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold tracking-tight">Your Active EMIs</h2>
                            {activeEmis.length > 0 && (
                                <Button variant="secondary" onClick={() => setBatchModalOpen(true)} className="gap-2">
                                    <Layers className="h-4 w-4" /> Batch Pay
                                </Button>
                            )}
                        </div>

                        {loading && emis.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground font-medium animate-pulse">Loading your data...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {emis.length === 0 ? (
                                    <Card className="col-span-full border-dashed border-2 bg-transparent border-white/10 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                        <FileWarning className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="font-medium">No active loans. Add a new EMI to get started.</p>
                                    </Card>
                                ) : (
                                    emis.map(emi => (
                                        <EmiCard
                                            key={emi.id}
                                            emi={emi}
                                            onPay={payEmi}
                                            onDelete={deleteEmi}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <BatchPayModal
                    isOpen={isBatchModalOpen}
                    onClose={() => setBatchModalOpen(false)}
                    emis={emis}
                    onPayBulk={payBulk}
                />
            </div>
        </div>
    );
};
