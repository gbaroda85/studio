"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    Landmark, 
    Globe, 
    RefreshCcw, 
    ShieldCheck, 
    Zap, 
    TrendingUp, 
    PieChart as PieIcon, 
    Wallet, 
    CircleDollarSign,
    Sparkles,
    Trophy,
    ArrowUpRight,
    Table as TableIcon,
    ChevronDown,
    CalendarCheck,
    ArrowRight
} from "lucide-react";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const COLORS = ["#043873", "#FF9F1C"];

const COUNTRIES = [
  { name: "India", currency: "INR", locale: "en-IN" },
  { name: "USA", currency: "USD", locale: "en-US" },
  { name: "UK", currency: "GBP", locale: "en-GB" },
  { name: "Europe", currency: "EUR", locale: "de-DE" },
  { name: "UAE", currency: "AED", locale: "ar-AE" },
  { name: "Canada", currency: "CAD", locale: "en-CA" },
  { name: "Australia", currency: "AUD", locale: "en-AU" },
  { name: "New Zealand", currency: "NZD", locale: "en-NZ" },
  { name: "Saudi Arabia", currency: "SAR", locale: "ar-SA" },
  { name: "Kuwait", currency: "KWD", locale: "ar-KW" },
  { name: "Qatar", currency: "QAR", locale: "ar-QA" },
  { name: "Oman", currency: "OMR", locale: "ar-OM" },
  { name: "Bahrain", currency: "BHD", locale: "ar-BH" },
  { name: "Singapore", currency: "SGD", locale: "en-SG" },
  { name: "Malaysia", currency: "MYR", locale: "en-MY" },
  { name: "Thailand", currency: "THB", locale: "th-TH" },
];

interface YearlyBreakdown {
    year: number;
    principalPaid: number;
    interestPaid: number;
    totalPaid: number;
    remainingBalance: number;
}

