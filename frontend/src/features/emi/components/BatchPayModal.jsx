import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { formatCurrency } from '../../../utils/formatCurrency';

export const BatchPayModal = ({ isOpen, onClose, emis, onPayBulk }) => {
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Only show active EMIs
    const activeEmis = emis.filter(emi => emi.calculatedCompletedMonths < emi.tenureMonths);

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) setSelectedIds(new Set());
    }, [isOpen]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(activeEmis.map(emi => emi.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (id, checked) => {
        const next = new Set(selectedIds);
        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        setSelectedIds(next);
    };

    const handleConfirm = () => {
        if (selectedIds.size > 0) {
            onPayBulk(Array.from(selectedIds));
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] border-white/10 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Batch Pay EMIs</DialogTitle>
                </DialogHeader>

                <div className="overflow-x-auto py-4">
                    <table className="w-full text-sm text-left">
                        <thead className="text-muted-foreground border-b border-border">
                            <tr>
                                <th className="pb-3 pl-2 pr-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-primary text-primary focus:ring-primary h-4 w-4 bg-transparent"
                                        checked={selectedIds.size > 0 && selectedIds.size === activeEmis.length}
                                        onChange={handleSelectAll}
                                        disabled={activeEmis.length === 0}
                                    />
                                </th>
                                <th className="pb-3 px-4 font-semibold">Loan Name</th>
                                <th className="pb-3 px-4 font-semibold text-right">Monthly EMI</th>
                                <th className="pb-3 pl-4 pr-2 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {activeEmis.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-muted-foreground">
                                        No active loans to pay.
                                    </td>
                                </tr>
                            ) : activeEmis.map(emi => (
                                <tr key={emi.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="py-3 pl-2 pr-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-primary text-primary focus:ring-primary h-4 w-4 bg-transparent"
                                            checked={selectedIds.has(emi.id)}
                                            onChange={(e) => handleSelect(emi.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="py-3 px-4 font-medium">{emi.name}</td>
                                    <td className="py-3 px-4 text-primary font-bold text-right">{formatCurrency(emi.monthlyEmi)}</td>
                                    <td className="py-3 pl-4 pr-2 text-muted-foreground">{emi.remainingMonths} mo left</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-border pt-6">
                    <Button variant="outline" onClick={onClose} className="border-border hover:bg-muted">Cancel</Button>
                    <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
                        Pay Selected ({selectedIds.size})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
