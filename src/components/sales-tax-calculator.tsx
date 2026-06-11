"use client"

import { useState } from "react"
import { Receipt, Globe, RefreshCcw } from "lucide-react"

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

export default function SalesTaxCalculator() {
  const { toast } = useToast()
  const [countryIndex, setCountryIndex] = useState(0)
  const [initialPrice, setInitialPrice] = useState("")
  const [taxRate, setTaxRate] = useState("")
  const [result, setResult] = useState<{ taxAmount: number, totalPrice: number } | null>(null)

  const currentCountry = COUNTRIES[countryIndex];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currentCountry.locale, {
      style: 'currency',
      currency: currentCountry.currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  const handleCalculate = () => {
    const price = parseFloat(initialPrice)
    const rate = parseFloat(taxRate)

    if (isNaN(price) || price <= 0 || isNaN(rate) || rate < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid price and tax rate.",
      })
      return
    }

    const taxAmount = price * (rate / 100);
    const totalPrice = price + taxAmount;

    setResult({ taxAmount, totalPrice })
  }
  
  const handleReset = () => {
      setInitialPrice("");
      setTaxRate("");
      setResult(null);
  }

  return (
    <Card className="w-full max-w-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10 rounded-[2rem] overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Receipt className="text-primary" /> Sales Tax Calculator</CardTitle>
        <CardDescription>Quickly calculate tax and total price.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 md:p-8">
        {/* Country Selector */}
        <div className="space-y-2 pb-4 border-b border-dashed">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Globe className="size-3" /> Select Country
            </Label>
            <Select value={String(countryIndex)} onValueChange={(v) => setCountryIndex(Number(v))}>
                <SelectTrigger className="h-10 border-2 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-2xl">
                    {COUNTRIES.map((c, i) => (
                        <SelectItem key={i} value={String(i)} className="font-bold py-2">{c.name} ({c.currency})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial-price">Initial Price</Label>
          <Input id="initial-price" type="number" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} placeholder="e.g., 1000" className="h-12 border-2 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Tax Rate (%)</Label>
          <Input id="tax-rate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="e.g., 18" className="h-12 border-2 rounded-xl" />
        </div>

        {result && (
            <div className="pt-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg border-2">
                         <p className="text-[10px] font-black uppercase opacity-60">Tax Amount</p>
                         <p className="text-lg font-black">{formatCurrency(result.taxAmount)}</p>
                    </div>
                     <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20 shadow-inner">
                         <p className="text-[10px] font-black text-primary uppercase">Total Price</p>
                         <p className="text-lg font-black text-primary">{formatCurrency(result.totalPrice)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-6 md:p-8 bg-muted/10 border-t">
         <Button onClick={handleCalculate} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-lg transform active:scale-95 transition-all">
            <Receipt className="mr-2 size-5"/>
            CALCULATE TAX
        </Button>
        {result && <Button variant="ghost" onClick={handleReset} className="w-full h-10 font-black uppercase text-[10px] opacity-40"><RefreshCcw className="mr-2 size-3"/> Reset</Button>}
      </CardFooter>
    </Card>
  )
}
