"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    Home, 
    CircleDollarSign, 
    Calendar, 
    TrendingUp, 
    RefreshCcw, 
    Info, 
    ShieldCheck, 
    ChevronDown, 
    ChevronUp, 
    Landmark,
    Settings2,
    PieChart as PieIcon,
    Wallet,
    Building2,
    ShieldAlert,
    Zap,
    Sparkles
} from "lucide-react";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#043873", "#4F9CF9", "#FF9F1C", "#2EC4B6"];

const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function MortgageCalculator() {
    // 1. STATE & INPUTS
    const [homePrice, setHomePrice] = useState(300000);
    const [downPaymentAmount, setDownPaymentAmount] = useState(60000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [loanTerm, setLoanTerm] = useState(30);
    const [interestRate, setInterestRate] = useState(6.5);
    
    // Advanced Section
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [propertyTax, setPropertyTax] = useState(3600); // per year
    const [homeInsurance, setHomeInsurance] = useState(1200); // per year
    const [hoaFees, setHoaFees] = useState(0); // per month

    // 2. LIVE CALCULATIONS
    const stats = useMemo(() => {
        const principal = homePrice - downPaymentAmount;
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
        let monthlyPI = 0;
        if (interestRate > 0) {
            monthlyPI = principal * (
                (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
            );
        } else {
            monthlyPI = principal / numberOfPayments;
        }

        const monthlyTax = propertyTax / 12;
        const monthlyInsurance = homeInsurance / 12;
        const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoaFees;
        
        const totalCost = (monthlyPI * numberOfPayments) + downPaymentAmount;
        const totalInterest = (monthlyPI * numberOfPayments) - principal;

        const chartData = [
            { name: 'P & I', value: Math.round(monthlyPI) },
            { name: 'Taxes', value: Math.round(monthlyTax) },
            { name: 'Insurance', value: Math.round(monthlyInsurance) },
            { name: 'HOA', value: Math.round(hoaFees) },
        ].filter(d => d.value > 0);

        return {
            principal,
            monthlyPI,
            totalMonthly,
            totalInterest,
            totalCost,
            chartData
        };
    }, [homePrice, downPaymentAmount, loanTerm, interestRate, propertyTax, homeInsurance, hoaFees]);

    // Down Payment Sync Logic
    const handleDownAmountChange = (val: number) => {
        setDownPaymentAmount(val);
        setDownPaymentPercent(Math.round((val / homePrice) * 100));
    };

    const handleDownPercentChange = (val: number) => {
        setDownPaymentPercent(val);
        setDownPaymentAmount(Math.round((val / 100) * homePrice));
    };

    const handleHomePriceChange = (val: number) => {
        setHomePrice(val);
        setDownPaymentAmount(Math.round((downPaymentPercent / 100) * val));
    };

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700">
            
            {/* LEFT COLUMN: INPUTS */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Home className="size-7" />
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Mortgage Studio</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Real-time Loan Estimator</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-10">
                        {/* Home Price */}
                        <div className="space-y-5">
                            <div className="flex justify-between items-center px-1">
                                <Label className="text-[10px] font-black uppercase opacity-60">Home Price</Label>
                                <Badge variant="secondary" className="font-black text-sm px-4 py-1 rounded-lg shadow-sm">{formatCurrency(homePrice)}</Badge>
                            </div>
                            <Slider min={50000} max={2000000} step={5000} value={[homePrice]} onValueChange={(v) => handleHomePriceChange(v[0])} />
                            <div className="relative group">
                                <Input type="number" value={homePrice} onChange={(e) => handleHomePriceChange(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-lg pl-10" />
                                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Down Payment Section */}
                        <div className="space-y-6 pt-4 border-t border-dashed">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Down Payment</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black uppercase opacity-40">Amount ($)</p>
                                    <Input type="number" value={downPaymentAmount} onChange={(e) => handleDownAmountChange(Number(e.target.value))} className="h-10 border-2 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black uppercase opacity-40">Percent (%)</p>
                                    <Input type="number" value={downPaymentPercent} onChange={(e) => handleDownPercentChange(Number(e.target.value))} className="h-10 border-2 font-bold" />
                                </div>
                            </div>
                            <Slider min={0} max={99} step={1} value={[downPaymentPercent]} onValueChange={(v) => handleDownPercentChange(v[0])} />
                        </div>

                        {/* Loan Term & Interest */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Loan Term (Years)</Label>
                                <Select value={String(loanTerm)} onValueChange={(v) => setLoanTerm(Number(v))}>
                                    <SelectTrigger className="h-12 border-2 font-black rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        {[10, 15, 20, 30].map(y => (
                                            <SelectItem key={y} value={String(y)} className="font-bold py-3 uppercase text-[10px]">{y} Years Fixed</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Interest Rate (%)</Label>
                                <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="h-12 border-2 font-black text-lg text-center" />
                            </div>
                        </div>

                        {/* Advanced Toggle */}
                        <div className="space-y-6 pt-4 border-t border-dashed">
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/10">
                                <div className="flex items-center gap-3">
                                    <Settings2 className="size-5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Taxes, Insurance & HOA</span>
                                </div>
                                <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                            </div>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-6 pt-2"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase opacity-50">Property Tax (/yr)</Label>
                                                <Input type="number" value={propertyTax} onChange={(e) => setPropertyTax(Number(e.target.value))} className="h-10 border-2 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase opacity-50">Insurance (/yr)</Label>
                                                <Input type="number" value={homeInsurance} onChange={(e) => setHomeInsurance(Number(e.target.value))} className="h-10 border-2 font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase opacity-50">HOA Fees (/mo)</Label>
                                            <Input type="number" value={hoaFees} onChange={(e) => setHoaFees(Number(e.target.value))} className="h-10 border-2 font-bold" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted/10 p-6 border-t flex justify-center">
                        <div className="flex items-center gap-4 text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck className="size-3.5 text-green-500" /> Secure Local Math
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT COLUMN: RESULTS & CHART */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-primary/20 relative group">
                    <div className="absolute top-0 right-0 size-80 bg-primary/5 blur-3xl rounded-full" />
                    
                    <CardHeader className="bg-primary/5 p-4 border-b text-center shrink-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                            <TrendingUp className="size-3" /> MONTHLY PAYMENT PROFILE
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-8 md:p-12 space-y-10 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                            {/* Visual Breakdown */}
                            <div className="md:col-span-6 flex flex-col items-center">
                                <div className="size-64 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={5}
                                                dataKey="value"
                                                animationDuration={800}
                                            >
                                                {stats.chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Total Monthly</p>
                                        <p className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(stats.totalMonthly)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                    {stats.chartData.map((item, idx) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                                            <span className="text-[9px] font-black uppercase opacity-60">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deep Stats Breakdown */}
                            <div className="md:col-span-6 space-y-6">
                                <div className="p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20 text-center space-y-1 relative group overflow-hidden">
                                    <Sparkles className="absolute -top-1 -right-1 size-8 text-primary/10 group-hover:animate-pulse" />
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">P & I Monthly</p>
                                    <p className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(stats.monthlyPI)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <StatItem label="Loan Amount" value={formatCurrency(stats.principal)} icon={Landmark} />
                                    <StatItem label="Total Interest" value={formatCurrency(stats.totalInterest)} icon={Zap} color="text-yellow-500" />
                                    <StatItem label="Total Cost" value={formatCurrency(stats.totalCost)} icon={Wallet} color="text-emerald-500" />
                                    <StatItem label="Down Payment" value={formatCurrency(downPaymentAmount)} icon={CircleDollarSign} />
                                </div>
                            </div>
                        </div>

                        {/* Amortization Progress visualization */}
                        <div className="space-y-4 pt-10 border-t-2 border-dashed border-primary/10">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <PieIcon className="size-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Interest Ratio</span>
                                </div>
                                <Badge className="bg-primary text-white font-black text-[10px]">
                                    {((stats.totalInterest / stats.totalCost) * 100).toFixed(1)}% OVER LIFE
                                </Badge>
                            </div>
                            <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border shadow-inner">
                                <div 
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${(stats.principal / stats.totalCost) * 100}%` }} 
                                />
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40">
                                <span>Principal Repayment</span>
                                <span>Lifetime Interest</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                             <div className="size-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-primary/10">
                                <Building2 className="size-8 text-primary animate-pulse" />
                             </div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-[200px] leading-relaxed">
                                ESTIMATE BASED ON <span className="text-primary font-black">{loanTerm} YEARS</span> FIXED AT <span className="text-primary font-black">{interestRate}%</span>
                             </p>
                        </div>
                        <Button variant="outline" className="h-12 px-8 border-2 font-black text-[10px] uppercase rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" onClick={() => window.print()}>
                            <Printer className="mr-2 size-4" /> Print Repayment Report
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Hidden Print Layer */}
            <div className="hidden print:block bg-white text-black p-10 space-y-10">
                <h1 className="text-4xl font-black text-center border-b pb-4">MORTGAGE ANALYSIS - GR7 STUDIO</h1>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black">LOAN PARAMETERS</h3>
                        <p>Home Price: {formatCurrency(homePrice)}</p>
                        <p>Down Payment: {formatCurrency(downPaymentAmount)} ({downPaymentPercent}%)</p>
                        <p>Interest Rate: {interestRate}%</p>
                        <p>Loan Term: {loanTerm} Years</p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-black">MONTHLY SUMMARY</h3>
                        <p className="text-2xl font-black">Total Payment: {formatCurrency(stats.totalMonthly)}</p>
                        <p>Principal & Interest: {formatCurrency(stats.monthlyPI)}</p>
                        <p>Taxes & Insurance: {formatCurrency((propertyTax + homeInsurance) / 12)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, icon: Icon, color = "text-primary" }: { label: string, value: string, icon: any, color?: string }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border shadow-sm space-y-2 group hover:border-primary/30 transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
                <Icon className={cn("size-4 opacity-40 group-hover:opacity-100 transition-opacity", color)} />
                <Badge variant="outline" className="text-[8px] font-black border-none opacity-40 uppercase">Safe</Badge>
            </div>
            <div>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className={cn("text-sm font-black tracking-tight", color)}>{value}</p>
            </div>
        </div>
    );
}
