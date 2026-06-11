"use client"

import { useState } from "react"
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
];

export default function FuelCostCalculator() {
  const { toast } = useToast()
  const [countryIndex, setCountryIndex] = useState(0)
  const [distance, setDistance] = useState("")
  const [efficiency, setEfficiency] = useState("")
  const [price, setPrice] = useState("")
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
  
  const handleReset = () => {
      setDistance("");
      setEfficiency("");
      setPrice("");
      setResult(null);
  }

  return (
    <Card className="w-full max-w-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Route className="text-primary"/> Fuel Cost Calculator</CardTitle>
        <CardDescription>Estimate the fuel cost for your trip.</CardDescription>
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
          <Label htmlFor="distance">Trip Distance (km)</Label>
          <Input id="distance" type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g., 500" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="efficiency">Vehicle's Fuel Efficiency (km/L)</Label>
          <Input id="efficiency" type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} placeholder="e.g., 18" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="price">Fuel Price (per liter)</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 105" />
        </div>

        {result && (
            <div className="pt-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg border-2">
                         <p className="text-[10px] font-black uppercase opacity-60">Total Fuel Needed</p>
                         <p className="text-lg font-black">{result.totalFuel.toFixed(2)} Liters</p>
                    </div>
                     <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                         <p className="text-[10px] font-black text-primary uppercase">Total Trip Cost</p>
                         <p className="text-lg font-black text-primary">{formatCurrency(result.totalCost)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         <Button onClick={handleCalculate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-xl shadow-lg">
            Calculate Trip Cost
        </Button>
        {result && <Button variant="ghost" onClick={handleReset} className="w-full text-[10px] font-black uppercase"><RefreshCcw className="mr-2 size-3"/> Reset</Button>}
      </CardFooter>
    </Card>
  )
}
