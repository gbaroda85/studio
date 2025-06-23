
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Waves } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const units = [
  { value: "pa", label: "Pascal (Pa)" },
  { value: "kpa", label: "Kilopascal (kPa)" },
  { value: "bar", label: "Bar" },
  { value: "psi", label: "Pound-force/inch² (psi)" },
  { value: "atm", label: "Standard atmosphere (atm)" },
  { value: "torr", label: "Torr" },
];

// Conversion factors relative to Pascal (Pa)
const conversionFactors: Record<string, number> = {
  pa: 1,
  kpa: 1000,
  bar: 100000,
  psi: 6894.76,
  atm: 101325,
  torr: 133.322,
};

export default function PressureConverter() {
  const [inputValue, setInputValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("atm")
  const [toUnit, setToUnit] = useState("psi")
  const [result, setResult] = useState("")

  useEffect(() => {
    const convert = () => {
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        setResult("");
        return;
      }

      const valueInPascals = value * conversionFactors[fromUnit];
      const convertedValue = valueInPascals / conversionFactors[toUnit];

      setResult(convertedValue.toPrecision(6));
    };
    convert();
  }, [inputValue, fromUnit, toUnit]);
  
  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-sky-500/80 hover:shadow-2xl hover:shadow-sky-500/20 hover:ring-2 hover:ring-sky-500/50 dark:hover:shadow-sky-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Waves className="text-sky-500" /> Pressure Converter</CardTitle>
        <CardDescription>Convert various pressure units instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="from-unit">From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger id="from-unit"><SelectValue /></SelectTrigger>
              <SelectContent>
                {units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
                <Label htmlFor="input-value">Value to Convert</Label>
                <Input id="input-value" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter value" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="result">Result</Label>
                <Input id="result" type="text" value={result} readOnly placeholder="Result" className="font-bold bg-muted/50" />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