export default function LoanCalculator() {
  const [countryIndex, setCountryIndex] = useState(0);
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(5);
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");

  const currentCountry = COUNTRIES[countryIndex];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currentCountry.locale, {
      style: 'currency',
      currency: currentCountry.currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = useMemo(() => {
    const p = principal;
    const r = rate;
    const t = tenure;

    if (isNaN(p) || p <= 0 || isNaN(r) || r < 0 || isNaN(t) || t <= 0) {
      return null;
    }

    const monthlyRate = r / (12 * 100);
    const numberOfMonths = tenureUnit === 'years' ? t * 12 : t;
    
    let emi = 0;
    if (r === 0) {
        emi = p / numberOfMonths;
    } else {
        emi = (p * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    }

    const totalPayment = emi * numberOfMonths;
    const totalInterest = totalPayment - p;

    // Amortization Schedule Calculation
    const yearlyBreakdown: YearlyBreakdown[] = [];
    let currentBalance = p;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    const years = Math.ceil(numberOfMonths / 12);

    for (let year = 1; year <= years; year++) {
        let yearPrincipal = 0;
        let yearInterest = 0;

        for (let month = 1; year === years ? month <= (numberOfMonths % 12 || 12) : month <= 12; month++) {
            const monthlyInterest = currentBalance * monthlyRate;
            const monthlyPrincipal = emi - monthlyInterest;
            
            yearInterest += monthlyInterest;
            yearPrincipal += monthlyPrincipal;
            currentBalance -= monthlyPrincipal;
            
            if (currentBalance < 0) currentBalance = 0;
        }

        yearlyBreakdown.push({
            year,
            principalPaid: Math.round(yearPrincipal),
            interestPaid: Math.round(yearInterest),
            totalPaid: Math.round(yearPrincipal + yearInterest),
            remainingBalance: Math.round(currentBalance)
        });
    }

    const chartData = [
        { name: 'Principal', value: Math.round(p) },
        { name: 'Interest', value: Math.round(totalInterest) },
    ];

    return { emi, totalInterest, totalPayment, chartData, principal: p, yearlyBreakdown };
  }, [principal, rate, tenure, tenureUnit]);

  const handleReset = () => {
      setPrincipal(500000);
      setRate(8.5);
      setTenure(5);
      setTenureUnit("years");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
            <CardHeader className="bg-primary/5 border-b p-6 md:p-8 text-left">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Landmark className="size-7" />
                        </div>
                        <div>
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Loan Studio</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1 text-left">Industrial EMI Estimator</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-muted-foreground hover:text-destructive"><RefreshCcw className="size-4" /></Button>
                </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-10">
                {/* Country/Currency Selection */}
                <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Globe className="size-3" /> Select Country
                    </Label>
                    <Select value={String(countryIndex)} onValueChange={(v) => setCountryIndex(Number(v))}>
                        <SelectTrigger className="h-11 border-2 font-bold rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-2 shadow-2xl">
                            {COUNTRIES.map((c, i) => (
                                <SelectItem key={i} value={String(i)} className="font-bold py-2">{c.name} ({c.currency})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Principal Slider & Input */}
                <div className="space-y-5 text-left">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">Principal Amount</Label>
                        <Badge variant="secondary" className="font-black text-sm px-4 py-1 rounded-lg shadow-sm">{formatCurrency(principal)}</Badge>
                    </div>
                    <Slider min={10000} max={10000000} step={10000} value={[principal]} onValueChange={(v) => setPrincipal(v[0])} />
                    <div className="relative group">
                        <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-lg pl-10" />
                        <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-5 text-left">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">Interest Rate (% p.a.)</Label>
                        <Badge variant="secondary" className="font-black text-xs px-3 py-1 rounded-lg">{rate}%</Badge>
                    </div>
                    <Slider min={1} max={30} step={0.1} value={[rate]} onValueChange={(v) => setRate(v[0])} />
                    <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-lg text-center" />
                </div>

                {/* Tenure Section */}
                <div className="space-y-5 pt-4 border-t border-dashed text-left">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">Loan Period</Label>
                        <div className="flex bg-muted/40 p-1 rounded-lg border">
                            <button onClick={() => setTenureUnit('years')} className={cn("px-3 py-1 rounded-md text-[9px] font-black transition-all", tenureUnit === 'years' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>YEARS</button>
                            <button onClick={() => setTenureUnit('months')} className={cn("px-3 py-1 rounded-md text-[9px] font-black transition-all", tenureUnit === 'months' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>MONTHS</button>
                        </div>
                    </div>
                    <Slider min={1} max={tenureUnit === 'years' ? 30 : 360} step={1} value={[tenure]} onValueChange={(v) => setTenure(v[0])} />
                    <Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="h-12 border-2 rounded-xl font-black text-lg text-center" />
                </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 border-t flex justify-center gap-8">
                <div className="flex items-center gap-4 text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest">
                    <ShieldCheck className="size-3.5 text-green-500" /> Secure Local Math
                </div>
            </CardFooter>
            </Card>
        </div>

        {/* RIGHT COLUMN: RESULTS & CHARTS */}
        <div className="lg:col-span-7 space-y-6">
            {stats && (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                    {/* 1. Main EMI Display */}
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-primary/20 relative group">
                        <div className="absolute top-0 right-0 size-80 bg-primary/5 blur-3xl rounded-full" />
                        <CardHeader className="bg-primary/5 p-4 border-b text-center shrink-0">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                            <TrendingUp className="size-3" /> MONTHLY PAYMENT SUMMARY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 space-y-10 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                                {/* Donut Chart */}
                                <div className="md:col-span-6 flex flex-col items-center">
                                    <div className="size-60 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={95}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    animationDuration={800}
                                                >
                                                    {stats.chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                                    formatter={(value: number) => formatCurrency(value)}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Monthly EMI</p>
                                            <p className="text-3xl font-black text-primary tracking-tighter leading-none">{formatCurrency(stats.emi)}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                        <div className="flex items-center gap-2 justify-center">
                                            <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                                            <span className="text-[9px] font-black uppercase opacity-60">Principal</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-center">
                                            <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                                            <span className="text-[9px] font-black uppercase opacity-60">Interest</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Stats Breakdown */}
                                <div className="md:col-span-6 space-y-6">
                                    <div className="p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20 text-center space-y-1 relative group overflow-hidden shadow-inner">
                                        <Sparkles className="absolute -top-1 -right-1 size-8 text-primary/10 group-hover:animate-pulse" />
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Interest</p>
                                        <p className="text-4xl font-black text-primary tracking-tighter leading-none">{formatCurrency(stats.totalInterest)}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <StatItem label="Loan Amount" value={formatCurrency(stats.principal)} icon={Landmark} />
                                        <StatItem label="Total Pay" value={formatCurrency(stats.totalPayment)} icon={Wallet} color="text-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Amortization Progress visualization */}
                            <div className="space-y-4 pt-10 border-t-2 border-dashed border-primary/10 text-left">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <PieIcon className="size-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Interest Payload Ratio</span>
                                    </div>
                                    <Badge className="bg-primary text-white font-black text-[10px]">
                                        {((stats.totalInterest / stats.totalPayment) * 100).toFixed(1)}% OF TOTAL
                                    </Badge>
                                </div>
                                <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border shadow-inner">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${(stats.principal / stats.totalPayment) * 100}%` }} 
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40 px-1">
                                    <span>Principal Borrowed</span>
                                    <span>Interest Accrued</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <HighlightStat icon={Zap} label="Inference Score" value={`${(stats.totalPayment / stats.principal).toFixed(2)}x`} color="text-yellow-500" />
                        <HighlightStat icon={ArrowUpRight} label="Yield Factor" value={`${rate}%`} color="text-emerald-500" />
                        <HighlightStat icon={Trophy} label="Status" value="Calculated" color="text-primary" />
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* BOTTOM SECTION: DEEP REPAYMENT SCHEDULE */}
      {stats && (
          <Card className="border-2 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 animate-in slide-in-from-bottom-6 duration-700">
              <CardHeader className="bg-muted/30 border-b p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-5">
                      <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl">
                          <TableIcon className="size-8" />
                      </div>
                      <div className="text-left">
                          <CardTitle className="text-2xl font-black uppercase tracking-tighter">Repayment Schedule</CardTitle>
                          <CardDescription className="text-xs font-bold uppercase opacity-60">Yearly Principal & Interest Breakdown</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="h-10 px-6 rounded-full border-2 font-black text-xs uppercase tracking-widest text-primary">
                    <CalendarCheck className="size-4 mr-2" /> {tenure} {tenureUnit.toUpperCase()} TERM
                  </Badge>
              </CardHeader>
              <CardContent className="p-0">
                  <ScrollArea className="w-full">
                      <Table>
                          <TableHeader className="bg-muted/50 border-b">
                              <TableRow className="hover:bg-transparent">
                                  <TableHead className="w-24 text-center font-black uppercase text-[10px] tracking-widest py-6">Year</TableHead>
                                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Principal (Paid)</TableHead>
                                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Interest (Paid)</TableHead>
                                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Annual Payment</TableHead>
                                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-8">Remaining Balance</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {stats.yearlyBreakdown.map((row) => {
                                  const progress = 100 - (row.remainingBalance / principal * 100);
                                  return (
                                    <TableRow key={row.year} className="group hover:bg-primary/5 transition-colors border-b">
                                        <TableCell className="text-center py-6">
                                            <div className="flex flex-col items-center">
                                                <span className="font-black text-lg">{row.year}</span>
                                                <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Year</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">{formatCurrency(row.principalPaid)}</p>
                                                <Progress value={(row.principalPaid / row.totalPaid) * 100} className="h-1 w-24 opacity-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold text-sm text-rose-500">{formatCurrency(row.interestPaid)}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-sm">{formatCurrency(row.totalPaid)}</p>
                                                <ArrowRight className="size-3 text-muted-foreground opacity-20 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="space-y-1.5 inline-block text-right">
                                                <p className="font-black text-primary text-base">{formatCurrency(row.remainingBalance)}</p>
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Cleared</span>
                                                    <span className="text-[10px] font-black text-emerald-600">{progress.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                  )
                              })}
                          </TableBody>
                      </Table>
                      <ScrollBar orientation="horizontal" />
                  </ScrollArea>
              </CardContent>
              <CardFooter className="bg-muted/10 p-8 border-t flex items-center justify-center gap-8">
                  <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-primary/10">
                          <Sparkles className="size-5 text-primary animate-pulse" />
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xl leading-relaxed">
                        This schedule uses professional-grade amortization logic. As the loan matures, the <span className="text-primary font-black">Principal</span> portion of your EMI increases while <span className="text-rose-500 font-black">Interest</span> decreases.
                      </p>
                  </div>
              </CardFooter>
          </Card>
      )}
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color = "text-primary" }: { label: string, value: string, icon: any, color?: string }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border shadow-sm space-y-2 group hover:border-primary/30 transition-all hover:-translate-y-0.5 text-left">
            <div className="flex items-center justify-between">
                <Icon className={cn("size-4 opacity-40 group-hover:opacity-100 transition-opacity", color)} />
                <Badge variant="outline" className="text-[8px] font-black border-none opacity-40 uppercase">Verified</Badge>
            </div>
            <div>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className={cn("text-sm font-black tracking-tight", color)}>{value}</p>
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
