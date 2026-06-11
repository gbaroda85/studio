"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    IndianRupee, 
    Landmark, 
    Calculator, 
    RefreshCcw, 
    Info, 
    CheckCircle2, 
    ShieldCheck, 
    Briefcase, 
    Home, 
    TrendingUp, 
    Zap,
    ArrowRight,
    PieChart,
    Wallet,
    SearchCode,
    Printer,
    Download,
    Plus,
    Minus,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Target,
    Trophy,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    ReceiptText,
    Percent,
    Building2,
    Stethoscope,
    PiggyBank,
    ListFilter,
    LayoutGrid,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Professional Indian Income Tax Calculator (FY 2025-26)
 * Features side-by-side regime comparison, deep deductions, and visual analytics.
 */

// --- TYPES ---
interface TaxSlab {
    range: string;
    rate: number;
    amount: number;
}

interface RegimeResult {
    grossTotal: number;
    totalDeductions: number;
    taxableIncome: number;
    totalTax: number;
    cess: number;
    finalTax: number;
    effectiveRate: number;
    takeHome: number;
    slabs: TaxSlab[];
}

const COUNTRIES = [
  { name: "India", currency: "INR", locale: "en-IN" },
  { name: "USA", currency: "USD", locale: "en-US" },
  { name: "UK", currency: "GBP", locale: "en-GB" },
  { name: "Europe", currency: "EUR", locale: "de-DE" },
  { name: "UAE", currency: "AED", locale: "ar-AE" },
  { name: "Canada", currency: "CAD", locale: "en-CA" },
  { name: "Australia", currency: "AUD", locale: "en-AU" },
];

