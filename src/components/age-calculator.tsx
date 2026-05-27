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
        setIsCalendarOpen(false);
        calculateFullStats(date);
    }
  };

  const handleCalculate = () => {
    if (!dob) {
      toast({ variant: "destructive", title: "Select Birthday", description: "Please pick your birth date." });
      return;
    }
    calculateFullStats(dob);
  };

  const handleReset = () => {
    setDob(undefined);
    setStats(null);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 py-2 animate-in fade-in duration-700 mx-auto">
      
      {/* Left: Input Selection - More Compact */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="border-2 shadow-xl overflow-hidden glass-card rounded-[2rem]">
          <CardHeader className="bg-primary/5 border-b p-5">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <CalendarDays className="size-5" />
               </div>
               <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tighter leading-none">Your Birthday</CardTitle>
                  <CardDescription className="text-[9px] font-bold uppercase opacity-50">Select your date of birth</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70">DATE OF BIRTH</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-14 justify-start text-left font-black text-lg border-2 rounded-xl transition-all hover:border-primary",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                      {dob ? format(dob, "PPP") : <span>Pick Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2 shadow-2xl rounded-2xl overflow-hidden" align="start">
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

             <div className="p-4 bg-primary/5 rounded-xl border border-dashed border-primary/20 flex gap-3">
                <Zap className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-primary/70 leading-tight uppercase">
                  Stats update instantly as you select your date.
                </p>
             </div>
          </CardContent>
          <CardFooter className="p-5 bg-muted/10 border-t flex flex-col gap-3">
             <Button 
                onClick={handleCalculate} 
                className="w-full h-12 bg-primary text-sm font-black rounded-xl shadow-lg group"
             >
                <Calculator className="mr-2 h-4 w-4" /> 
                RE-CALCULATE
             </Button>
             {stats && (
               <Button variant="ghost" onClick={handleReset} className="w-full text-[9px] font-black uppercase tracking-widest text-destructive h-8">
                  <RefreshCcw className="mr-1.5 h-3 w-3" /> Reset
               </Button>
             )}
          </CardFooter>
        </Card>
      </div>

      {/* Right: Results Dashboard - Refined Typography */}
      <div className="lg:col-span-8 space-y-6">
        {!stats ? (
           <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center gap-6 opacity-30 min-h-[400px] rounded-[2.5rem] bg-muted/5">
              <div className="relative">
                 <div className="size-20 rounded-full border-2 border-dashed border-primary animate-spin-slow flex items-center justify-center" style={{ animationDuration: '10s' }}>
                    <CalendarDays className="size-8" />
                 </div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Waiting for Date</h3>
                 <p className="text-xs font-bold max-w-[200px] mx-auto opacity-60">Please pick your birthday on the left to see results.</p>
              </div>
           </Card>
        ) : (
           <div className="space-y-6 animate-in zoom-in-95 duration-500">
              
              {/* PRIMARY AGE: PROFESSIONAL SIZING */}
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 neon-border">
                 <CardHeader className="bg-primary/5 p-4 border-b text-center">
                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-2">
                       <Star className="size-3 fill-primary" /> YOUR EXACT AGE PROFILE
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 md:p-10 flex justify-center items-center gap-4 md:gap-12">
                    <div className="flex flex-col items-center gap-1 group">
                       <span className="text-5xl md:text-7xl font-black text-primary transition-transform group-hover:scale-105">{stats.primary.years}</span>
                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Years Old</span>
                    </div>
                    <Separator orientation="vertical" className="h-16 opacity-20" />
                    <div className="flex flex-col items-center gap-1 group">
                       <span className="text-5xl md:text-7xl font-black text-primary/80 transition-transform group-hover:scale-105">{stats.primary.months}</span>
                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Months</span>
                    </div>
                    <Separator orientation="vertical" className="h-16 opacity-20" />
                    <div className="flex flex-col items-center gap-1 group">
                       <span className="text-5xl md:text-7xl font-black text-primary/60 transition-transform group-hover:scale-105">{stats.primary.days}</span>
                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Days</span>
                    </div>
                 </CardContent>
              </Card>

              {/* NEXT BIRTHDAY - COMPACT BANNER */}
              <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                         <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shrink-0">
                            <Gift className="size-8" />
                         </div>
                         <div className="text-center md:text-left">
                            <h4 className="text-lg font-black uppercase tracking-tighter">Birthday Countdown</h4>
                            <p className="text-xs font-bold text-primary">
                               Next: <span className="bg-primary/10 px-2 py-0.5 rounded-full">{stats.nextBirthday.dayOfWeek}</span>
                            </p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-6 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border shadow-inner">
                         <div className="text-center">
                            <p className="text-2xl md:text-4xl font-black">{stats.nextBirthday.months}</p>
                            <p className="text-[8px] font-black uppercase opacity-40">Months</p>
                         </div>
                         <ChevronRight className="size-4 text-primary/20" />
                         <div className="text-center">
                            <p className="text-2xl md:text-4xl font-black">{stats.nextBirthday.days}</p>
                            <p className="text-[8px] font-black uppercase opacity-40">Days Left</p>
                         </div>
                      </div>
                  </CardContent>
              </Card>

              {/* TOTAL ANALYTICS - SMALLER CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <CompactStat icon={Activity} label="Months" value={stats.total.months.toLocaleString()} color="text-indigo-500" />
                  <CompactStat icon={CalendarDays} label="Weeks" value={stats.total.weeks.toLocaleString()} color="text-emerald-500" />
                  <CompactStat icon={Clock} label="Days" value={stats.total.days.toLocaleString()} color="text-rose-500" />
                  <CompactStat icon={Hourglass} label="Hours" value={stats.total.hours.toLocaleString()} color="text-amber-500" />
                  <CompactStat icon={Timer} label="Mins" value={stats.total.minutes.toLocaleString()} color="text-sky-500" />
                  <CompactStat icon={Zap} label="Secs" value={stats.total.seconds.toLocaleString()} color="text-purple-500" />
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

function CompactStat({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <Card className="border shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden bg-card/50">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={cn("size-8 rounded-lg bg-white dark:bg-slate-900 border shadow-sm flex items-center justify-center", color)}>
                    <Icon className="size-4" />
                </div>
                <div className="space-y-0.5 overflow-hidden w-full">
                    <p className="text-[8px] font-black uppercase text-muted-foreground opacity-50 truncate">{label}</p>
                    <p className="text-sm font-black tracking-tight truncate">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
