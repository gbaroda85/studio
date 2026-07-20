
"use client";

import { useState, useMemo } from "react";
import { 
    RefreshCcw, 
    ShieldCheck, 
    Zap, 
    TrendingUp, 
    PieChart, 
    Banknote,
    ArrowRight,
    Info,
    ChevronRight,
    Loader2,
    CalendarDays,
    Star,
    Trophy
} from "lucide-react";
import { 
    PieChart as RechartsPie, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CalcMode = 'serving' | 'pensioner';
const COLORS = ["#0d5a71", "#ef4444"];

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function CpcArrearsCalculator() {
  const [mode, setMode] = useState<CalcMode>('pensioner');
  const [isCalculated, setIsCalculated] = useState(false);
  
  // Input States
  const [basicPay, setBasicPay] = useState<string>("28195");
  const [otherAllowances, setOtherAllowances] = useState<string>("0");
  const [msp, setMsp] = useState<string>("0");
  const [fitmentFactor, setFitmentFactor] = useState<string>("2");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val);

  const results = useMemo(() => {
    const b = parseFloat(basicPay) || 0;
    const allowances = parseFloat(otherAllowances) || 0;
    const mspVal = parseFloat(msp) || 0;
    const ff = parseFloat(fitmentFactor) || 2.0;

    /**
     * ACCURACY LOGIC: Matching reference app exactly
     * The image shows: Pension 28,195 | Fitment 2.0 | Arrears 2,18,229
     * Math: (28195 * 2.0) - (28195 * 1.57) = 12123.85 monthly hike
     * Total for 18 months = 12123.85 * 18 = 218229.3
     * This confirms the app uses 57% DA as the 7th CPC benchmark for 1 Jan 2026.
     */
    const benchmarkDaRate = 0.57; 
    const months = 18;
    
    const basis = mode === 'serving' ? (b + mspVal) : b;
    
    const currentMonthlyPay = (basis * (1 + benchmarkDaRate)) + allowances;
    const newMonthlyPay = (basis * ff) + allowances;
    
    const monthlyHike = newMonthlyPay - currentMonthlyPay;
    const totalArrears = Math.round(monthlyHike * months);

    return {
        newBasic: Math.round(b * ff),
        currentGross: Math.round(currentMonthlyPay),
        newGross: Math.round(newMonthlyPay),
        monthlyHike: Math.round(monthlyHike),
        totalArrears: totalArrears,
        chartData: [
            { name: 'Current Pay', value: Math.round(currentMonthlyPay) },
            { name: 'Hike Amount', value: Math.round(monthlyHike) }
        ]
    };
  }, [mode, basicPay, otherAllowances, msp, fitmentFactor]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setBasicPay("28195");
    setOtherAllowances("0");
    setMsp("0");
    setFitmentFactor("2");
    setIsCalculated(false);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 px-4 animate-in fade-in duration-700 mx-auto text-left relative">
      
      {/* INPUT PANEL */}
      <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
        <CardHeader className="bg-primary/5 border-b p-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="size-10 md:size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <Banknote className="size-5 md:size-6" />
                  </div>
                  <div className="text-left">
                      <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter">8th CPC Arrears</CardTitle>
                      <CardDescription className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-left">Industrial Accuracy Engine</CardDescription>
                  </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleReset} className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"><RefreshCcw className="size-4" /></Button>
           </div>
        </CardHeader>
        
        <CardContent className="p-0">
           <Tabs value={mode} onValueChange={(v) => { setMode(v as CalcMode); setIsCalculated(false); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/30 p-1.5 border-b">
                  <TabsTrigger value="serving" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg">Serving</TabsTrigger>
                  <TabsTrigger value="pensioner" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg">Pensioner</TabsTrigger>
              </TabsList>

              <div className="p-6 md:p-10 space-y-8">
                  <div className="space-y-4 text-left">
                      <Label className="text-[10px] font-black uppercase opacity-60 ml-1">
                        {mode === 'serving' ? 'Basic Pay (excluding DA)' : 'Pension (excluding DR)'}
                      </Label>
                      <Input 
                        type="number" 
                        value={basicPay} 
                        onChange={(e) => { setBasicPay(e.target.value); setIsCalculated(false); }} 
                        className="h-14 border-2 rounded-2xl font-black text-2xl px-6 bg-muted/10 shadow-inner focus-visible:ring-primary/20" 
                      />
                  </div>

                  {mode === 'serving' && (
                      <div className="space-y-4 text-left animate-in slide-in-from-top-2">
                          <Label className="text-[10px] font-black uppercase opacity-60 ml-1">Military Service Pay (MSP)</Label>
                          <div className="grid grid-cols-3 gap-3">
                              {["0", "5200", "15500"].map(val => (
                                  <button 
                                      key={val} 
                                      onClick={() => { setMsp(val); setIsCalculated(false); }}
                                      className={cn(
                                          "h-12 rounded-xl border-2 font-black text-sm transition-all flex items-center justify-center gap-2",
                                          msp === val ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-muted/20 hover:border-primary/40"
                                      )}
                                  >
                                      {val === "0" ? "None" : val}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center px-1">
                          <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Fitment Factor (range: 1.6 - 4)</Label>
                      </div>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={fitmentFactor} 
                        onChange={(e) => { setFitmentFactor(e.target.value); setIsCalculated(false); }} 
                        className="h-12 border-2 rounded-xl font-black text-xl text-center bg-muted/5 shadow-inner" 
                      />
                  </div>
              </div>
           </Tabs>
        </CardContent>

        <CardFooter className="p-6 md:p-8 bg-muted/10 border-t">
            <Button 
              onClick={handleCalculate} 
              className="w-full h-16 bg-primary text-primary-foreground font-black text-lg rounded-[1.5rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all group border-none"
            >
              Calculate Arrears
            </Button>
        </CardFooter>
      </Card>

      {/* RESULTS DISPLAY */}
      <AnimatePresence mode="wait">
          {isCalculated && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                  {/* BIG BLUE RESULT CARD - MIRRORING IMAGE */}
                  <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-[#2563eb] text-white relative group">
                      <div className="absolute top-0 right-0 size-80 bg-white/5 blur-3xl rounded-full" />
                      <StarIcons />

                      <CardContent className="p-10 md:p-14 flex flex-col items-center text-center gap-6 relative z-10">
                          <div className="space-y-2">
                              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter opacity-90 drop-shadow-lg">Estimated Arrears</h3>
                              <div className="flex flex-col items-center gap-1 opacity-80">
                                  <p className="text-xs md:text-lg font-bold tracking-wide uppercase">01 Jan 2026 - 30 Jun 2027 (18 Months)</p>
                              </div>
                          </div>
                          
                          <div className="relative">
                              <span className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex items-center justify-center">
                                  <span className="text-3xl md:text-5xl mr-3 opacity-70">₹</span>
                                  {results.totalArrears.toLocaleString('en-IN')}
                              </span>
                          </div>
                      </CardContent>
                  </Card>

                  {/* ADDITIONAL ANALYTICS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-6 rounded-[2rem] border-2 shadow-xl bg-white dark:bg-slate-900 text-left">
                          <div className="flex items-center justify-between mb-4">
                              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><TrendingUp className="size-5" /></div>
                              <Badge className="bg-emerald-600 text-white font-black text-[9px]">MONTHLY HIKE</Badge>
                          </div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Salary Difference</p>
                          <p className="text-3xl font-black text-primary tracking-tighter">+{formatCurrency(results.monthlyHike)}</p>
                          <Separator className="my-4 opacity-10" />
                          <div className="flex justify-between text-[10px] font-bold">
                              <span className="opacity-40 uppercase">New Basic</span>
                              <span className="font-black text-emerald-600">{formatCurrency(results.newBasic)}</span>
                          </div>
                      </Card>

                      <Card className="p-6 rounded-[2rem] border-2 shadow-xl bg-white dark:bg-slate-900 text-left">
                          <div className="flex items-center justify-between mb-4">
                              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><PieChart className="size-5" /></div>
                              <Badge variant="outline" className="text-[9px] font-black border-primary/20">GROWTH</Badge>
                          </div>
                          <div className="size-32 mx-auto relative mb-2">
                              <ResponsiveContainer width="100%" height="100%">
                                  <RechartsPie>
                                      <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                          {results.chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                      </Pie>
                                  </RechartsPie>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className="text-xs font-black text-primary">{( (results.monthlyHike / results.currentGross) * 100).toFixed(0)}%</span>
                              </div>
                          </div>
                          <p className="text-center text-[10px] font-black uppercase text-muted-foreground opacity-60">Overall Hike Percentage</p>
                      </Card>
                  </div>

                  <div className="p-8 bg-primary/5 rounded-[3rem] border border-dashed border-primary/20 flex gap-6 text-left shadow-inner">
                      <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-primary/10 shrink-0">
                          <ShieldCheck className="size-8 text-green-500 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                          <h4 className="text-sm font-black uppercase tracking-tighter text-slate-800 dark:text-white">Professional Audit Profile</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed opacity-80">
                            Calculation benchmarked at **57% Dearness Relief (DR/DA)** merger rate for January 2026. This is an estimate based on standard fitment factor projections.
                          </p>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
    return <div className={cn("h-px w-full bg-slate-200", className)} />
}
