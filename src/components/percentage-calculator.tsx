
"use client"

import { useState } from "react"
import { Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CalcMode = 'simple' | 'part_of_whole' | 'marks' | 'ratio';

export default function PercentageCalculator() {
  const [mode, setMode] = useState<CalcMode>('simple');

  // State for "X% of Y"
  const [p1_percentage, setP1_percentage] = useState("")
  const [p1_baseValue, setP1_baseValue] = useState("")
  const [p1_result, setP1_result] = useState<string | null>(null)

  // State for "X is what % of Y"
  const [p2_part, setP2_part] = useState("")
  const [p2_whole, setP2_whole] = useState("")
  const [p2_result, setP2_result] = useState<string | null>(null)

  // State for "Marks Percentage"
  const [p3_obtained, setP3_obtained] = useState("")
  const [p3_total, setP3_total] = useState("")
  const [p3_result, setP3_result] = useState<string | null>(null)

  // State for "Ratio to Percentage"
  const [p4_ratioX, setP4_ratioX] = useState("")
  const [p4_ratioY, setP4_ratioY] = useState("")
  const [p4_result, setP4_result] = useState<string | null>(null)


  const handleCalculate = () => {
    if (mode === 'simple') {
        const p = parseFloat(p1_percentage);
        const v = parseFloat(p1_baseValue);
        if (isNaN(p) || isNaN(v)) { setP1_result(null); return; }
        setP1_result(((p / 100) * v).toLocaleString());
    } else if (mode === 'part_of_whole') {
        const part = parseFloat(p2_part);
        const whole = parseFloat(p2_whole);
        if (isNaN(part) || isNaN(whole) || whole === 0) { setP2_result(null); return; }
        setP2_result(((part / whole) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%");
    } else if (mode === 'marks') {
        const obtained = parseFloat(p3_obtained);
        const total = parseFloat(p3_total);
        if (isNaN(obtained) || isNaN(total) || total === 0) { setP3_result(null); return; }
        setP3_result(((obtained / total) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%");
    } else if (mode === 'ratio') {
        const x = parseFloat(p4_ratioX);
        const y = parseFloat(p4_ratioY);
        if (isNaN(x) || isNaN(y) || y === 0) { setP4_result(null); return; }
        setP4_result(((x / y) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%");
    }
  }

  const handleReset = () => {
    if (mode === 'simple') {
        setP1_percentage("");
        setP1_baseValue("");
        setP1_result(null);
    } else if (mode === 'part_of_whole') {
        setP2_part("");
        setP2_whole("");
        setP2_result(null);
    } else if (mode === 'marks') {
        setP3_obtained("");
        setP3_total("");
        setP3_result(null);
    } else if (mode === 'ratio') {
        setP4_ratioX("");
        setP4_ratioY("");
        setP4_result(null);
    }
  }
  
  const renderResult = (result: string | null) => {
    if (result === null) return null;
    return (
        <div className="pt-6 text-center">
            <p className="text-muted-foreground">Result</p>
            <p className="text-5xl font-bold text-cyan-500 my-2">{result}</p>
        </div>
    )
  }

  return (
    <Card className="w-full max-w-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/20 hover:ring-2 hover:ring-cyan-500/50 dark:hover:shadow-cyan-500/10">
      <CardHeader>
        <CardTitle>Percentage Calculator</CardTitle>
        <CardDescription>Perform various percentage calculations.</CardDescription>
      </CardHeader>
      <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as CalcMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="part_of_whole">Part/Whole</TabsTrigger>
              <TabsTrigger value="marks">Marks</TabsTrigger>
              <TabsTrigger value="ratio">Ratio</TabsTrigger>
            </TabsList>
            <TabsContent value="simple" className="space-y-4 pt-4">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p1_percentage">What is</Label>
                  <Input id="p1_percentage" type="number" value={p1_percentage} onChange={(e) => setP1_percentage(e.target.value)} placeholder="25" />
                </div>
                <span className="pb-2 text-xl font-bold text-cyan-500">%</span>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p1_base_value">of</Label>
                  <Input id="p1_base_value" type="number" value={p1_baseValue} onChange={(e) => setP1_baseValue(e.target.value)} placeholder="150" />
                </div>
              </div>
              {renderResult(p1_result)}
            </TabsContent>
            <TabsContent value="part_of_whole" className="space-y-4 pt-4">
               <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p2_part">Value</Label>
                  <Input id="p2_part" type="number" value={p2_part} onChange={(e) => setP2_part(e.target.value)} placeholder="e.g., 40" />
                </div>
                <span className="pb-2 text-muted-foreground">is what % of</span>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p2_whole">Total</Label>
                  <Input id="p2_whole" type="number" value={p2_whole} onChange={(e) => setP2_whole(e.target.value)} placeholder="e.g., 200" />
                </div>
              </div>
              {renderResult(p2_result)}
            </TabsContent>
            <TabsContent value="marks" className="space-y-4 pt-4">
               <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p3_obtained">Marks Obtained</Label>
                  <Input id="p3_obtained" type="number" value={p3_obtained} onChange={(e) => setP3_obtained(e.target.value)} placeholder="e.g., 450" />
                </div>
                <span className="pb-2 text-muted-foreground">out of</span>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p3_total">Total Marks</Label>
                  <Input id="p3_total" type="number" value={p3_total} onChange={(e) => setP3_total(e.target.value)} placeholder="e.g., 500" />
                </div>
              </div>
              {renderResult(p3_result)}
            </TabsContent>
            <TabsContent value="ratio" className="space-y-4 pt-4">
               <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p4_ratioX">Ratio Value</Label>
                  <Input id="p4_ratioX" type="number" value={p4_ratioX} onChange={(e) => setP4_ratioX(e.target.value)} placeholder="e.g., 3" />
                </div>
                <span className="pb-2 text-2xl font-bold text-muted-foreground">:</span>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="p4_ratioY">To Value</Label>
                  <Input id="p4_ratioY" type="number" value={p4_ratioY} onChange={(e) => setP4_ratioY(e.target.value)} placeholder="e.g., 4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Converts the ratio X:Y into a percentage.</p>
              {renderResult(p4_result)}
            </TabsContent>
          </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4">
        <Button onClick={handleCalculate} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
          <Percent className="mr-2" />
          Calculate
        </Button>
        <Button variant="ghost" onClick={handleReset} className="w-full">Clear</Button>
      </CardFooter>
    </Card>
  )
}
