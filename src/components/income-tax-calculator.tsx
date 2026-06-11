
"use client";

import { useState, useEffect } from "react";
import { IndianRupee, Landmark, Calculator, RefreshCcw, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function IncomeTaxCalculator() {
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("75000"); // Standard deduction FY 24-25
  const [result, setResult] = useState<{
    taxableIncome: number;
    totalTax: number;
    cess: number;
    finalTax: number;
    slabs: { range: string; rate: string; amount: number }[];
  } | null>(null);

  const calculateTax = () => {
    const gross = parseFloat(income);
    const ded = parseFloat(deductions);

    if (isNaN(gross) || gross <= 0) {
      setResult(null);
      return;
    }

    const taxable = Math.max(0, gross - ded);
    let tax = 0;
    const slabsResults = [];

    // New Regime Slab FY 2024-25 (India)
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
    if (taxable <= 700000) {
        tax = 0;
    }

    const cess = tax * 0.04;
    const finalTax = tax + cess;

    setResult({
      taxableIncome: taxable,
      totalTax: tax,
      cess: cess,
      finalTax: finalTax,
      slabs: slabsResults,
    });
  };

  useEffect(() => {
    calculateTax();
  }, [income, deductions]);

  const handleReset = () => {
    setIncome("");
    setDeductions("75000");
    setResult(null);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700 mx-auto">
      
      {/* Left Column: Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-2 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
          <CardHeader className="bg-primary/5 border-b p-6">
            <CardTitle className="flex items-center gap-3 font-black uppercase tracking-tighter">
              <Landmark className="text-primary size-6" /> Tax Estimator
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase opacity-60">Based on India New Regime FY 24-25</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label htmlFor="income" className="text-[10px] font-black uppercase opacity-60 tracking-widest">Gross Annual Income (₹)</Label>
              <div className="relative">
                <Input id="income" type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="h-14 text-2xl font-black pl-12 rounded-xl bg-muted/20 border-2" placeholder="e.g. 1500000" />
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-6" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <Label htmlFor="deductions" className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total Deductions (₹)</Label>
                 <Badge variant="outline" className="text-[8px] font-black uppercase">Standard: 75k</Badge>
              </div>
              <Input id="deductions" type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="h-12 font-bold border-2 rounded-xl" />
            </div>

            <div className="p-5 bg-amber-500/5 rounded-2xl border-2 border-amber-500/10 flex gap-4">
               <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase">
                  Important: This calculator provides an estimate. For official tax filing, please consult a professional CA or use the official Income Tax portal.
               </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5 p-6 border-t flex flex-col gap-4">
             <Button variant="ghost" onClick={handleReset} className="w-full font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
                <RefreshCcw className="mr-2 size-3" /> Reset Calculator
             </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column: Tax Breakdown */}
      <div className="lg:col-span-7 space-y-6">
        {!result ? (
            <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-30 rounded-[3rem] bg-muted/10 min-h-[400px]">
                <Calculator className="size-20 mb-4" />
                <p className="text-lg font-black uppercase tracking-widest">Waiting for Income Data</p>
            </Card>
        ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 neon-border">
                    <CardHeader className="bg-primary/5 p-6 border-b text-center">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Final Tax Liability</p>
                       <p className="text-5xl md:text-7xl font-black text-primary mt-2">{formatCurrency(result.finalTax)}</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/20 rounded-2xl border text-center">
                               <p className="text-[9px] font-black text-muted-foreground uppercase">Base Tax</p>
                               <p className="text-lg font-black">{formatCurrency(result.totalTax)}</p>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-2xl border text-center">
                               <p className="text-[9px] font-black text-muted-foreground uppercase">Cess (4%)</p>
                               <p className="text-lg font-black">{formatCurrency(result.cess)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest px-1">Slab-wise Breakdown</Label>
                           <div className="space-y-2">
                                {result.slabs.map((slab, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center font-black text-[9px] text-primary">{slab.rate}</div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slab.range}</span>
                                        </div>
                                        <span className={cn("text-xs font-black", slab.amount > 0 ? "text-rose-500" : "text-muted-foreground")}>{formatCurrency(slab.amount)}</span>
                                    </div>
                                ))}
                           </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-8 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest py-4">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-green-500" /> SECURE LOCAL RAM</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-blue-500" /> 2024-25 READY</div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
