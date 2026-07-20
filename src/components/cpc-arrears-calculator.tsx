"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    Calculator, 
    TrendingUp, 
    RefreshCcw, 
    ShieldCheck, 
    Zap, 
    ArrowUpRight,
    CircleDollarSign,
    PieChart,
    Wallet,
    Sparkles,
    Trophy,
    Info,
    ChevronRight,
    Users2,
    CalendarCheck,
    Banknote,
    BadgeIndianRupee
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
  
  // Serving States
  const [basicPay, setBasicPay] = useState(60000);
  const [otherAllowances, setOtherAllowances] = useState(5000);
  const [msp, setMsp] = useState("0");
  const [fitmentFactor, setFitmentFactor] = useState([2.57]);
  const [currentDa, setCurrentDa] = useState(50); // Current DA%

  // Pensioner States
  const [basicPension, setBasicPension] = useState(30000);
  const [fma, setFma] = useState(1000); // Fixed Medical Allowance

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val);

  const results = useMemo(() => {
    const factor = fitmentFactor[0];
    const da = currentDa / 100;
    
    if (mode === 'serving') {
        const mspValue = parseFloat(msp);
        const currentBasicPlusMsp = basicPay + mspValue;
        const currentDaAmt = currentBasicPlusMsp * da;
        const currentGross = currentBasicPlusMsp + currentDaAmt + otherAllowances;

        const newBasic = basicPay * factor;
        const newMsp = mspValue * factor;
        const newDaAmt = (newBasic + newMsp) * da; // Assuming same DA for simplicity
        const newGross = newBasic + newMsp + newDaAmt + otherAllowances;

        const monthlyHike = newGross - currentGross;
        
        return {
            currentBasic: basicPay,
            newBasic: Math.round(newBasic),
            currentGross: Math.round(currentGross),
            newGross: Math.round(newGross),
            monthlyHike: Math.round(monthlyHike),
            annualGain: Math.round(monthlyHike * 12),
            chartData: [
                { name: 'Current Pay', value: Math.round(currentGross) },
                { name: 'Monthly Hike', value: Math.round(monthlyHike) }
            ]
        };
    } else {
        const currentDaAmt = basicPension * da;
        const currentGross = basicPension + currentDaAmt + fma;

        const newPension = basicPension * factor;
        const newDaAmt = newPension * da;
        const newGross = newPension + newDaAmt + fma;

        const monthlyHike = newGross - currentGross;

        return {
            currentBasic: basicPension,
            newBasic: Math.round(newPension),
            currentGross: Math.round(currentGross),
            newGross: Math.round(newGross),
            monthlyHike: Math.round(monthlyHike),
            annualGain: Math.round(monthlyHike * 12),
            chartData: [
                { name: 'Current Pension', value: Math.round(currentGross) },
                { name: 'Monthly Hike', value: Math.round(monthlyHike) }
            ]
        };
    }
  }, [mode, basicPay, otherAllowances, msp, fitmentFactor, currentDa, basicPension, fma]);

  const handleReset = () => {
    setBasicPay(60000);
    setOtherAllowances(5000);
    setMsp("0");
    setFitmentFactor([2.57]);
    setBasicPension(30000);
    setFma(1000);
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700 mx-auto text-left">
      
      {/* Left: Input Selection */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
          <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Banknote className="size-7" />
                    </div>
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Arrears Studio</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest text-left">8th CPC Pay Commission</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"><RefreshCcw className="size-4" /></Button>
             </div>
          </CardHeader>
          
          <CardContent className="p-0">
             <Tabs value={mode} onValueChange={(v) => setMode(v as CalcMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/30 p-1.5 border-b">
                    <TabsTrigger value="serving" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg">Serving Employee</TabsTrigger>
                    <TabsTrigger value="pensioner" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg">Pensioner</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8 space-y-10">
                    <TabsContent value="serving" className="m-0 space-y-8 animate-in slide-in-from-left duration-300">
                        <div className="space-y-4 text-left">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">Current Basic Pay</Label>
                                <Badge variant="secondary" className="font-black px-3">{formatCurrency(basicPay)}</Badge>
                            </div>
                            <Slider min={18000} max={250000} step={500} value={[basicPay]} onValueChange={(v) => setBasicPay(v[0])} />
                            <Input type="number" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-xl text-center shadow-inner" />
                        </div>

                        <div className="space-y-4 text-left">
                            <Label className="text-[10px] font-black uppercase opacity-60">Military Service Pay (MSP)</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {["0", "5200", "15500"].map(val => (
                                    <button 
                                        key={val} 
                                        onClick={() => setMsp(val)}
                                        className={cn(
                                            "h-10 rounded-xl border-2 font-black text-[10px] uppercase transition-all",
                                            msp === val ? "bg-primary text-white border-primary shadow-lg" : "bg-muted/20 hover:border-primary/40"
                                        )}
                                    >
                                        {val === "0" ? "None" : `₹ ${val}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 text-left">
                            <Label className="text-[10px] font-black uppercase opacity-60">Other Allowances (HRA, CEA, etc)</Label>
                            <Input type="number" value={otherAllowances} onChange={(e) => setOtherAllowances(Number(e.target.value))} className="h-10 border-2 rounded-xl font-bold text-center" />
                        </div>
                    </TabsContent>

                    <TabsContent value="pensioner" className="m-0 space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="space-y-4 text-left">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">Current Basic Pension</Label>
                                <Badge variant="secondary" className="font-black px-3">{formatCurrency(basicPension)}</Badge>
                            </div>
                            <Slider min={9000} max={125000} step={500} value={[basicPension]} onValueChange={(v) => setBasicPension(v[0])} />
                            <Input type="number" value={basicPension} onChange={(e) => setBasicPension(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-xl text-center shadow-inner" />
                        </div>

                        <div className="space-y-4 text-left">
                            <Label className="text-[10px] font-black uppercase opacity-60">Fixed Medical Allowance (FMA)</Label>
                            <Input type="number" value={fma} onChange={(e) => setFma(Number(e.target.value))} className="h-10 border-2 rounded-xl font-bold text-center" />
                        </div>
                    </TabsContent>

                    <div className="space-y-6 pt-6 border-t border-dashed">
                        <div className="space-y-4 text-left">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                    <Zap className="size-3 text-yellow-500" /> Fitment Factor
                                </Label>
                                <Badge className="bg-primary text-white font-black text-xs px-3">{fitmentFactor[0]}x</Badge>
                            </div>
                            <Slider min={1.6} max={4.0} step={0.01} value={fitmentFactor} onValueChange={setFitmentFactor} />
                            <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                                <span>1.6 (Min)</span>
                                <span>2.57 (Current)</span>
                                <span>4.0 (Max)</span>
                            </div>
                        </div>

                        <div className="p-5 bg-blue-500/5 rounded-[1.5rem] border-2 border-blue-500/10 flex gap-4 text-left shadow-sm">
                            <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                <Info className="size-5 text-blue-600" />
                            </div>
                            <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
                                Arrears are usually calculated from Jan 2026. This is a projected estimate based on proposed fitment factors.
                            </p>
                        </div>
                    </div>
                </div>
             </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/10 p-6 border-t">
              <div className="flex items-center gap-4 text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest mx-auto">
                 <ShieldCheck className="size-3 text-green-500" /> Secure Local Math
              </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right: Results Dashboard */}
      <div className="lg:col-span-7 space-y-6">
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
            {/* Main Result Display */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-primary/20 relative group">
                <div className="absolute top-0 right-0 size-80 bg-primary/5 blur-3xl rounded-full" />
                <CardHeader className="bg-primary/5 p-4 border-b text-center">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                        <TrendingUp className="size-3" /> PROJECTED PAY GROWTH PROFILE
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-12 space-y-10 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                        <div className="md:col-span-6 flex flex-col items-center">
                            <div className="size-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={results.chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationDuration={800}
                                        >
                                            {results.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Estimated Hike</p>
                                    <p className="text-3xl font-black text-primary tracking-tighter">+{formatCurrency(results.monthlyHike)}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                                    <span className="text-[9px] font-black uppercase opacity-60">Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                                    <span className="text-[9px] font-black uppercase opacity-60">Gain</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-6 space-y-6">
                            <div className="p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20 text-center space-y-1 relative group overflow-hidden shadow-inner">
                                <Sparkles className="absolute -top-1 -right-1 size-8 text-primary/10 group-hover:animate-pulse" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Annual Wealth Gain</p>
                                <p className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(results.annualGain)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <StatItem label="Old Basic" value={formatCurrency(results.currentBasic)} icon={Calculator} />
                                <StatItem label="New Basic" value={formatCurrency(results.newBasic)} icon={Wallet} color="text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t-2 border-dashed border-primary/10 text-left">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <PieChart className="size-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Growth Projection</span>
                            </div>
                            <Badge className="bg-primary text-white font-black text-[10px]">
                                {((results.monthlyHike / results.currentGross) * 100).toFixed(1)}% INCREASE
                            </Badge>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border shadow-inner">
                            <div 
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${(results.currentGross / results.newGross) * 100}%` }} 
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase opacity-40 px-1">
                            <span>Current Gross: {formatCurrency(results.currentGross)}</span>
                            <span>Projected Gross: {formatCurrency(results.newGross)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Arrears Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HighlightStat icon={Zap} label="Growth Multiplier" value={`${fitmentFactor[0]}x`} color="text-yellow-500" />
                <HighlightStat icon={ArrowUpRight} label="Yield Factor" value={`${((results.monthlyHike / results.currentGross) * 100).toFixed(0)}%`} color="text-emerald-500" />
                <HighlightStat icon={Trophy} label="Status" value="Calculated" color="text-primary" />
            </div>

            <div className="p-8 bg-primary/5 rounded-[3rem] border border-dashed border-primary/20 flex flex-col items-center gap-4 text-center">
                <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-primary/10">
                    <Sparkles className="size-8 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-md leading-relaxed">
                    Based on the projected 8th Pay Commission fitment factor of <span className="text-primary font-black">{fitmentFactor[0]}</span>, your monthly salary is expected to increase by <span className="text-primary font-black">{formatCurrency(results.monthlyHike)}</span>.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color = "text-primary" }: { label: string, value: string, icon: any, color?: string }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border shadow-sm space-y-2 group hover:border-primary/30 transition-all hover:-translate-y-0.5 text-left">
            <div className="flex items-center justify-between">
                <Icon className={cn("size-4 opacity-40 group-hover:opacity-100 transition-opacity", color)} />
                <Badge variant="outline" className="text-[8px] font-black border-none opacity-40 uppercase">Projected</Badge>
            </div>
            <div>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className={cn("text-xs font-black tracking-tight", color)}>{value}</p>
            </div>
        </div>
    );
}

function HighlightStat({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <Card className="border shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-white dark:bg-slate-900 border-primary/5 group">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={cn("size-10 rounded-xl bg-muted/50 flex items-center justify-center transition-transform group-hover:scale-110", color)}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">{label}</p>
                    <p className="text-xl font-black tracking-tighter mt-0.5">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function RechartsPieChart({ children }: { children: React.ReactNode }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>{children}</PieChart>
        </ResponsiveContainer>
    );
}