export default function IncomeTaxCalculator() {
  const { toast } = useToast();
  const [countryIndex, setCountryIndex] = useState(0);

  // 1. INPUT STATES
  const [salary, setSalary] = useState("1200000");
  const [rentalIncome, setRentalIncome] = useState("0");
  const [otherIncome, setOtherIncome] = useState("0");
  const [capitalGains, setCapitalGains] = useState("0");

  // 2. DEDUCTION STATES (Old Regime Focus)
  const [sec80C, setSec80C] = useState("150000");
  const [sec80D, setSec80D] = useState("25000");
  const [hraExemption, setHraExemption] = useState("0");
  const [homeLoanInt, setHomeLoanInt] = useState("0");

  // 3. CALCULATION TRIGGER
  const [isCalculated, setIsCalculated] = useState(false);

  const currentCountry = COUNTRIES[countryIndex];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(currentCountry.locale, { 
      style: 'currency', 
      currency: currentCountry.currency, 
      maximumFractionDigits: 0 
    }).format(val);

  // --- CORE CALCULATION LOGIC ---
  const results = useMemo(() => {
    const grossSalary = parseFloat(salary) || 0;
    const rent = parseFloat(rentalIncome) || 0;
    const others = parseFloat(otherIncome) || 0;
    const gains = parseFloat(capitalGains) || 0;
    const grossTotal = grossSalary + rent + others + gains;

    if (grossTotal === 0) return null;

    // --- NEW REGIME (FY 2025-26 / 2026-27 Slabs) ---
    // Std Deduction: 75k
    // 0-3L: 0 | 3-7L: 5% | 7-10L: 10% | 10-12L: 15% | 12-15L: 20% | >15L: 30%
    const newStdDeduction = 75000;
    const newTaxable = Math.max(0, grossTotal - newStdDeduction);
    let newTax = 0;
    const newSlabs: TaxSlab[] = [];

    const nSlabs = [
        { limit: 300000, rate: 0 },
        { limit: 700000, rate: 5 },
        { limit: 1000000, rate: 10 },
        { limit: 1200000, rate: 15 },
        { limit: 1500000, rate: 20 },
        { limit: Infinity, rate: 30 }
    ];

    let nPrev = 0;
    nSlabs.forEach((s, idx) => {
        const text = idx === 0 ? "0 - 3L" : idx === 5 ? "Above 15L" : `${nPrev/100000}L - ${s.limit/100000}L`;
        let slabAmount = 0;
        if (newTaxable > nPrev) {
            const rangeAmount = Math.min(newTaxable - nPrev, s.limit - nPrev);
            slabAmount = (rangeAmount * s.rate) / 100;
            newTax += slabAmount;
        }
        newSlabs.push({ range: text, rate: s.rate, amount: slabAmount });
        nPrev = s.limit;
    });

    // Rebate 87A for New Regime: If Taxable Income <= 7,00,000, Tax = 0
    if (newTaxable <= 700000) newTax = 0;

    const newResult: RegimeResult = {
        grossTotal,
        totalDeductions: newStdDeduction,
        taxableIncome: newTaxable,
        totalTax: newTax,
        cess: newTax * 0.04,
        finalTax: newTax + (newTax * 0.04),
        effectiveRate: grossTotal > 0 ? ((newTax + (newTax * 0.04)) / grossTotal) * 100 : 0,
        takeHome: grossTotal - (newTax + (newTax * 0.04)),
        slabs: newSlabs
    };

    // --- OLD REGIME ---
    // Std Deduction: 50k
    // 0-2.5L: 0 | 2.5-5L: 5% | 5-10L: 20% | >10L: 30%
    const oldStdDeduction = 50000;
    const oldOtherDeductions = Math.min(150000, parseFloat(sec80C) || 0) + 
                                Math.min(100000, parseFloat(sec80D) || 0) + 
                                (parseFloat(hraExemption) || 0) + 
                                Math.min(200000, parseFloat(homeLoanInt) || 0);
    
    const oldTotalDed = oldStdDeduction + oldOtherDeductions;
    const oldTaxable = Math.max(0, grossTotal - oldTotalDed);
    let oldTax = 0;
    const oldSlabs: TaxSlab[] = [];

    const oSlabs = [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 5 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 }
    ];

    let oPrev = 0;
    oSlabs.forEach((s, idx) => {
        const text = idx === 0 ? "0 - 2.5L" : idx === 3 ? "Above 10L" : `${oPrev/100000}L - ${s.limit/100000}L`;
        let slabAmount = 0;
        if (oldTaxable > oPrev) {
            const rangeAmount = Math.min(oldTaxable - oPrev, s.limit - oPrev);
            slabAmount = (rangeAmount * s.rate) / 100;
            oldTax += slabAmount;
        }
        oldSlabs.push({ range: text, rate: s.rate, amount: slabAmount });
        oPrev = s.limit;
    });

    // Rebate 87A for Old Regime: If Taxable Income <= 5,00,000, Tax = 0
    if (oldTaxable <= 500000) oldTax = 0;

    const oldResult: RegimeResult = {
        grossTotal,
        totalDeductions: oldTotalDed,
        taxableIncome: oldTaxable,
        totalTax: oldTax,
        cess: oldTax * 0.04,
        finalTax: oldTax + (oldTax * 0.04),
        effectiveRate: grossTotal > 0 ? ((oldTax + (oldTax * 0.04)) / grossTotal) * 100 : 0,
        takeHome: grossTotal - (oldTax + (oldTax * 0.04)),
        slabs: oldSlabs
    };

    return { new: newResult, old: oldResult };
  }, [salary, rentalIncome, otherIncome, capitalGains, sec80C, sec80D, hraExemption, homeLoanInt]);

  const handleCalculate = () => {
      setIsCalculated(true);
      toast({ title: "Profile Analysis Ready", description: "Tax comparison generated side-by-side." });
  };

  const handleReset = () => {
    setSalary(""); setRentalIncome("0"); setOtherIncome("0"); setCapitalGains("0");
    setSec80C("150000"); setSec80D("25000"); setHraExemption("0"); setHomeLoanInt("0");
    setIsCalculated(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-4 md:px-8 pb-32 animate-in fade-in duration-700">
      
      {/* LEFT: DEEP INPUTS */}
      <div className="lg:col-span-5 space-y-6 no-print">
        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
          <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Landmark className="size-7" />
                    </div>
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Tax Studio Pro</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">FY 2025-26 Comparison</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-[9px] font-black uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1.5" /> Reset</Button>
             </div>
          </CardHeader>
          
          <CardContent className="p-0">
             <div className="p-6 md:p-8 space-y-4 border-b border-dashed">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Globe className="size-3" /> Currency Selector
                </Label>
                <Select value={String(countryIndex)} onValueChange={(v) => setCountryIndex(Number(v))}>
                    <SelectTrigger className="h-10 border-2 font-bold rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                        {COUNTRIES.map((c, i) => (
                            <SelectItem key={i} value={String(i)} className="font-bold py-2">{c.name} ({c.currency})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-[8px] text-muted-foreground font-black uppercase opacity-40">Note: Tax laws and slabs are calculated based on Indian Union Budget 2025.</p>
             </div>

             <Accordion type="multiple" defaultValue={['income']} className="w-full">
                {/* Section 1: Income Sources */}
                <AccordionItem value="income" className="border-none">
                    <AccordionTrigger className="px-8 py-6 hover:bg-muted/30 hover:no-underline border-b group">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="size-5 text-primary group-data-[state=open]:animate-pulse" />
                            <span className="font-black uppercase tracking-widest text-xs">Annual Income Sources</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-8 space-y-6 bg-muted/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Gross Salary</Label>
                                <div className="relative"><Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">House Property Income</Label>
                                <div className="relative"><Input type="number" value={rentalIncome} onChange={(e) => setRentalIncome(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Capital Gains</Label>
                                <div className="relative"><Input type="number" value={capitalGains} onChange={(e) => setCapitalGains(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Other / Interest Income</Label>
                                <div className="relative"><Input type="number" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section 2: Deductions (For Old Regime) */}
                <AccordionItem value="deductions" className="border-none">
                    <AccordionTrigger className="px-8 py-6 hover:bg-muted/30 hover:no-underline border-b group">
                        <div className="flex items-center gap-3">
                            <ListFilter className="size-5 text-emerald-500" />
                            <span className="font-black uppercase tracking-widest text-xs">Old Regime Deductions</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-8 space-y-6 bg-emerald-500/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Section 80C (PPF, ELSS, Insurance)</Label>
                                <div className="relative"><Input type="number" value={sec80C} onChange={(e) => setSec80C(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                                <p className="text-[8px] opacity-40 font-bold">MAX LIMIT: ₹ 1.5 LAKH</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Section 80D (Mediclaim)</Label>
                                <div className="relative"><Input type="number" value={sec80D} onChange={(e) => setSec80D(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">Section 24 (Home Loan Int.)</Label>
                                <div className="relative"><Input type="number" value={homeLoanInt} onChange={(e) => setHomeLoanInt(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase opacity-60">HRA Exemption</Label>
                                <div className="relative"><Input type="number" value={hraExemption} onChange={(e) => setHraExemption(e.target.value)} className="h-10 pl-9 font-bold border-2 rounded-xl" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span></div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
             </Accordion>

             <div className="p-8 bg-blue-500/5 rounded-b-[2.5rem] border-t-2 border-dashed border-primary/10">
                <div className="flex gap-4">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0"><Info className="size-5 text-blue-600" /></div>
                    <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
                        New Regime update: Standard deduction increased to ₹ 75,000 for FY 2025-26. 
                        Rebate u/s 87A makes income up to ₹ 7.75L tax-free (incl. SD).
                    </p>
                </div>
             </div>
          </CardContent>

          <CardFooter className="p-8 bg-muted/10 border-t flex flex-col gap-4">
             <Button 
                onClick={handleCalculate} 
                className="w-full h-16 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all group"
             >
                <Calculator className="mr-3 size-7 group-hover:rotate-12 transition-transform" /> 
                ANALYZE TAX PROFILE
             </Button>
          </CardFooter>
        </Card>
      </div>

      {/* RIGHT: COMPARISON & ANALYTICS */}
      <div className="lg:col-span-7 space-y-6 min-h-[800px]">
        {!isCalculated || !results ? (
            <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-30 rounded-[3rem] bg-muted/10 min-h-[600px]">
                <div className="relative mb-6">
                    <Landmark className="size-24 text-primary opacity-20" />
                    <SearchCode className="absolute inset-0 m-auto size-12 text-primary animate-pulse" />
                </div>
                <p className="text-2xl font-black uppercase tracking-widest">Awaiting Inputs</p>
                <p className="text-xs font-bold uppercase opacity-60 mt-2">Fill your income details and click analyze to unlock comparison</p>
            </Card>
        ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
                
                {/* 1. Comparison Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RegimeCard 
                        title="NEW REGIME" 
                        result={results.new} 
                        isWinner={results.new.finalTax <= results.old.finalTax} 
                        theme="primary"
                        formatCurrency={formatCurrency}
                    />
                    <RegimeCard 
                        title="OLD REGIME" 
                        result={results.old} 
                        isWinner={results.old.finalTax < results.new.finalTax} 
                        theme="rose"
                        formatCurrency={formatCurrency}
                    />
                </div>

                {/* 2. Winner Badge & Saving Info */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-r from-emerald-500 to-teal-600 text-white overflow-hidden group">
                    <div className="absolute top-0 right-0 size-40 bg-white/10 blur-3xl rounded-full" />
                    <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="size-20 rounded-3xl bg-white/20 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                <Trophy className="size-10 text-white drop-shadow-lg" />
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-lg font-black uppercase tracking-[0.2em] opacity-80">PRO TAX RECOMMENDATION</h4>
                                <p className="text-3xl md:text-4xl font-black tracking-tighter">
                                    {results.new.finalTax <= results.old.finalTax ? 'Switch to New Regime' : 'Stay with Old Regime'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl px-10 py-5 rounded-[2rem] border-2 border-white/20 text-center shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">ANNUAL SAVINGS</p>
                            <p className="text-4xl font-black tracking-tighter mt-1">
                                {formatCurrency(Math.abs(results.new.finalTax - results.old.finalTax))}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Detailed Slab Breakdown Table */}
                <Card className="border-2 shadow-xl rounded-[3rem] overflow-hidden bg-card">
                    <CardHeader className="bg-muted/30 border-b p-8">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <LayoutGrid className="size-5 text-primary" /> Visual Slab Mapping (New Regime)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                         <div className="space-y-4">
                            {results.new.slabs.map((s, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{s.rate}%</span>
                                            <span className="text-xs font-bold text-muted-foreground">{s.range}</span>
                                        </div>
                                        <span className="text-xs font-black">{formatCurrency(s.amount)}</span>
                                    </div>
                                    <Progress value={results.new.taxableIncome > 0 && results.new.finalTax > 0 ? (s.amount / results.new.finalTax) * 100 : 0} className="h-1.5" />
                                </div>
                            ))}
                         </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-6 text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE LOCAL RAM</div>
                            <div className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-blue-500" /> FY 2025-26 COMPLIANT</div>
                        </div>
                        <Button variant="outline" className="h-12 border-2 rounded-xl font-black text-[10px] uppercase px-6 hover:bg-slate-900 hover:text-white transition-all shadow-sm no-print" onClick={handlePrint}>
                            <Printer className="size-4 mr-2" /> Print Summary
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function RegimeCard({ title, result, isWinner, theme, formatCurrency }: { title: string, result: RegimeResult, isWinner: boolean, theme: 'primary' | 'rose', formatCurrency: (v: number) => string }) {
    const isPrimary = theme === 'primary';
    return (
        <Card className={cn(
            "border-2 shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-500 relative",
            isWinner ? (isPrimary ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-rose-500 bg-rose-500/5 ring-4 ring-rose-500/10") : "bg-card opacity-80"
        )}>
            {isWinner && (
                <div className={cn(
                    "absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full text-white text-[9px] font-black uppercase shadow-lg animate-in zoom-in-95",
                    isPrimary ? "bg-primary" : "bg-rose-500"
                )}>
                    <CheckCircle2 className="size-3" /> BEST OPTION
                </div>
            )}
            <CardHeader className="bg-muted/30 border-b p-6">
                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">{title}</CardTitle>
                <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Estimated Tax Payable</p>
                    <p className={cn("text-3xl font-black tracking-tighter", isPrimary ? "text-primary" : "text-rose-600")}>{formatCurrency(result.finalTax)}</p>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <StatItem label="Taxable" value={formatCurrency(result.taxableIncome)} />
                    <StatItem label="Deductions" value={formatCurrency(result.totalDeductions)} />
                    <StatItem label="Cess (4%)" value={formatCurrency(result.cess)} />
                    <StatItem label="Eff. Rate" value={`${result.effectiveRate.toFixed(1)}%`} />
                </div>
                <div className={cn("p-4 rounded-2xl flex items-center justify-between border shadow-inner", isPrimary ? "bg-primary/10 border-primary/20" : "bg-rose-500/10 border-rose-500/20")}>
                    <div>
                        <p className="text-[9px] font-black uppercase opacity-60">Est. Monthly Take-home</p>
                        <p className={cn("text-lg font-black", isPrimary ? "text-primary" : "text-rose-700")}>{formatCurrency(result.takeHome / 12)}</p>
                    </div>
                    <Wallet className={cn("size-6 opacity-20", isPrimary ? "text-primary" : "text-rose-700")} />
                </div>
            </CardContent>
        </Card>
    );
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase text-muted-foreground opacity-40">{label}</p>
            <p className="text-xs font-black tracking-tight">{value}</p>
        </div>
    );
}
