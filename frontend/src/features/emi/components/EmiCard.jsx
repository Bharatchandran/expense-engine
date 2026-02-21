import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Check, Trash2 } from 'lucide-react';

export const EmiCard = ({ emi, onPay, onDelete }) => {
    const dateStr = emi.startDate ? new Date(emi.startDate).toLocaleDateString() : 'Manual';
    const progressPercent = Math.min(100, (emi.calculatedCompletedMonths / emi.tenureMonths) * 100);

    return (
        <Card className="flex flex-col h-full bg-card/60 backdrop-blur border-white/5">
            <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight text-white mb-1.5">{emi.name}</CardTitle>
                        <CardDescription>{emi.startDate ? `Started: ${dateStr}` : `Paid so far: ${formatCurrency(emi.totalAmountPaid)}`}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => onPay(emi.id)} title="Mark 1 Month Paid" className="h-8 w-8 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:text-green-400">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => onDelete(emi.id)} title="Delete" className="h-8 w-8 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Remaining</span>
                        <span className="text-lg font-semibold text-white">{formatCurrency(emi.remainingPrincipal)}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly EMI</span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(emi.monthlyEmi)}</span>
                    </div>
                </div>

                <div className="mt-auto pt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>{emi.calculatedCompletedMonths} completed</span>
                        <span>{emi.remainingMonths} months left</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-in-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
