"use client";

import { useState, useEffect } from "react";
import { IndianRupee, Percent, Plus, Minus, RefreshCcw, Calculator, Trophy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const GST_SLABS = [5, 12, 18, 28];

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

export default function GstCalculator() {
  const [countryIndex, setCountryIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [result, setResult] = useState<{
    netAmount: number;
    gstAmount: number;
    totalAmount: number;
    cgst: number;
    sgst: number;
  } | null>(null);

  const currentCountry = COUNTRIES[countryIndex];

  const calculateGst = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(gstRate);

    if (isNaN(amt) || isNaN(rate)) {
      setResult(null);
      return;
    }

    let net, gst, total;

    if (mode === "add") {
      net = amt;
      gst = (amt * rate) / 100;
      total = amt + gst;
    } else {
      total = amt;
      net = (amt * 100) / (100 + rate);
      gst = total - net;
    }

    setResult({
      netAmount: net,
      gstAmount: gst,
      totalAmount: total,
      cgst: gst / 2,
      sgst: gst / 2,
    });
  };

  useEffect(() => {
    calculateGst();
  }, [amount, gstRate, mode]);

  const handleReset = () => {
    setAmount("");
    setGstRate("18");
    setMode("add");
    setResult(null);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(currentCountry.locale, { 
      style: 'currency', 
      currency: currentCountry.currency 
    }).format(val);

  return (
    <Card className="w-full max-w-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-primary/5 border-b p-6">
        <CardTitle className="flex items-center gap-3 font-black uppercase tracking-tighter">
          <IndianRupee className="text-primary size-6" /> GST Calculator
        </CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase opacity-60">Calculate GST Add or Remove instantly</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Country Selector */}
        <div className="space-y-2 pb-4 border-b border-dashed">
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
          <Label className="text-[10px] font-black uppercase opacity-60">Calculation Mode</Label>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)} className="flex gap-4">
            <div className={cn("flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer", mode === 'add' ? "border-primary bg-primary/5" : "border-muted")} onClick={() => setMode('add')}>
              <Plus className="size-4 text-primary" /> <span className="font-bold text-sm">Add GST</span>
            </div>
            <div className={cn("flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer", mode === 'remove' ? "border-primary bg-primary/5" : "border-muted")} onClick={() => setMode('remove')}>
              <Minus className="size-4 text-rose-500" /> <span className="font-bold text-sm">Remove GST</span>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label htmlFor="amount" className="text-[10px] font-black uppercase opacity-60">Input Amount</Label>
          <div className="relative">
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 text-2xl font-black pl-12 rounded-xl bg-muted/20 border-2" placeholder="0.00" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xl opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase opacity-60">Tax Slab (%)</Label>
          <div className="grid grid-cols-4 gap-2">
            {GST_SLABS.map(s => (
              <button key={s} onClick={() => setGstRate(String(s))} className={cn("h-10 rounded-lg border-2 font-black text-xs transition-all", gstRate === String(s) ? "bg-primary text-white border-primary shadow-lg" : "hover:bg-muted")}>
                {s}%
              </button>
            ))}
          </div>
          <Input type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="h-10 font-bold border-2 rounded-lg text-center" placeholder="Custom %" />
        </div>

        {result && (
          <div className="space-y-4 pt-4 animate-in zoom-in-95 duration-300">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl border text-center space-y-1">
                   <p className="text-[9px] font-black text-muted-foreground uppercase">Part Tax A ({(parseFloat(gstRate)/2)}%)</p>
                   <p className="text-sm font-black text-primary">{formatCurrency(result.cgst)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border text-center space-y-1">
                   <p className="text-[9px] font-black text-muted-foreground uppercase">Part Tax B ({(parseFloat(gstRate)/2)}%)</p>
                   <p className="text-sm font-black text-primary">{formatCurrency(result.sgst)}</p>
                </div>
             </div>
             <div className="p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20 text-center space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Bill Amount</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(result.totalAmount)}</p>
                <div className="h-px bg-primary/10 w-20 mx-auto my-2" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Net Amount: {formatCurrency(result.netAmount)}</p>
             </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/5 p-6 border-t flex justify-center">
         <Button variant="ghost" onClick={handleReset} className="font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive">
            <RefreshCcw className="mr-2 size-3" /> Reset Calculator
         </Button>
      </CardFooter>
    </Card>
  );
}
