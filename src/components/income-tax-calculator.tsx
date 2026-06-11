
"use client";

import { useState } from "react";
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
    SearchCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function IncomeTaxCalculator() {
  // Income States
  const [salary, setSalary] = useState("1200000");
  const [rent, setRental] = useState("0");
  const [others, setOthers] = useState("0");
  const [deductions, setDeductions] = useState("75000"); // Standard deduction FY 24-25
  
  const [isCalculated, setIsCalculated] = useState(false);
  const [result, setResult] = useState<{
    grossTotal: number;
    taxableIncome: number;
    totalTax: number;
    cess: number;
    finalTax: number;
    effectiveRate: number;
    takeHome: number;
    slabs: { range: string; rate: string; amount: number }[];
  } | null>(null);

  const calculateTax = () => {
    const grossSalary = parseFloat(salary) || 0;
    const grossRent = parseFloat(rent) || 0;
    const grossOthers = parseFloat(others) || 0;
    const ded = parseFloat(deductions) || 0;

    const grossTotal = grossSalary + grossRent + grossOthers;
    if (grossTotal <= 0) {
      setResult(null);
      setIsCalculated(false);
      return;
    }

    const taxable = Math.max(0, grossTotal - ded);
    let tax = 0;
    const slabsResults = [];

    // New Regime Slab FY 2024-25 (India - Post July Budget)
    // 0-3L: Nil
    // 3-7L: 5%
    // 7-10L: 10%
    // 10-12L: 15%
    // 12-15L: 20%
    // Above 15L: 30%

    const slabs = [
      { limit: 300000, rate: 0 },
      { limit: 700000, rate: 5 },
      { limit: 1000000, rate: 10 },
      { limit: 1200000, rate: 15 },
      { limit: 1500000, rate: 20 },
      { limit: Infinity, rate: 30 },
    ];

    let prevLimit = 0;
    for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        const rangeText = i === 0 ? "0 - 3L" : i === 5 ? "Above 15L" : `${prevLimit/100000}L - ${slab.limit/100000}L`;
        
        if (taxable > prevLimit) {
            const amountInSlab = Math.min(taxable - prevLimit, slab.limit - prevLimit);
            const slabTax = (amountInSlab * slab.rate) / 100;
            tax += slabTax;
            slabsResults.push({ range: rangeText, rate: `${slab.rate}%`, amount: slabTax });
        } else {
            slabsResults.push({ range: rangeText, rate: `${slab.rate}%`, amount: 0 });
        }
        prevLimit = slab.limit;
    }

    // Tax Rebate for Income up to 7L (u/s 87A)
    // In new regime, if taxable income is <= 7L, tax is zero
    if (taxable <= 700000) {
        tax = 0;
    }

    const cess = tax * 0.04;
    const finalTax = tax + cess;
    const effectiveRate = grossTotal > 0 ? (finalTax / grossTotal) * 100 : 0;
    const takeHome = grossTotal - finalTax;

    setResult({
      grossTotal,
      taxableIncome: taxable,
      totalTax: tax,
      cess: cess,
      finalTax: finalTax,
      effectiveRate,
      takeHome,
      slabs: slabsResults,
    });
    setIsCalculated(true);
  };

  const handleReset = () => {
    setSalary("");
    setRental("0");
    setOthers("0");
    setDeductions("75000");
    setResult(null);
    setIsCalculated(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700 mx-auto pb-20">
      
      {/* Left Column: Detailed Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-2 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
          <CardHeader className="bg-primary/5 border-b p-6">
            <CardTitle className="flex items-center gap-3 font-black uppercase tracking-tighter">
              <Landmark className="text-primary size-6" /> Tax Estimator Pro
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase opacity-60">India New Regime • FY 2024-25 (AY 2025-26)</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* Income Sources Group */}
            <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <TrendingUp className="size-3" /> Income Sources
                </Label>
                
                <div className="space-y-4 bg-muted/20 p-4 rounded-2xl border-2 border-dashed">
                    <div className="space-y-1.5">
                        <Label htmlFor="salary" className="text-[9px] font-black uppercase opacity-60">Annual Base Salary (₹)</Label>
                        <div className="relative">
                            <Input id="salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="h-10 font-bold pl-9 rounded-lg" placeholder="0" />
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="rent" className="text-[9px] font-black uppercase opacity-60">Rental Income / Property (₹)</Label>
                        <div className="relative">
                            <Input id="rent" type="number" value={rent} onChange={(e) => setRental(e.target.value)} className="h-10 font-bold pl-9 rounded-lg" placeholder="0" />
                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="others" className="text-[9px] font-black uppercase opacity-60">Interest / Other Income (₹)</Label>
                        <div className="relative">
                            <Input id="others" type="number" value={others} onChange={(e) => setOthers(e.target.value)} className="h-10 font-bold pl-9 rounded-lg" placeholder="0" />
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <Label htmlFor="deductions" className="text-[10px] font-black uppercase opacity-60 tracking-widest">Standard Deduction (₹)</Label>
                 <Badge className="bg-emerald-500 text-white text-[8px] font-black uppercase border-none">Update: 75K</Badge>
              </div>
              <Input id="deductions" type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="h-11 font-black border-2 rounded-xl bg-muted/20" />
            </div>

            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3">
               <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
               <p className="text-[9px] text-blue-700 font-bold leading-tight uppercase">
                  FY 24-25 (New Regime): Zero tax if total income is up to ₹7.75 Lakhs (inclusive of deduction).
               </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5 p-6 border-t flex flex-col gap-4">
             <Button 
                onClick={calculateTax} 
                className="w-full h-16 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all group"
             >
                <Calculator className="mr-2 size-6 group-hover:rotate-12 transition-transform" /> 
                CALCULATE TAX LIABILITY
             </Button>
             <Button variant="ghost" onClick={handleReset} className="w-full font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
                <RefreshCcw className="mr-2 size-3" /> Clear All Data
             </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column: Deep Breakdown */}
      <div className="lg:col-span-7 space-y-6">
        {!isCalculated || !result ? (
            <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-30 rounded-[3rem] bg-muted/10 min-h-[500px]">
                <div className="relative mb-6">
                    <Calculator className="size-24 text-primary opacity-20" />
                    <SearchCode className="absolute inset-0 m-auto size-10 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <p className="text-xl font-black uppercase tracking-widest">Input Income Details</p>
                    <p className="text-xs font-bold uppercase opacity-60">Click calculate to generate your FY 24-25 Tax Profile</p>
                </div>
            </Card>
        ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
                {/* PRIMARY TAX HEADER */}
                <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 neon-border">
                    <CardHeader className="bg-primary/5 p-6 border-b text-center">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Net Tax Payable</p>
                       <p className="text-5xl md:text-7xl font-black text-primary mt-2 tracking-tighter">{formatCurrency(result.finalTax)}</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted/20 rounded-2xl border text-center">
                               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Gross Total</p>
                               <p className="text-xs font-black">{formatCurrency(result.grossTotal)}</p>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-2xl border text-center">
                               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Taxable</p>
                               <p className="text-xs font-black">{formatCurrency(result.taxableIncome)}</p>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-2xl border text-center">
                               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Cess (4%)</p>
                               <p className="text-xs font-black">{formatCurrency(result.cess)}</p>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/20 text-center">
                               <p className="text-[8px] font-black text-primary uppercase mb-1">Effective %</p>
                               <p className="text-xs font-black text-primary">{result.effectiveRate.toFixed(2)}%</p>
                            </div>
                        </div>

                        {/* Slab Breakdown */}
                        <div className="space-y-4">
                           <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <PieChart className="size-3" /> Slab-wise Breakdown
                                </Label>
                                <Badge variant="outline" className="text-[8px] font-mono">NEW REGIME</Badge>
                           </div>
                           <div className="grid gap-2">
                                {result.slabs.map((slab, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-xl transition-all",
                                        slab.amount > 0 ? "border-primary/20 bg-primary/5" : "border-muted opacity-40"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-9 rounded-lg flex items-center justify-center font-black text-[10px]",
                                                slab.amount > 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                            )}>{slab.rate}</div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slab.range}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn("text-sm font-black", slab.amount > 0 ? "text-primary" : "text-muted-foreground")}>{formatCurrency(slab.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                           </div>
                        </div>

                        {/* Take-home Section */}
                        <div className="p-6 bg-emerald-500/5 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><Wallet className="size-6" /></div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Est. Take Home Income</p>
                                    <p className="text-2xl font-black text-emerald-800">{formatCurrency(result.takeHome)}</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-600 text-white font-black text-[9px] uppercase px-4 py-1.5 rounded-full">ANNUAL POST-TAX</Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-10 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] py-4">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE LOCAL RAM</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-blue-500" /> 2024-25 UPDATED</div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
