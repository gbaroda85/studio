
"use client"

import { useState } from "react"
import { Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SalesTaxCalculator() {
  const { toast } = useToast()
  const [initialPrice, setInitialPrice] = useState("")
  const [taxRate, setTaxRate] = useState("")
  const [result, setResult] = useState<{ taxAmount: number, totalPrice: number } | null>(null)

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
    <Card className="w-full max-w-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-indigo-500/80 hover:shadow-2xl hover:shadow-indigo-500/20 hover:ring-2 hover:ring-indigo-500/50 dark:hover:shadow-indigo-500/10">
      <CardHeader>
        <CardTitle>Sales Tax Calculator</CardTitle>
        <CardDescription>Quickly calculate tax and total price.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initial-price">Initial Price (₹)</Label>
          <Input id="initial-price" type="number" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} placeholder="e.g., 1000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Tax Rate (%)</Label>
          <Input id="tax-rate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="e.g., 18" />
        </div>

        {result && (
            <div className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Tax Amount</p>
                         <p className="text-lg font-semibold">{formatCurrency(result.taxAmount)}</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Total Price</p>
                         <p className="text-lg font-semibold">{formatCurrency(result.totalPrice)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         <Button onClick={handleCalculate} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            <Receipt className="mr-2"/>
            Calculate Tax
        </Button>
        {result && <Button variant="ghost" onClick={handleReset} className="w-full">Reset</Button>}
      </CardFooter>
    </Card>
  )
}
