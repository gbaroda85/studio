
"use client";

import { useState, useEffect } from "react";
import { 
    PiggyBank, 
    Coins, 
    TrendingUp, 
    RefreshCcw, 
    Info, 
    Zap, 
    Calendar, 
    Trophy,
    ArrowUpRight,
    CircleDollarSign,
    PieChart,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type CalcMode = 'fd' | 'rd';

export default function FdRdCalculator() {
  const [mode, setMode] = useState<CalcMode>('fd');

  // FD States
  const [fdPrincipal, setFdPrincipal] = useState(100000);
  const [fdRate, setFdRate] = useState(7.5);
  const [fdTenure, setFdTenure] = useState(5);
  const [fdCompounding, setFdCompounding] = useState("4"); // Quarterly

  // RD States
  const [rdMonthly, setRdMonthly] = useState(5000);
  const [rdRate, setRdRate] = useState(6.5);
  const [rdTenure, setRdTenure] = useState(2);

  const [result, setResult] = useState<{
    invested: number;
    interest: number;
    maturity: number;
  } | null>(null);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const calculate = () => {
    if (mode === 'fd') {
      const p = fdPrincipal;
      const r = fdRate / 100;
      const n = parseInt(fdCompounding);
      const t = fdTenure;

      // Compound Interest: A = P(1 + r/n)^(nt)
      const maturity = p * Math.pow(1 + r / n, n * t);
      setResult({
        invested: Math.round(p),
        interest: Math.round(maturity - p),
        maturity: Math.round(maturity)
      });
    } else {
      const r = rdMonthly;
      const rate = rdRate / 100;
      const n = rdTenure * 12;
      const i = rate / 12;

      // RD Maturity: M = R * [(1+i)^n - 1] / (1 - (1+i)^(-1/3)) for quarterly, 
      // but monthly compound is standard for simple web calculators
      const maturity = r * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = r * n;
      
      setResult({
        invested: Math.round(invested),
        interest: Math.round(maturity - invested),
        maturity: Math.round(maturity)
      });
    }
  };

  useEffect(() => {
    calculate();
  }, [mode, fdPrincipal, fdRate, fdTenure, fdCompounding, rdMonthly, rdRate, rdTenure]);

  const handleReset = () => {
    if (mode === 'fd') {
      setFdPrincipal(100000); setFdRate(7.5); setFdTenure(5); setFdCompounding("4");
    } else {
      setRdMonthly(5000); setRdRate(6.5); setRdTenure(2);
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in duration-700 mx-auto">
      
      {/* Left: Input Selection */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
          <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <PiggyBank className="size-7" />
                    </div>
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Investment Studio</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest">FD & RD Wealth Estimator</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"><RefreshCcw className="size-4" /></Button>
             </div>
          </CardHeader>
          
          <CardContent className="p-0">
             <Tabs value={mode} onValueChange={(v) => setMode(v as CalcMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/30 p-1.5 border-b">
                    <TabsTrigger value="fd" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">Fixed Deposit (FD)</TabsTrigger>
                    <TabsTrigger value="rd" className="font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">Recurring (RD)</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8 space-y-10">
                    <TabsContent value="fd" className="m-0 space-y-8 animate-in slide-in-from-left duration-300">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">Investment Amount (₹)</Label>
                                <Badge variant="secondary" className="font-black px-3">{formatCurrency(fdPrincipal)}</Badge>
                            </div>
                            <Slider min={1000} max={10000000} step={1000} value={[fdPrincipal]} onValueChange={(v) => setFdPrincipal(v[0])} />
                            <Input type="number" value={fdPrincipal} onChange={(e) => setFdPrincipal(Number(e.target.value))} className="h-10 border-2 font-bold text-center" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Interest Rate (% p.a.)</Label>
                                <Input type="number" step="0.1" value={fdRate} onChange={(e) => setFdRate(Number(e.target.value))} className="h-12 border-2 font-black text-lg text-center" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Tenure (Years)</Label>
                                <Input type="number" value={fdTenure} onChange={(e) => setFdTenure(Number(e.target.value))} className="h-12 border-2 font-black text-lg text-center" />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="rd" className="m-0 space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase opacity-60">Monthly Installment (₹)</Label>
                                <Badge variant="secondary" className="font-black px-3">{formatCurrency(rdMonthly)}</Badge>
                            </div>
                            <Slider min={500} max={500000} step={500} value={[rdMonthly]} onValueChange={(v) => setRdMonthly(v[0])} />
                            <Input type="number" value={rdMonthly} onChange={(e) => setRdMonthly(Number(e.target.value))} className="h-10 border-2 font-bold text-center" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Rate of Return (%)</Label>
                                <Input type="number" step="0.1" value={rdRate} onChange={(e) => setRdRate(Number(e.target.value))} className="h-12 border-2 font-black text-lg text-center" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60">Tenure (Years)</Label>
                                <Input type="number" value={rdTenure} onChange={(e) => setRdTenure(Number(e.target.value))} className="h-12 border-2 font-black text-lg text-center" />
                            </div>
                        </div>
                    </TabsContent>

                    <div className="p-5 bg-blue-500/5 rounded-[1.5rem] border-2 border-blue-500/10 flex gap-4">
                        <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                            <Info className="size-5 text-blue-600" />
                        </div>
                        <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
                            {mode === 'fd' 
                              ? "FD interest is typically compounded quarterly. We use standard A = P(1+r/n)^nt formula."
                              : "RD calculates interest based on your monthly installments and tenure."
                            }
                        </p>
                    </div>
                </div>
             </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/10 p-6 border-t">
              <div className="flex items-center gap-4 text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest mx-auto">
                 <ShieldCheck className="size-3 text-green-500" /> Secure Local Calculation
              </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right: Results Dashboard */}
      <div className="lg:col-span-7 space-y-6">
        {result && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
                {/* Main Maturity Display */}
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-primary/20 relative group">
                    <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-3xl rounded-full" />
                    <CardHeader className="bg-primary/5 p-4 border-b text-center">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                           <TrendingUp className="size-3" /> MATURITY ESTIMATE PROFILE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 space-y-10 relative z-10">
                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Total Maturity Value</p>
                            <p className="text-5xl md:text-7xl font-black text-primary tracking-tighter drop-shadow-sm">{formatCurrency(result.maturity)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-muted/20 rounded-[2.5rem] border text-center space-y-1.5 shadow-inner">
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Total Invested</p>
                                <p className="text-2xl font-black">{formatCurrency(result.invested)}</p>
                            </div>
                            <div className="p-6 bg-green-500/5 rounded-[2.5rem] border-2 border-green-500/20 text-center space-y-1.5 shadow-lg group-hover:scale-105 transition-transform">
                                <p className="text-[10px] font-black text-green-700 uppercase">Interest Earned</p>
                                <p className="text-2xl font-black text-green-600">+{formatCurrency(result.interest)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Return Ratio</span>
                                <Badge className="bg-primary text-white font-black text-[10px]">{( (result.interest / result.invested) * 100).toFixed(1)}% GAIN</Badge>
                            </div>
                            <div className="h-4 bg-muted rounded-full overflow-hidden border p-0.5">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(result.invested / result.maturity) * 100}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                                <span>Principal</span>
                                <span>Interest</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <HighlightStat 
                        icon={Zap} 
                        label="Growth Multiplier" 
                        value={`${(result.maturity / result.invested).toFixed(2)}x`} 
                        color="text-yellow-500" 
                    />
                    <HighlightStat 
                        icon={PieChart} 
                        label="Profit Chunk" 
                        value={`${((result.interest / result.maturity) * 100).toFixed(0)}%`} 
                        color="text-emerald-500" 
                    />
                    <HighlightStat 
                        icon={Trophy} 
                        label="Wealth Goal" 
                        value="On Track" 
                        color="text-primary" 
                    />
                </div>

                <div className="p-8 bg-primary/5 rounded-[3rem] border border-dashed border-primary/20 flex flex-col items-center gap-4 text-center">
                    <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-primary/10">
                        <Sparkles className="size-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-md leading-relaxed">
                        By staying invested for <span className="text-primary font-black">{mode === 'fd' ? fdTenure : rdTenure} years</span>, you leverage the magic of compounding to grow your wealth steadily.
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

function HighlightStat({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <Card className="border shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white dark:bg-slate-900 border-primary/5">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={cn("size-10 rounded-xl bg-muted/50 flex items-center justify-center", color)}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">{label}</p>
                    <p className="text-xl font-black tracking-tighter">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
