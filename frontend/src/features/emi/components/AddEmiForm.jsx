import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { calculateEmi } from '../../../utils/emiCalculations';
import { formatCurrency } from '../../../utils/formatCurrency';

export const AddEmiForm = ({ onAdd, loading }) => {
    const [trackingMethod, setTrackingMethod] = useState('date');
    const [name, setName] = useState('');
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [startDate, setStartDate] = useState('');
    const [completedMonths, setCompletedMonths] = useState('');
    const [previewEmi, setPreviewEmi] = useState(0);

    useEffect(() => {
        const p = parseFloat(principal) || 0;
        const r = parseFloat(interestRate) || 0;
        const n = parseInt(tenure) || 0;
        setPreviewEmi(calculateEmi(p, r, n));
    }, [principal, interestRate, tenure]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const emiData = {
            name,
            principal: parseFloat(principal),
            interestRate: parseFloat(interestRate),
            tenureMonths: parseInt(tenure)
        };

        if (trackingMethod === 'date') {
            emiData.startDate = startDate;
        } else {
            emiData.explicitCompletedMonths = parseInt(completedMonths) || 0;
        }

        onAdd(emiData);

        // Reset form
        setName('');
        setPrincipal('');
        setInterestRate('');
        setTenure('');
        setStartDate('');
        setCompletedMonths('');
    };

    return (
        <Card className="bg-card/60 backdrop-blur border-white/5">
            <CardHeader>
                <CardTitle>Add New Tracker</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Loan Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Car Loan" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="principal">Principal (₹)</Label>
                            <Input id="principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} required min="1000" placeholder="500000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interestRate">Interest Rate (%)</Label>
                            <Input id="interestRate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} required step="0.1" min="1" placeholder="8.5" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tenure">Tenure (Months)</Label>
                        <Input id="tenure" type="number" value={tenure} onChange={e => setTenure(e.target.value)} required min="1" placeholder="60" />
                    </div>

                    <RadioGroup value={trackingMethod} onValueChange={setTrackingMethod} className="flex gap-6 mt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="date" id="r1" />
                            <Label htmlFor="r1" className="cursor-pointer">Track by Date</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="r2" />
                            <Label htmlFor="r2" className="cursor-pointer">Manual Progress</Label>
                        </div>
                    </RadioGroup>

                    {trackingMethod === 'date' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                    )}

                    {trackingMethod === 'manual' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label htmlFor="completedMonths">Completed Months</Label>
                            <Input id="completedMonths" type="number" value={completedMonths} onChange={e => setCompletedMonths(e.target.value)} required min="0" placeholder="e.g. 12" />
                        </div>
                    )}

                    <div className="bg-primary/5 rounded-lg p-5 border border-primary/10 mt-2">
                        <span className="text-sm font-medium tracking-wide text-primary/80 uppercase">Est. Monthly EMI</span>
                        <div className="text-3xl font-bold text-primary mt-1">
                            {formatCurrency(previewEmi)} <span className="text-base font-medium opacity-60">/ mo</span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-md h-11 shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? 'Adding...' : 'Add EMI Tracker'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
export default AddEmiForm;
