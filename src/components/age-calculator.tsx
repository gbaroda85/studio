"use client";

import { useState, useCallback } from "react";
import { 
  format, 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  addYears, 
  addMonths, 
  differenceInCalendarDays,
  differenceInWeeks,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  isFuture
} from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Calculator, 
  Gift, 
  Clock, 
  Activity, 
  CalendarDays, 
  Hourglass,
  Timer,
  RefreshCcw,
  Star,
  PartyPopper,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface AgeStats {
  primary: {
    years: number;
    months: number;
    days: number;
  };
  total: {
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  nextBirthday: {
    months: number;
    days: number;
    dayOfWeek: string;
    totalDaysLeft: number;
  };
}

export default function AgeCalculator() {
  const [dob, setDob] = useState<Date>();
  const [stats, setStats] = useState<AgeStats | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();

  const calculateFullStats = (birthDate: Date) => {
    const now = new Date();

    // 1. Primary Age Calculation
    const years = differenceInYears(now, birthDate);
    const dateWithYears = addYears(birthDate, years);
    const months = differenceInMonths(now, dateWithYears);
    const dateWithMonths = addMonths(dateWithYears, months);
    const days = differenceInDays(now, dateWithMonths);

    // 2. Next Birthday Logic
    let nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (now > nextBirthday) {
      nextBirthday = new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }
    const totalDaysLeft = differenceInCalendarDays(nextBirthday, now);
    
    // Detailed countdown for next birthday
    const nextBdayMonths = differenceInMonths(nextBirthday, now);
    const nextBdayDateWithMonths = addMonths(now, nextBdayMonths);
    const nextBdayDays = differenceInDays(nextBirthday, nextBdayDateWithMonths);

    setStats({
      primary: { years, months, days },
      total: {
        months: differenceInMonths(now, birthDate),
        weeks: differenceInWeeks(now, birthDate),
        days: differenceInDays(now, birthDate),
        hours: differenceInHours(now, birthDate),
        minutes: differenceInMinutes(now, birthDate),
        seconds: differenceInSeconds(now, birthDate),
      },
      nextBirthday: {
        months: nextBdayMonths,
        days: nextBdayDays,
        dayOfWeek: format(nextBirthday, "EEEE"),
        totalDaysLeft
      }
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
        setDob(date);
        setIsCalendarOpen(false); // Auto-close on selection
        calculateFullStats(date);
    }
  };

  const handleCalculate = () => {
    if (!dob) {
      toast({ variant: "destructive", title: "Select Birthday", description: "Please pick your birth date from the calendar." });
      return;
    }
    calculateFullStats(dob);
  };

  const handleReset = () => {
    setDob(undefined);
    setStats(null);
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-4 md:py-8 animate-in fade-in duration-700">
      
      {/* Left: Input Selection Dashboard */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="border-2 shadow-2xl overflow-hidden glass-card rounded-[2.5rem]">
          <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                  <CalendarDays className="size-6" />
               </div>
               <div>
                  <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Your Birthday</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase opacity-60">Pick your birth date to start</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8">
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70 px-1">SELECT DATE OF BIRTH</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-16 md:h-20 justify-start text-left font-black text-xl md:text-2xl border-2 rounded-2xl transition-all hover:border-primary hover:shadow-xl px-6 md:px-8",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-4 h-7 w-7 text-primary" />
                      {dob ? format(dob, "PPP") : <span>Select Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2 shadow-3xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950" align="start" sideOffset={10}>
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={handleDateSelect}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      initialFocus
                      disabled={(date) => isFuture(date)}
                    />
                  </PopoverContent>
                </Popover>
             </div>

             <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-dashed border-primary/20 flex gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="size-5 text-primary" />
                </div>
                <p className="text-[10px] md:text-[11px] font-bold text-primary/80 leading-relaxed uppercase">
                  <strong>Dashboard Sync:</strong> Stats update instantly as you select your date. No need to click calculate!
                </p>
             </div>
          </CardContent>
          <CardFooter className="p-6 md:p-10 bg-muted/10 border-t flex flex-col gap-4">
             <Button 
                onClick={handleCalculate} 
                className="w-full h-16 bg-primary text-lg font-black rounded-2xl shadow-xl transition-all active:scale-95 group hover:scale-[1.02]"
             >
                <Calculator className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" /> 
                REFRESH ANALYTICS
             </Button>
             {stats && (
               <Button variant="ghost" onClick={handleReset} className="w-full text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 h-12 rounded-xl">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Reset Everything
               </Button>
             )}
          </CardFooter>
        </Card>
        
        <div className="flex flex-col gap-3 px-4">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">
              <ShieldCheck className="size-3.5 text-green-500" /> SECURE BROWSER PROCESSING
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">
              <Info className="size-3.5 text-blue-500" /> LEAP YEAR CALIBRATED
           </div>
        </div>
      </div>

      {/* Right: Results Dashboard */}
      <div className="lg:col-span-8 space-y-6 md:space-y-8">
        {!stats ? (
           <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center gap-8 opacity-20 min-h-[500px] md:min-h-[600px] rounded-[3rem] bg-muted/5">
              <div className="relative">
                 <div className="size-32 rounded-full border-4 border-dashed border-primary animate-spin-slow flex items-center justify-center" style={{ animationDuration: '10s' }}>
                    <CalendarDays className="size-16" />
                 </div>
                 <Star className="absolute -top-2 -right-2 text-primary animate-bounce size-8" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Analytics Pending</h3>
                 <p className="text-base font-bold max-w-xs mx-auto">Select your birth date on the left to unlock your life metrics dashboard.</p>
              </div>
           </Card>
        ) : (
           <div className="space-y-6 md:space-y-10 animate-in zoom-in-95 duration-500">
              
              {/* PRIMARY AGE: THE BIG STATS */}
              <Card className="border-none shadow-2xl rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-white dark:bg-slate-900 neon-border">
                 <CardHeader className="bg-primary/5 p-6 md:p-8 border-b text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
                    <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-3 relative z-10">
                       <Star className="size-3.5 fill-primary" /> YOUR EXACT AGE PROFILE
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 md:p-20 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-20">
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                       <span className="text-7xl md:text-9xl font-black text-primary drop-shadow-2xl transition-transform group-hover:scale-110">{stats.primary.years}</span>
                       <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] opacity-40">Years Old</span>
                    </div>
                    <Separator orientation="vertical" className="hidden md:block h-32 opacity-20" />
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                       <span className="text-7xl md:text-9xl font-black text-primary/80 drop-shadow-2xl transition-transform group-hover:scale-110">{stats.primary.months}</span>
                       <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] opacity-40">Months</span>
                    </div>
                    <Separator orientation="vertical" className="hidden md:block h-32 opacity-20" />
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                       <span className="text-7xl md:text-9xl font-black text-primary/60 drop-shadow-2xl transition-transform group-hover:scale-110">{stats.primary.days}</span>
                       <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] opacity-40">Days</span>
                    </div>
                 </CardContent>
              </Card>

              {/* NEXT BIRTHDAY BANNER */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-primary to-blue-500 rounded-[2.5rem] md:rounded-[3rem] blur-xl opacity-10 group-hover:opacity-25 transition-opacity" />
                <Card className="relative border-none shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
                    <CardContent className="p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8 text-center md:text-left">
                           <div className="size-20 md:size-28 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl relative shrink-0 group-hover:rotate-6 transition-transform">
                              <Gift className="size-10 md:size-14" />
                              <div className="absolute -top-3 -right-3 bg-yellow-400 text-black size-10 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                 <PartyPopper className="size-6" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Birthday Countdown</h4>
                              <p className="text-base md:text-lg font-bold text-primary flex items-center justify-center md:justify-start gap-2">
                                 Falls on a <span className="bg-primary/10 px-3 py-1 rounded-full">{stats.nextBirthday.dayOfWeek}</span>
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-8 md:gap-12 bg-white/50 dark:bg-black/20 p-6 md:p-8 rounded-[2rem] border shadow-inner">
                           <div className="text-center space-y-1">
                              <p className="text-4xl md:text-6xl font-black text-foreground">{stats.nextBirthday.months}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Months</p>
                           </div>
                           <ChevronRight className="size-8 text-primary/20" />
                           <div className="text-center space-y-1">
                              <p className="text-4xl md:text-6xl font-black text-foreground">{stats.nextBirthday.days}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Days Left</p>
                           </div>
                        </div>
                    </CardContent>
                </Card>
              </div>

              {/* TOTAL ANALYTICS GRID */}
              <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Activity className="size-4" /></div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Lifetime Analytics</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                      <StatCard icon={Activity} label="Total Months" value={stats.total.months.toLocaleString()} color="text-indigo-500" />
                      <StatCard icon={CalendarDays} label="Total Weeks" value={stats.total.weeks.toLocaleString()} color="text-emerald-500" />
                      <StatCard icon={Clock} label="Total Days" value={stats.total.days.toLocaleString()} color="text-rose-500" />
                      <StatCard icon={Hourglass} label="Total Hours" value={stats.total.hours.toLocaleString()} color="text-amber-500" />
                      <StatCard icon={Timer} label="Total Minutes" value={stats.total.minutes.toLocaleString()} color="text-sky-500" />
                      <StatCard icon={Zap} label="Total Seconds" value={stats.total.seconds.toLocaleString()} color="text-purple-500" />
                  </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <Card className="border-2 shadow-xl hover:shadow-2xl transition-all rounded-[2rem] overflow-hidden group hover:-translate-y-2 bg-card/50">
            <CardContent className="p-6 md:p-10 flex flex-col items-center text-center gap-5">
                <div className={cn("size-12 md:size-16 rounded-2xl bg-white dark:bg-slate-900 border shadow-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3", color)}>
                    <Icon className="size-6 md:size-8" />
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{label}</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
