
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Fuel } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const units = [
  { value: "km/l", label: "Kilometer/liter (km/L)" },
  { value: "mpg_us", label: "Miles/gallon (US)" },
  { value: "mpg_uk", label: "Miles/gallon (UK)" },
  { value: "l/100km", label: "Liter/100 km" },
];

// All conversions are to and from km/L as the base unit
const conversionFactors: Record<string, number> = {
  "km/l": 1,
  "mpg_us": 0.425144, // 1 mpg (US) = 0.425144 km/L
  "mpg_uk": 0.354006, // 1 mpg (UK) = 0.354006 km/L
  "l/100km": 1, // Special case, handled in logic
};

export default function FuelConverter() {
  const [inputValue, setInputValue] = useState("10")
  const [fromUnit, setFromUnit] = useState("l/100km")
  const [toUnit, setToUnit] = useState("mpg_us")
  const [result, setResult] = useState("")

  useEffect(() => {
    const convert = () => {
      const value = parseFloat(inputValue);
      if (isNaN(value) || value === 0) {
        setResult("");
        return;
      }

      let valueInBase; // Base unit is km/L
      if (fromUnit === "l/100km") {
        valueInBase = 100 / value;
      } else {
        valueInBase = value * conversionFactors[fromUnit];
      }

      let convertedValue;
      if (toUnit === "l/100km") {
        convertedValue = (valueInBase > 0) ? 100 / valueInBase : 0;
      } else {
        convertedValue = valueInBase / conversionFactors[toUnit];
      }
      
      setResult(convertedValue.toPrecision(5));
    };
    convert();
  }, [inputValue, fromUnit, toUnit]);
  
  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Fuel className="text-primary" /> Fuel Consumption Converter</CardTitle>
        <CardDescription>Convert various fuel economy units.</CardDescription>
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
