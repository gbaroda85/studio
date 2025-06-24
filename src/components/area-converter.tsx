
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, AreaChart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const units = [
  { value: "m2", label: "Square Meter (m²)" },
  { value: "km2", label: "Square Kilometer (km²)" },
  { value: "cm2", label: "Square Centimeter (cm²)" },
  { value: "ft2", label: "Square Foot (ft²)" },
  { value: "in2", label: "Square Inch (in²)" },
  { value: "yd2", label: "Square Yard (yd²)" },
  { value: "acre", label: "Acre" },
  { value: "hectare", label: "Hectare" },
  { value: "mi2", label: "Square Mile (mi²)" },
];

// All conversions are relative to square meters (m²)
const conversionFactors: Record<string, number> = {
  "m2": 1,
  "km2": 1000000,
  "cm2": 0.0001,
  "ft2": 0.092903,
  "in2": 0.00064516,
  "yd2": 0.836127,
  "acre": 4046.86,
  "hectare": 10000,
  "mi2": 2589990,
};

export default function AreaConverter() {
  const [inputValue, setInputValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("m2")
  const [toUnit, setToUnit] = useState("ft2")
  const [result, setResult] = useState("")

  useEffect(() => {
    const convert = () => {
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        setResult("");
        return;
      }

      const valueInBase = value * conversionFactors[fromUnit];
      const convertedValue = valueInBase / conversionFactors[toUnit];

      setResult(convertedValue.toPrecision(6));
    };
    convert();
  }, [inputValue, fromUnit, toUnit]);
  
  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AreaChart className="text-primary" /> Area Converter</CardTitle>
        <CardDescription>Convert area units seamlessly.</CardDescription>
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
