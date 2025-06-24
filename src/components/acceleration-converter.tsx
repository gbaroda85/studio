
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Gauge } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const units = [
  { value: "m/s2", label: "Meter/second² (m/s²)" },
  { value: "km/s2", label: "Kilometer/second² (km/s²)" },
  { value: "ft/s2", label: "Foot/second² (ft/s²)" },
  { value: "g", label: "Standard gravity (g)" },
  { value: "in/s2", label: "Inch/second² (in/s²)" },
  { value: "km/h2", label: "Kilometer/hour² (km/h²)" },
  { value: "mi/h2", label: "Mile/hour² (mi/h²)" },
];

const conversionFactors: Record<string, number> = {
  "m/s2": 1,
  "km/s2": 1000,
  "ft/s2": 0.3048,
  "g": 9.80665,
  "in/s2": 0.0254,
  "km/h2": 1000 / (3600 * 3600),
  "mi/h2": 1609.34 / (3600 * 3600),
};

export default function AccelerationConverter() {
  const [inputValue, setInputValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("m/s2")
  const [toUnit, setToUnit] = useState("ft/s2")
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
        <CardTitle className="flex items-center gap-2"><Gauge className="text-primary" /> Acceleration Converter</CardTitle>
        <CardDescription>Convert acceleration units instantly.</CardDescription>
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
