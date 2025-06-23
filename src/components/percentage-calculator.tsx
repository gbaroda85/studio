"use client"

import { useState } from "react"
import { Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PercentageCalculator() {
  const [percentage, setPercentage] = useState("")
  const [baseValue, setBaseValue] = useState("")
  const [result, setResult] = useState<string | null>(null)

  const handleCalculate = () => {
    const p = parseFloat(percentage)
    const v = parseFloat(baseValue)

    if (isNaN(p) || isNaN(v)) {
      setResult(null)
      return
    }

    const calculatedResult = (p / 100) * v;
    setResult(calculatedResult.toLocaleString());
  }

  const handleReset = () => {
    setPercentage("");
    setBaseValue("");
    setResult(null);
  }

  return (
    <Card className="w-full max-w-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/20 hover:ring-2 hover:ring-cyan-500/50 dark:hover:shadow-cyan-500/10">
      <CardHeader>
        <CardTitle>Percentage Calculator</CardTitle>
        <CardDescription>Quickly find the percentage of a number.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-2/5 space-y-2">
            <Label htmlFor="percentage">What is</Label>
            <Input id="percentage" type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="e.g., 25" />
          </div>
          <span className="mt-8 text-xl font-bold text-cyan-500">%</span>
          <div className="w-3/5 space-y-2">
            <Label htmlFor="base-value">of</Label>
            <Input id="base-value" type="number" value={baseValue} onChange={(e) => setBaseValue(e.target.value)} placeholder="e.g., 150" />
          </div>
        </div>
        
        {result !== null && (
            <div className="pt-6 text-center">
                <p className="text-muted-foreground">Result</p>
                <p className="text-5xl font-bold text-cyan-500 my-2">{result}</p>
            </div>
        )}

      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleCalculate} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
          <Percent className="mr-2" />
          Calculate
        </Button>
        {result !== null && <Button variant="ghost" onClick={handleReset} className="w-full">Clear</Button>}
      </CardFooter>
    </Card>
  )
}
