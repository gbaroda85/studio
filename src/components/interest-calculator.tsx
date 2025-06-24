
"use client"

import { useState } from "react"
import { Coins } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function InterestCalculator() {
  const { toast } = useToast()
  const [interestType, setInterestType] = useState<"simple" | "compound">("simple")
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years")
  
  const [result, setResult] = useState<{ totalInterest: number, totalAmount: number } | null>(null)

  const handleCalculate = () => {
    const p = parseFloat(principal)
    const r = parseFloat(rate)
    const t = parseInt(tenure, 10)

    if (isNaN(p) || p <= 0 || isNaN(r) || r < 0 || isNaN(t) || t <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid positive numbers for all fields.",
      })
      return
    }

    const annualRate = r / 100
    const timeInYears = tenureUnit === 'months' ? t / 12 : t
    
    let totalInterest = 0;
    let totalAmount = 0;

    if (interestType === 'simple') {
        totalInterest = p * annualRate * timeInYears;
        totalAmount = p + totalInterest;
    } else { // Compound interest
        totalAmount = p * Math.pow(1 + annualRate, timeInYears);
        totalInterest = totalAmount - p;
    }

    setResult({ totalInterest, totalAmount });
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
        <CardTitle>Interest Calculator</CardTitle>
        <CardDescription>Calculate simple or compound interest.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={interestType} onValueChange={(v) => { setInterestType(v as "simple" | "compound"); setResult(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Simple Interest</TabsTrigger>
              <TabsTrigger value="compound">Compound Interest</TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="principal">Principal Amount (₹)</Label>
          <Input id="principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 50000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Annual Interest Rate (%)</Label>
          <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 8" />
        </div>
        <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
                <Label htmlFor="tenure">Time Period</Label>
                <Input id="tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="e.g., 5" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Total Interest</p>
                         <p className="text-lg font-semibold">{formatCurrency(result.totalInterest)}</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Total Amount</p>
                         <p className="text-lg font-semibold">{formatCurrency(result.totalAmount)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         <Button onClick={handleCalculate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Coins className="mr-2"/>
            Calculate Interest
        </Button>
        {result && <Button variant="ghost" onClick={handleReset} className="w-full">Reset</Button>}
      </CardFooter>
    </Card>
  )
}
