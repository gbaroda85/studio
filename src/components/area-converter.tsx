
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, AreaChart, Scaling, ShieldCheck, Zap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const units = [
  { value: "m2", label: "Square Meter" },
  { value: "gaj", label: "Gaj (Square Yard)" },
  { value: "cent", label: "Cent" },
  { value: "bigha", label: "Bigha" },
  { value: "acre", label: "Acre" },
  { value: "lessa", label: "Lessa" },
  { value: "katha", label: "Katha" },
  { value: "sq_yard", label: "Square Yard" },
  { value: "biswa_kacha", label: "Biswa Kacha" },
  { value: "ankanam", label: "Ankanam" },
  { value: "ft2", label: "Square Feet" },
  { value: "guntha", label: "Guntha" },
  { value: "dhur", label: "Dhur" },
  { value: "dismil", label: "Dismil" },
  { value: "killa", label: "Killa" },
  { value: "marla", label: "Marla" },
  { value: "karam", label: "Square Karam" },
  { value: "hectare", label: "Hectare" },
  { value: "ares", label: "Ares" },
  { value: "decimal", label: "Decimal" },
  { value: "ground", label: "Ground" },
  { value: "perch", label: "Perch" },
  { value: "in2", label: "Square Inch" },
  { value: "kanal", label: "Kanal" },
  { value: "nali", label: "Nali" },
  { value: "mi2", label: "Square Mile" },
  { value: "gajam", label: "Gajam" },
  { value: "murabba", label: "Murabba" },
  { value: "km2", label: "Square Kilometer" },
  { value: "chatak", label: "Chatak" },
  { value: "cm2", label: "Square Centimeter" },
  { value: "pura", label: "Pura" },
  { value: "biswa", label: "Biswa" },
];

// Conversion factors relative to Square Meter (m2)
// These are based on standard Indian and International measurements
const conversionFactors: Record<string, number> = {
  "m2": 1,
  "gaj": 0.836127,
  "cent": 40.4686,
  "bigha": 2529.28, // Standard average
  "acre": 4046.86,
  "lessa": 13.378,
  "katha": 66.89,
  "sq_yard": 0.836127,
  "biswa_kacha": 125.44,
  "ankanam": 6.689,
  "ft2": 0.092903,
  "guntha": 101.171,
  "dhur": 6.34,
  "dismil": 40.4686,
  "killa": 4046.86,
  "marla": 25.2929,
  "karam": 2.7225,
  "hectare": 10000,
  "ares": 100,
  "decimal": 40.4686,
  "ground": 222.967,
  "perch": 25.2929,
  "in2": 0.00064516,
  "kanal": 505.857,
  "nali": 200.67,
  "mi2": 2589988.11,
  "gajam": 0.836127,
  "murabba": 101171.41,
  "km2": 1000000,
  "chatak": 4.18,
  "cm2": 0.0001,
  "pura": 13378.04,
  "biswa": 125.44,
};

export default function AreaConverter() {
  const [inputValue, setInputValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("m2")
  const [toUnit, setToUnit] = useState("gaj")
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

      // Use a fixed precision for better UI
      if (convertedValue < 0.000001) {
          setResult(convertedValue.toExponential(4));
      } else {
          setResult(convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 }));
      }
    };
    convert();
  }, [inputValue, fromUnit, toUnit]);
  
  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
      <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
        <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <AreaChart className="size-7" />
            </div>
            <div>
                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Land Area Converter</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">33+ Local & Global units supported</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
          <div className="md:col-span-5 space-y-3">
            <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60 ml-1">From Unit</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="h-12 border-2 font-bold rounded-xl bg-muted/20 shadow-inner">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 shadow-2xl max-h-[300px]">
                {units.map(u => <SelectItem key={u.value} value={u.value} className="font-bold py-2 uppercase text-[10px]">{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-center pt-6">
            <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/20">
                <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="md:col-span-5 space-y-3">
            <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60 ml-1">To Unit</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger className="h-12 border-2 font-bold rounded-xl bg-muted/20 shadow-inner">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 shadow-2xl max-h-[300px]">
                {units.map(u => <SelectItem key={u.value} value={u.value} className="font-bold py-2 uppercase text-[10px]">{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <Label htmlFor="input-value" className="text-[10px] font-black uppercase opacity-60">Input Value</Label>
                    <Badge variant="outline" className="text-[8px] font-black uppercase">{fromUnit}</Badge>
                </div>
                <Input 
                    id="input-value" 
                    type="number" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="Enter area..." 
                    className="h-14 text-2xl font-black border-2 rounded-2xl bg-background shadow-inner focus-visible:ring-primary/20"
                />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <Label htmlFor="result" className="text-[10px] font-black uppercase text-primary">Resulting Area</Label>
                    <Badge className="text-[8px] font-black uppercase bg-primary text-white">{toUnit}</Badge>
                </div>
                <div className="relative">
                    <Input 
                        id="result" 
                        type="text" 
                        value={result} 
                        readOnly 
                        className="h-14 text-2xl font-black border-2 rounded-2xl bg-primary/5 text-primary border-primary/20" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20"><Zap className="size-5 text-primary" /></div>
                </div>
            </div>
        </div>

        <div className="p-5 bg-blue-500/5 rounded-[1.5rem] border-2 border-blue-500/10 flex gap-4 shadow-sm">
            <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Scaling className="size-5 text-blue-600" />
            </div>
            <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
                Note: Local units like Bigha and Katha vary by state. This tool uses standard standardized values for general reference.
            </p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 p-6 border-t flex justify-center gap-8">
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                <ShieldCheck className="size-3.5 text-green-500" /> Secure Local Math
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                <Zap className="size-3.5 text-yellow-500" /> High Precision
            </div>
      </CardFooter>
    </Card>
  );
}
