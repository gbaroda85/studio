"use client"

import { useState, useMemo } from "react"
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
];

export default function LoanCalculator() {
  const { toast } = useToast()
  const [countryIndex, setCountryIndex] = useState(0)
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
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
  
  const handleReset = () => {
      setPrincipal("");
      setRate("");
      setTenure("");
      setResult(null);
  }

  return (
    <Card className="w-full max-w-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Loan & EMI Calculator</CardTitle>
        <CardDescription>Calculate your monthly loan payments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Country Selector */}
        <div className="space-y-2 pb-2 border-b border-dashed">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Globe className="size-3" /> Select Country
            </Label>
            <Select value={String(countryIndex)} onValueChange={(v) => setCountryIndex(Number(v))}>
                <SelectTrigger className="h-10 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                    {COUNTRIES.map((c, i) => (
                        <SelectItem key={i} value={String(i)} className="font-bold py-2">{c.name} ({c.currency})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal">Loan Amount</Label>
          <Input id="principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 100000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Annual Interest Rate (%)</Label>
          <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 7.5" />
        </div>
        <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
                <Label htmlFor="tenure">Loan Tenure</Label>
                <Input id="tenure" type="number" value={tenure} onChange={(e) => setValue(e.target.value)} placeholder="e.g., 20" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="tenure-unit">Unit</Label>
                <Select value={tenureUnit} onValueChange={(v) => setTenureUnit(v as "years" | "months")}>
                    <SelectTrigger id="tenure-unit"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {result && (
            <div className="pt-6 space-y-4">
                <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">Monthly EMI</p>
                    <p className="text-4xl font-bold text-primary">{formatCurrency(result.emi)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Total Interest</p>
                         <p className="text-lg font-semibold">{formatCurrency(result.totalInterest)}</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Total Payment</p>
                         <p className="text-lg font-semibold">{formatCurrency(result.totalPayment)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         <Button onClick={handleCalculate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl">
            <Landmark className="mr-2"/>
            Calculate EMI
        </Button>
        {result && <Button variant="ghost" onClick={handleReset} className="w-full">Reset</Button>}
      </CardFooter>
    </Card>
  )
}
