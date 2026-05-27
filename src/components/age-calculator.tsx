"use client";

import { useState, useMemo, useEffect } from "react";
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
  isFuture,
  isToday
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
  ChevronRight,
  RefreshCcw,
  Star,
  PartyPopper,
  ShieldCheck,
  Zap,
  Info
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
    const nextBdayYears = differenceInYears(nextBirthday, now);
    const nextBdayMonths = differenceInMonths(nextBirthday, now);
    const nextBdayDateWithMonths = addMonths(now, nextBdayMonths);
    const nextBdayDays = differenceInDays(nextBirthday, nextBdayDateWithMonths);

    // 3. Analytics
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

  const handleCalculate = () => {
    if (!dob) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please select your date of birth." });
      return;
    }
    if (isFuture(dob)) {
      toast({ variant: "destructive", title: "Invalid Date", description: "Birth date cannot be in the future." });
      return;
    }
    calculateFullStats(dob);
  };

  const handleReset = () => {
    setDob(undefined);
    setStats(null);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-8 animate-in fade-in duration-700">
      
      {/* Left: Input Selection */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="border-2 shadow-2xl overflow-hidden glass-card">
          <CardHeader className="bg-primary/5 border-b p-6">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                  <CalendarDays className="size-5" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Birthday</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase opacity-60">Pick your birth date</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">SELECT DATE OF BIRTH</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-16 justify-start text-left font-black text-lg md:text-xl border-2 rounded-2xl transition-all hover:border-primary px-6",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                      {dob ? format(dob, "PPP") : <span>Select Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2 shadow-3xl rounded-2xl overflow-hidden" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      initialFocus
                      disabled={(date) => isFuture(date)}
                    />
                  </PopoverContent>
                </Popover>
             </div>

             <div className="p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex gap-4">
                <Info className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-primary/80 leading-relaxed uppercase">
                  <strong>Math Accuracy:</strong> We account for Leap years and actual days in every month for exact precision.
                </p>
             </div>
          </CardContent>
          <CardFooter className="p-6 bg-muted/10 border-t flex flex-col gap-3">
             <Button 
                onClick={handleCalculate} 
                className="w-full h-14 md:h-16 bg-primary text-lg font-black rounded-xl shadow-xl transition-all active:scale-95 group"
             >
                <Calculator className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" /> 
                CALCULATE AGE
             </Button>
             {stats && (
               <Button variant="ghost" onClick={handleReset} className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground h-10">
                  <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Reset
               </Button>
             )}
          </CardFooter>
        </Card>
        
        <div className="hidden lg:flex flex-col gap-4">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">
              <ShieldCheck className="size-3 text-green-500" /> SECURE LOCAL MATH
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">
              <Zap className="size-3 text-yellow-500" /> INSTANT BREAKDOWN
           </div>
        </div>
      </div>

      {/* Right: Results Dashboard */}
      <div className="lg:col-span-8 space-y-6">
        {!stats ? (
           <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center gap-6 opacity-30 min-h-[500px] rounded-[3rem]">
              <div className="relative">
                 <CalendarDays className="size-20" />
                 <Star className="absolute -top-2 -right-2 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                 <p className="text-2xl font-black uppercase tracking-tighter">Enter Your Birth Date</p>
                 <p className="text-sm font-medium">To see your detailed life analytics and countdown.</p>
              </div>
           </Card>
        ) : (
           <div className="space-y-6 animate-in zoom-in-95 duration-500">
              
              {/* PRIMARY AGE: THE BIG STATS */}
              <Card className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
                 <CardHeader className="bg-primary/5 p-6 border-b text-center">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center justify-center gap-2">
                       <Star className="size-3 fill-primary" /> Current Exact Age
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 md:p-14 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-6xl md:text-8xl font-black text-primary drop-shadow-xl">{stats.primary.years}</span>
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60">Years</span>
                    </div>
                    <Separator orientation="vertical" className="hidden md:block h-20 opacity-20" />
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-6xl md:text-8xl font-black text-primary/80 drop-shadow-xl">{stats.primary.months}</span>
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60">Months</span>
                    </div>
                    <Separator orientation="vertical" className="hidden md:block h-20 opacity-20" />
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-6xl md:text-8xl font-black text-primary/60 drop-shadow-xl">{stats.primary.days}</span>
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60">Days</span>
                    </div>
                 </CardContent>
              </Card>

              {/* NEXT BIRTHDAY BANNER */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-primary to-blue-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition-opacity" />
                <Card className="relative border-none shadow-xl rounded-[2rem] bg-gradient-to-r from-primary/10 via-primary/5 to-background overflow-hidden">
                    <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="size-14 md:size-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl relative">
                              <Gift className="size-8 md:size-10" />
                              <PartyPopper className="absolute -top-2 -right-2 text-yellow-400 size-6" />
                           </div>
                           <div className="text-center md:text-left">
                              <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter">Your Next Birthday</h4>
                              <p className="text-sm font-bold text-primary flex items-center justify-center md:justify-start gap-1.5 mt-1">
                                 It falls on a <span className="underline decoration-2 underline-offset-4">{stats.nextBirthday.dayOfWeek}</span>
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-center md:text-right">
                           <div className="space-y-0.5">
                              <p className="text-3xl md:text-5xl font-black text-foreground">{stats.nextBirthday.months}</p>
                              <p className="text-[9px] font-black uppercase opacity-40">Months</p>
                           </div>
                           <span className="text-2xl font-black text-primary/20">+</span>
                           <div className="space-y-0.5">
                              <p className="text-3xl md:text-5xl font-black text-foreground">{stats.nextBirthday.days}</p>
                              <p className="text-[9px] font-black uppercase opacity-40">Days left</p>
                           </div>
                        </div>
                    </CardContent>
                </Card>
              </div>

              {/* TOTAL ANALYTICS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <StatCard icon={Activity} label="Total Months" value={stats.total.months.toLocaleString()} color="text-indigo-500" />
                  <StatCard icon={CalendarDays} label="Total Weeks" value={stats.total.weeks.toLocaleString()} color="text-emerald-500" />
                  <StatCard icon={Clock} label="Total Days" value={stats.total.days.toLocaleString()} color="text-rose-500" />
                  <StatCard icon={Hourglass} label="Total Hours" value={stats.total.hours.toLocaleString()} color="text-amber-500" />
                  <StatCard icon={Timer} label="Total Minutes" value={stats.total.minutes.toLocaleString()} color="text-sky-500" />
                  <StatCard icon={Zap} label="Total Seconds" value={stats.total.seconds.toLocaleString()} color="text-purple-500" />
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <Card className="border-2 shadow-lg hover:shadow-2xl transition-all rounded-3xl overflow-hidden group hover:-translate-y-1">
            <CardContent className="p-5 md:p-8 flex flex-col items-center text-center gap-4">
                <div className={cn("size-10 md:size-12 rounded-2xl bg-muted/50 flex items-center justify-center transition-all group-hover:scale-110", color)}>
                    <Icon className="size-5 md:size-6" />
                </div>
                <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{label}</p>
                    <p className="text-xl md:text-2xl font-black tracking-tighter">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
