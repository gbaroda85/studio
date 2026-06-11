"use client"

import { useState, useMemo, useEffect } from "react"
import { Landmark, Globe, RefreshCcw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "./ui/separator"

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

export default function LoanCalculator() {
  const { toast } = useToast()
  const [countryIndex, setCountryIndex] = useState(0)
  const [principal, setPrincipal] = useState("500000")
  const [rate, setRate] = useState("8.5")
  const [tenure, setTenure] = useState("5")
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years")
  const [result, setResult] = useState<{ emi: number, totalInterest: number, totalPayment: number } | null>(null)

  const currentCountry = COUNTRIES[countryIndex];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currentCountry.locale, {
      style: 'currency',
      currency: currentCountry.currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const handleCalculate = () => {
    const p = parseFloat(principal)
    const r = parseFloat(rate)
    const t = parseInt(tenure, 10)

    if (isNaN(p) || p <= 0 || isNaN(r) || r < 0 || isNaN(t) || t <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid numbers for all fields.",
      })
      return
    }

    const monthlyRate = r / (12 * 100)
    const numberOfMonths = tenureUnit === 'years' ? t * 12 : t
    
    if (r === 0) { // Simple interest case if rate is 0
        const emi = p / numberOfMonths;
        setResult({
            emi: emi,
            totalInterest: 0,
            totalPayment: p
        });
        return;
    }

    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1)
    const totalPayment = emi * numberOfMonths
    const totalInterest = totalPayment - p

    setResult({ emi, totalInterest, totalPayment })
  }

  useEffect(() => {
      handleCalculate();
  }, [principal, rate, tenure, tenureUnit, countryIndex]);
  
  const handleReset = () => {
      setPrincipal("500000");
      setRate("8.5");
      setTenure("5");
      setTenureUnit("years");
  }

  return (
    <Card className="w-full max-w-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-primary/5 border-b p-6">
        <CardTitle className="flex items-center gap-3 font-black uppercase tracking-tighter">
            <Landmark className="text-primary size-6" /> EMI Calculator
        </CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase opacity-60">Calculate monthly loan payments instantly</CardDescription>
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
          <Label htmlFor="principal" className="text-[10px] font-black uppercase opacity-60">Loan Amount</Label>
          <div className="relative">
            <Input id="principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="h-12 pl-10 border-2 font-bold rounded-xl bg-muted/20" placeholder="e.g., 500000" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm opacity-40">{currentCountry.currency === 'INR' ? '₹' : currentCountry.currency}</span>
          </div>
        </div>
        <div className="space-y-4">
          <Label htmlFor="rate" className="text-[10px] font-black uppercase opacity-60">Annual Interest Rate (%)</Label>
          <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="h-12 border-2 font-bold rounded-xl text-center text-lg" placeholder="e.g., 8.5" />
        </div>
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
                <Label htmlFor="tenure" className="text-[10px] font-black uppercase opacity-60">Loan Tenure</Label>
                <Input id="tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} className="h-12 border-2 font-bold rounded-xl text-center text-lg" placeholder="e.g., 5" />
            </div>
            <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase opacity-60">Unit</Label>
                <Select value={tenureUnit} onValueChange={(v) => setTenureUnit(v as "years" | "months")}>
                    <SelectTrigger className="h-12 border-2 font-black rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-2xl">
                        <SelectItem value="years" className="font-bold uppercase text-[10px]">Years</SelectItem>
                        <SelectItem value="months" className="font-bold uppercase text-[10px]">Months</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {result && (
            <div className="pt-6 space-y-6 animate-in zoom-in-95 duration-300">
                <div className="text-center p-8 bg-primary/10 rounded-[2rem] border-2 border-primary/20 shadow-inner relative overflow-hidden group">
                    <Zap className="absolute -top-1 -right-1 size-8 text-primary/10 group-hover:animate-pulse" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Monthly EMI</p>
                    <p className="text-5xl font-black text-primary tracking-tighter mt-1">{formatCurrency(result.emi)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-5 bg-muted/30 rounded-2xl border shadow-sm">
                         <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Total Interest</p>
                         <p className="text-lg font-black">{formatCurrency(result.totalInterest)}</p>
                    </div>
                     <div className="p-5 bg-muted/30 rounded-2xl border shadow-sm">
                         <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Total Payment</p>
                         <p className="text-lg font-black">{formatCurrency(result.totalPayment)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-8 bg-muted/10 border-t">
        <Button variant="ghost" onClick={handleReset} className="w-full h-10 font-black uppercase text-[10px] opacity-40 hover:opacity-100 hover:text-destructive"><RefreshCcw className="mr-2 size-3"/> Reset Calculator</Button>
      </CardFooter>
    </Card>
  )
}
