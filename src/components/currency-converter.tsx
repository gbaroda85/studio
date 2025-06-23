
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Coins, Info } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// In a real app, you'd fetch this from an API. For this prototype, we use static rates relative to USD.
const staticRates: Record<string, { name: string, rate: number }> = {
  USD: { name: "United States Dollar", rate: 1 },
  EUR: { name: "Euro", rate: 0.92 },
  JPY: { name: "Japanese Yen", rate: 157 },
  GBP: { name: "British Pound", rate: 0.79 },
  INR: { name: "Indian Rupee", rate: 83.5 },
  AUD: { name: "Australian Dollar", rate: 1.5 },
  CAD: { name: "Canadian Dollar", rate: 1.37 },
  CNY: { name: "Chinese Yuan", rate: 7.25 },
};

export default function CurrencyConverter() {
  const [inputValue, setInputValue] = useState("100")
  const [fromUnit, setFromUnit] = useState("USD")
  const [toUnit, setToUnit] = useState("INR")
  const [result, setResult] = useState("")

  useEffect(() => {
    const convert = () => {
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        setResult("");
        return;
      }

      const valueInUSD = value / staticRates[fromUnit].rate;
      const convertedValue = valueInUSD * staticRates[toUnit].rate;

      setResult(convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    };
    convert();
  }, [inputValue, fromUnit, toUnit]);
  
  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-yellow-500/80 hover:shadow-2xl hover:shadow-yellow-500/20 hover:ring-2 hover:ring-yellow-500/50 dark:hover:shadow-yellow-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Coins className="text-yellow-500" /> Currency Converter</CardTitle>
        <CardDescription>Convert between major world currencies.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="from-unit">From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger id="from-unit"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(staticRates).map(u => <SelectItem key={u} value={u}>{staticRates[u].name} ({u})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center items-end h-full">
            <ArrowRight className="h-6 w-6 text-muted-foreground md:mt-6" />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="to-unit">To</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger id="to-unit"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(staticRates).map(u => <SelectItem key={u} value={u}>{staticRates[u].name} ({u})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
                <Label htmlFor="input-value">Amount to Convert</Label>
                <Input id="input-value" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter amount" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="result">Converted Amount</Label>
                <Input id="result" type="text" value={result} readOnly placeholder="Result" className="font-bold bg-muted/50" />
            </div>
        </div>
        <Alert variant="default" className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Demonstration Only</AlertTitle>
          <AlertDescription>
            The exchange rates used are for demonstration purposes and are not updated in real-time. Do not use for actual financial transactions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
