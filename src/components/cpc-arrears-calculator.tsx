
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
    CalendarDays
} from "lucide-react";
import { 
    PieChart as RechartsPie, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CalcMode = 'serving' | 'pensioner';
const COLORS = ["#0d5a71", "#ef4444"];

export default function CpcArrearsCalculator() {
  const [mode, setMode] = useState<CalcMode>('serving');
  const [isCalculated, setIsCalculated] = useState(false);
  
  // Input States
  const [basicPay, setBasicPay] = useState<string>("169000");
  const [otherAllowances, setOtherAllowances] = useState<string>("25000");
  const [msp, setMsp] = useState<string>("15500");
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

    // --- ACCURACY LOGIC: 18 MONTHS ARREARS (JAN 2026 - JUN 2027) ---
    // 7th CPC implementation ended at implementation with approx 53% DA
    const oldDaRate = 0.53; 
    
    // Projected 8th CPC DA path for 18 months
    // Months 1-6: 0% | 7-12: 5% | 13-18: 10% (Estimated for arrears)
    const avgNewDa = (0 * 6 + 0.05 * 6 + 0.10 * 6) / 18; 
    
    const basis = mode === 'serving' ? (b + mspVal) : b;
    
    const oldMonthlyGross = (basis * (1 + oldDaRate)) + allowances;
    const newMonthlyGross = (basis * ff * (1 + avgNewDa)) + allowances;
    
    const monthlyHike = newMonthlyGross - oldMonthlyGross;
    const totalArrears = monthlyHike * 18;

    return {
        newBasic: Math.round(b * ff),
        newMsp: Math.round(mspVal * ff),
        currentGross: Math.round(oldMonthlyGross),
        newGross: Math.round(newMonthlyGross),
        monthlyHike: Math.round(monthlyHike),
        totalArrears: Math.round(totalArrears),
        chartData: [
            { name: 'Current Pay', value: Math.round(oldMonthlyGross) },
            { name: 'Hike Amount', value: Math.round(monthlyHike) }
        ]
    };
  }, [mode, basicPay, otherAllowances, msp, fitmentFactor]);

  const handleCalculate = () => {
    setIsCalculated(true);
    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setBasicPay("169000");
    setOtherAllowances("25000");
    setMsp("15500");
    setFitmentFactor("2");
    setIsCalculated(false);
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700 mx-auto text-left relative">
      
      {/* LEFT: INPUT PANEL */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
          <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Banknote className="size-7" />
                    </div>
                    <div className="text-left">
                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Arrears Studio</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest text-left">8th CPC Pay Commission</CardDescription>
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

                <div className="p-6 md:p-8 space-y-8">
                    <div className="space-y-2 text-left">
                        <Label className="text-[10px] font-black uppercase opacity-60 ml-1">Basic Pay (including X Group Pay, etc)</Label>
                        <Input 
                          type="number" 
                          value={basicPay} 
                          onChange={(e) => setBasicPay(e.target.value)} 
                          className="h-14 border-2 rounded-2xl font-black text-2xl px-6 bg-muted/10 shadow-inner" 
                        />
                    </div>

                    <div className="space-y-2 text-left">
                        <Label className="text-[10px] font-black uppercase opacity-60 ml-1">Other Allowances (HRA, Risk, CEA, etc)</Label>
                        <Input 
                          type="number" 
                          value={otherAllowances} 
                          onChange={(e) => setOtherAllowances(e.target.value)} 
                          className="h-14 border-2 rounded-2xl font-black text-2xl px-6 bg-muted/10 shadow-inner" 
                        />
                    </div>

                    {mode === 'serving' && (
                        <div className="space-y-4 text-left">
                            <Label className="text-[10px] font-black uppercase opacity-60 ml-1">Military Service Pay (if applicable)</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {["0", "5200", "15500"].map(val => (
                                    <button 
                                        key={val} 
                                        onClick={() => setMsp(val)}
                                        className={cn(
                                            "h-12 rounded-xl border-2 font-black text-sm uppercase transition-all flex items-center justify-center gap-2",
                                            msp === val ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-muted/20 hover:border-primary/40"
                                        )}
                                    >
                                        <div className={cn("size-3 rounded-full border-2", msp === val ? "bg-white border-white" : "border-slate-300")} />
                                        {val === "0" ? "None" : val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 text-left pt-2">
                        <div className="flex justify-between items-center px-1">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Fitment Factor (range: 1.6 - 4)</Label>
                            <Badge className="bg-primary text-white font-black text-xs px-3">{fitmentFactor}x</Badge>
                        </div>
                        <Input 
                          type="number" 
                          step="0.1" 
                          value={fitmentFactor} 
                          onChange={(e) => setFitmentFactor(e.target.value)} 
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
                CALCULATE ARREARS
              </Button>
          </CardFooter>
        </Card>
      </div>

      {/* RIGHT: RESULTS DISPLAY */}
      <div className="lg:col-span-7 space-y-6">
        <AnimatePresence mode="wait">
            {!isCalculated ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-30 rounded-[3rem] bg-muted/10 min-h-[500px]">
                        <div className="relative mb-6">
                            <Banknote className="size-24 text-primary opacity-20" />
                            <Zap className="absolute inset-0 m-auto size-12 text-primary animate-pulse" />
                        </div>
                        <p className="text-2xl font-black uppercase tracking-widest">Awaiting Inputs</p>
                        <p className="text-xs font-bold uppercase opacity-60 mt-2">Fill your details and click calculate to see 18 months estimate</p>
                    </Card>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    
                    {/* BIG ARREARS RESULT CARD (Matches Image) */}
                    <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-primary text-white relative group">
                        {/* Sparkle effects like professional apps */}
                        <div className="absolute top-0 right-0 size-80 bg-white/5 blur-3xl rounded-full" />
                        <StarIcons />

                        <CardContent className="p-10 md:p-14 flex flex-col items-center text-center gap-6 relative z-10">
                            <div className="space-y-2">
                                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter opacity-90 drop-shadow-lg">Estimated Arrears</h3>
                                <div className="flex flex-col items-center gap-1 opacity-80">
                                    <p className="text-xs md:text-lg font-bold tracking-wide uppercase">01 Jan 2026 - 30 Jun 2027</p>
                                    <Badge variant="outline" className="border-white/40 text-white text-[10px] md:text-sm font-black px-4">18 MONTHS</Badge>
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

                    {/* GAIN BREAKDOWN GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-6 rounded-[2rem] border-2 shadow-xl bg-white dark:bg-slate-900 text-left">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><TrendingUp className="size-5" /></div>
                                <Badge className="bg-emerald-600 text-white font-black text-[9px]">PROJECTED HIKE</Badge>
                            </div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Monthly Salary Increase</p>
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
                                <Badge variant="outline" className="text-[9px] font-black border-primary/20">DISTRIBUTION</Badge>
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
                            <p className="text-center text-[10px] font-black uppercase text-muted-foreground opacity-60">Overall Salary Growth</p>
                        </Card>
                    </div>

                    {/* TECHNICAL COMPLIANCE INFO */}
                    <div className="p-8 bg-primary/5 rounded-[3rem] border border-dashed border-primary/20 flex gap-6 text-left shadow-inner">
                        <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-primary/10 shrink-0">
                            <ShieldCheck className="size-8 text-green-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black uppercase tracking-tighter text-slate-800 dark:text-white">Precision Calculation Profile</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed opacity-80">
                                This estimate factors in the expected **DA merger** and projected **average DA accrual** of 5% on 8th CPC scales over 18 months. Actual arrears depend on final Govt notifications.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

