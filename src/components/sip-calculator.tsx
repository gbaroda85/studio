"use client";

import { useState, useEffect } from "react";
import { TrendingUp, PieChart, Coins, RefreshCcw, Landmark, Info, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { name: "India", currency: "INR", locale: "en-IN" },
  { name: "USA", currency: "USD", locale: "en-US" },
  { name: "UK", currency: "GBP", locale: "en-GB" },
  { name: "Europe", currency: "EUR", locale: "de-DE" },
  { name: "UAE", currency: "AED", locale: "ar-AE" },
  { name: "Canada", currency: "CAD", locale: "en-CA" },
  { name: "Australia", currency: "AUD", locale: "en-AU" },
  { name: "New Zealand", currency: "NZD", locale: "en-NZ" },
  { name: "Saudi Arabia", currency: "SAR", locale: "ar-SA" },
  { name: "Kuwait", currency: "KWD", locale: "ar-KW" },
  { name: "Qatar", currency: "QAR", locale: "ar-QA" },
  { name: "Oman", currency: "OMR", locale: "ar-OM" },
  { name: "Bahrain", currency: "BHD", locale: "ar-BH" },
  { name: "Singapore", currency: "SGD", locale: "en-SG" },
  { name: "Malaysia", currency: "MYR", locale: "en-MY" },
  { name: "Thailand", currency: "THB", locale: "th-TH" },
];

export default function SipCalculator() {
  const [countryIndex, setCountryIndex] = useState(0);
  const [monthlyInvest, setMonthlyInvest] = useState(5000);
  const [expectedRate, setExpectedRate] = useState(12);
  const [tenure, setTenure] = useState(10);
  const [result, setResult] = useState<{
    invested: number;
    returns: number;
    total: number;
  } | null>(null);

  const currentCountry = COUNTRIES[countryIndex];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(currentCountry.locale, { 
      style: 'currency', 
      currency: currentCountry.currency, 
      maximumFractionDigits: 0 
    }).format(val);

  const calculateSip = () => {
    const P = monthlyInvest;
    const i = expectedRate / 100 / 12;
    const n = tenure * 12;

    // Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvested = P * n;
    const estimatedReturns = totalValue - totalInvested;

    setResult({
      invested: Math.round(totalInvested),
      returns: Math.round(estimatedReturns),
      total: Math.round(totalValue),
    });
  };

  useEffect(() => {
    calculateSip();
  }, [monthlyInvest, expectedRate, tenure]);

  const handleReset = () => {
    setMonthlyInvest(5000);
    setExpectedRate(12);
    setTenure(10);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700">
      
      {/* Left: Inputs */}
      <Card className="lg:col-span-5 border-2 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 h-fit">
        <CardHeader className="bg-primary/5 border-b p-6">
          <CardTitle className="flex items-center gap-3 font-black uppercase tracking-tighter">
            <Coins className="text-primary size-6" /> Investment Config
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase opacity-60">Set your SIP parameters</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <div className="space-y-6">
            {/* Country Selector */}
            <div className="space-y-3 pb-4 border-b border-dashed">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Globe className="size-3" /> Select Country
                </Label>
                <Select value={String(countryIndex)} onValueChange={(v) => setCountryIndex(Number(v))}>
                    <SelectTrigger className="h-10 border-2 font-bold rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                        {COUNTRIES.map((c, i) => (
                            <SelectItem key={i} value={String(i)} className="font-bold py-2">{c.name} ({c.currency})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase opacity-60">Monthly Investment</Label>
                <Badge variant="secondary" className="font-black text-xs px-3">{formatCurrency(monthlyInvest)}</Badge>
              </div>
              <Slider min={500} max={100000} step={500} value={[monthlyInvest]} onValueChange={(v) => setMonthlyInvest(v[0])} />
              <Input type="number" value={monthlyInvest} onChange={(e) => setMonthlyInvest(Number(e.target.value))} className="h-10 border-2 font-bold rounded-lg text-center" />
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase opacity-60">Expected Return Rate (% p.a.)</Label>
                <Badge variant="secondary" className="font-black text-xs px-3">{expectedRate}%</Badge>
              </div>
              <Slider min={1} max={30} step={0.5} value={[expectedRate]} onValueChange={(v) => setExpectedRate(v[0])} />
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase opacity-60">Time Period (Years)</Label>
                <Badge variant="secondary" className="font-black text-xs px-3">{tenure} Years</Badge>
              </div>
              <Slider min={1} max={40} step={1} value={[tenure]} onValueChange={(v) => setTenure(v[0])} />
            </div>
          </div>

          <div className="p-5 bg-blue-500/5 rounded-2xl border-2 border-blue-500/10 flex gap-4">
             <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
                Note: Mutual Fund investments are subject to market risks. Past performance is not an indicator of future returns.
             </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/5 p-6 border-t">
          <Button variant="ghost" onClick={handleReset} className="w-full font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
            <RefreshCcw className="mr-2 size-3" /> Reset Values
          </Button>
        </CardFooter>
      </Card>

      {/* Right: Results Dashboard */}
      <div className="lg:col-span-7 space-y-6">
        {result && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
             <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-primary/20">
                <CardHeader className="bg-primary/5 p-4 border-b text-center">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                      <TrendingUp className="size-3" /> WEALTH ESTIMATE PROFILE
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-12 space-y-10">
                   <div className="text-center space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Estimated Value</p>
                      <p className="text-5xl md:text-7xl font-black text-primary tracking-tighter">{formatCurrency(result.total)}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-muted/20 rounded-[2rem] border text-center space-y-1.5 shadow-inner">
                         <p className="text-[10px] font-black text-muted-foreground uppercase">Total Invested</p>
                         <p className="text-xl font-black">{formatCurrency(result.invested)}</p>
                      </div>
                      <div className="p-6 bg-green-500/5 rounded-[2rem] border-2 border-green-500/20 text-center space-y-1.5 shadow-lg">
                         <p className="text-[10px] font-black text-green-700 uppercase">Estimated Returns</p>
                         <p className="text-xl font-black text-green-600">+{formatCurrency(result.returns)}</p>
                      </div>
                   </div>

                   <div className="p-6 bg-primary/5 rounded-[2.5rem] flex flex-col items-center gap-4 border border-dashed border-primary/20">
                      <div className="flex items-center gap-3">
                         <Zap className="size-5 text-yellow-500 animate-pulse" />
                         <p className="text-sm font-black uppercase tracking-tight">Compound Interest Power</p>
                      </div>
                      <p className="text-center text-[10px] font-bold text-muted-foreground uppercase max-w-md leading-relaxed">
                        In {tenure} years, your money could grow by <span className="text-primary font-black text-xs">{( (result.returns/result.invested) * 100).toFixed(0)}%</span> due to the power of compounding.
                      </p>
                   </div>
                </CardContent>
             </Card>

             <div className="grid grid-cols-3 gap-4">
                {[5, 10, 15].map(years => (
                   <Card key={years} className="border bg-card/50 p-4 text-center rounded-2xl hover:border-primary/40 transition-all">
                      <p className="text-[8px] font-black uppercase text-muted-foreground">Value in {tenure + years}y</p>
                      <p className="text-xs font-black mt-1 text-primary">
                        {formatCurrency(monthlyInvest * ((Math.pow(1 + (expectedRate/100/12), (tenure+years)*12) - 1) / (expectedRate/100/12)) * (1 + (expectedRate/100/12)))}
                      </p>
                   </Card>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
