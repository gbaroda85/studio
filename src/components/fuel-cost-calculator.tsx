"use client"

import { useState, useEffect } from "react"
import { Fuel, Route, Globe, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function FuelCostCalculator() {
  const { toast } = useToast()
  const [countryIndex, setCountryIndex] = useState(0)
  const [distance, setDistance] = useState("500")
  const [efficiency, setEfficiency] = useState("18")
  const [price, setPrice] = useState("105")
  const [result, setResult] = useState<{ totalFuel: number, totalCost: number } | null>(null)

  const currentCountry = COUNTRIES[countryIndex];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currentCountry.locale, {
      style: 'currency',
      currency: currentCountry.currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  const handleCalculate = () => {
    const d = parseFloat(distance)
    const e = parseFloat(efficiency)
    const p = parseFloat(price)

    if (isNaN(d) || d <= 0 || isNaN(e) || e <= 0 || isNaN(p) || p <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid positive numbers for all fields.",
      })
      return
    }

    const totalFuel = d / e;
    const totalCost = totalFuel * p;

    setResult({ totalFuel, totalCost })
  }

  useEffect(() => {
      handleCalculate();
  }, [distance, efficiency, price, countryIndex]);
  
  const handleReset = () => {
      setDistance("500");
      setEfficiency("18");
      setPrice("105");
  }

  return (
    <Card className="w-full max-w-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-primary/5 border-b p-6">
        <CardTitle className="flex items-center gap-2"><Route className="text-primary"/> Fuel Cost Calculator</CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase opacity-60">Estimate the fuel cost for your trip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
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

        <div className="space-y-2">
          <Label htmlFor="distance" className="text-[10px] font-black uppercase opacity-60">Trip Distance (km)</Label>
          <Input id="distance" type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="h-12 border-2 font-bold rounded-xl" placeholder="e.g., 500" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="efficiency" className="text-[10px] font-black uppercase opacity-60">Vehicle's Fuel Efficiency (km/L)</Label>
          <Input id="efficiency" type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} className="h-12 border-2 font-bold rounded-xl" placeholder="e.g., 18" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="price" className="text-[10px] font-black uppercase opacity-60">Fuel Price (per liter)</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-12 border-2 font-bold rounded-xl" placeholder="e.g., 105" />
        </div>

        {result && (
            <div className="pt-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-5 bg-muted/30 rounded-2xl border">
                         <p className="text-[9px] font-black uppercase opacity-60">Fuel Needed</p>
                         <p className="text-xl font-black">{result.totalFuel.toFixed(2)} L</p>
                    </div>
                     <div className="p-5 bg-primary/10 rounded-2xl border-2 border-primary/20 shadow-inner">
                         <p className="text-[10px] font-black text-primary uppercase">Estimated Cost</p>
                         <p className="text-2xl font-black text-primary">{formatCurrency(result.totalCost)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-6 bg-muted/5 border-t">
        <Button variant="ghost" onClick={handleReset} className="w-full h-10 font-black uppercase text-[10px] opacity-40 hover:opacity-100"><RefreshCcw className="mr-2 size-3"/> Reset</Button>
      </CardFooter>
    </Card>
  )
}
