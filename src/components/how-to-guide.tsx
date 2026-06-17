'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
    Sparkles, 
    Zap, 
    ShieldCheck, 
    CheckCircle2, 
    FileDigit, 
    Settings2, 
    MonitorCheck, 
    UploadCloud, 
    BrainCircuit, 
    FileText, 
    Clipboard, 
    FileCode, 
    Monitor, 
    Download, 
    Layers, 
    SearchCode, 
    Scaling, 
    Maximize, 
    ScanLine, 
    Smartphone, 
    UserCircle, 
    Eraser, 
    ImageIcon, 
    PenLine, 
    Layout, 
    AlignCenter, 
    Hash, 
    PenTool, 
    Type, 
    Eye, 
    Landmark, 
    Map, 
    Gauge, 
    AreaChart, 
    Fuel, 
    Waves, 
    Activity, 
    Target, 
    Scissors, 
    Printer, 
    Merge, 
    Lock, 
    Heart, 
    FileStack, 
    ChevronRight, 
    Scan, 
    Key, 
    Unlock, 
    Palette, 
    ArrowLeftRight, 
    Wand2,
    Pipette,
    Contrast,
    ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  FileDigit, Settings2, MonitorCheck, UploadCloud, BrainCircuit, 
  FileText, Clipboard, FileCode, Monitor, Download, Layers, 
  SearchCode, Scaling, Maximize, ScanLine, Smartphone, 
  UserCircle, Eraser, ImageIcon, PenLine, Layout, AlignCenter, 
  Hash, PenTool, Type, Eye, Landmark, Map, Gauge, AreaChart, 
  Fuel, Waves, Activity, Target, Sparkles, Zap, ShieldCheck,
  Scissors, Printer, Merge, Lock, Heart, FileStack, Scan,
  Key, Unlock, Palette, ArrowLeftRight, Wand2, Pipette, Contrast, ArrowRightLeft
};

const STEP_COLORS = [
    { bg: "bg-[#0d9488]", border: "border-[#0d9488]", text: "text-white", line: "bg-[#2dd4bf]", iconBg: "bg-[#115e59]" }, // Teal
    { bg: "bg-[#7c3aed]", border: "border-[#7c3aed]", text: "text-white", line: "bg-[#a78bfa]", iconBg: "bg-[#5b21b6]" }, // Purple
    { bg: "bg-[#ea580c]", border: "border-[#ea580c]", text: "text-white", line: "bg-[#fb923c]", iconBg: "bg-[#9a3412]" }, // Orange
    { bg: "bg-[#2563eb]", border: "border-[#2563eb]", text: "text-white", line: "bg-[#60a5fa]", iconBg: "bg-[#1e40af]" }, // Blue
];

type StepDetail = {
  title: string;
  description: string;
  icon?: string;
};

type HowToGuideProps = {
  title: string;
  steps: (string | StepDetail)[];
};

export function HowToGuide({ title, steps }: HowToGuideProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-16 px-4 no-print">
      <div className="flex flex-col items-start text-left mb-12 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] shadow-sm mb-2">
            <Sparkles className="size-2.5" /> MASTER GUIDE
        </div>
        <h2 className="text-3xl md:text-5xl tracking-tight leading-none text-slate-800 dark:text-white">
            <span className="font-['Dancing_Script'] text-primary text-4xl md:text-6xl block mb-[-10px]">How to use the</span>
            <span className="font-jakarta font-black uppercase text-2xl md:text-4xl tracking-tighter text-gradient-hero">{title}</span>
        </h2>
        <p className="text-muted-foreground font-bold max-w-2xl text-[9px] uppercase opacity-40 tracking-widest pt-2">
            Follow our optimized workflow for industrial results.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {steps.map((step, index) => {
          const isObject = typeof step !== 'string';
          
          let titleText = "";
          let descText = "";
          let iconName = undefined;

          if (isObject) {
            const s = step as StepDetail;
            titleText = s.title;
            descText = s.description;
            iconName = s.icon;
          } else {
            const s = step as string;
            if (s.includes(':')) {
                const parts = s.split(':');
                titleText = parts[0];
                descText = parts.slice(1).join(':');
            } else {
                titleText = `Step 0${index + 1}`;
                descText = s;
            }
          }
          
          const Icon = (iconName && ICON_MAP[iconName]) || CheckCircle2;
          const colorSet = STEP_COLORS[index % STEP_COLORS.length];

          return (
            <div key={index} className="relative w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Speech Bubble Card Container */}
                <div className={cn(
                    "relative ml-10 md:ml-16 rounded-[2.5rem] p-6 md:p-8 md:pl-12 lg:pl-16 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-1",
                    colorSet.bg,
                    "after:content-[''] after:absolute after:top-1/2 after:-left-4 after:-translate-y-1/2 after:border-y-[15px] after:border-y-transparent after:border-r-[16px]",
                    index % STEP_COLORS.length === 0 ? "after:border-r-[#0d9488]" : 
                    index % STEP_COLORS.length === 1 ? "after:border-r-[#7c3aed]" : 
                    index % STEP_COLORS.length === 2 ? "after:border-r-[#ea580c]" : 
                    "after:border-r-[#2563eb]"
                )}>
                    
                    {/* Left Icon Area with Deep Shadow */}
                    <div className={cn(
                        "absolute -left-10 md:-left-16 top-1/2 -translate-y-1/2 size-20 md:size-28 rounded-full flex items-center justify-center shadow-[10px_10px_30px_rgba(0,0,0,0.4)] border-4 border-white/20 transition-transform duration-500 hover:scale-110",
                        colorSet.iconBg
                    )}>
                        <Icon className="size-8 md:size-12 text-white drop-shadow-[4px_4px_2px_rgba(0,0,0,0.5)]" />
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4 text-left">
                        <div className="space-y-2">
                            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white font-jakarta">
                                {titleText}
                            </h3>
                            <div className={cn("h-1 w-20 md:w-32 rounded-full opacity-80 shadow-sm", colorSet.line)} />
                        </div>
                        <p className="text-xs md:text-sm text-white/80 font-bold leading-relaxed uppercase tracking-wider">
                            {descText}
                        </p>
                    </div>

                    {/* Step Counter Label */}
                    <div className="absolute -top-3 -right-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/30">
                         <span className="text-[10px] font-black text-white/60 tracking-widest">STEP 0{index + 1}</span>
                    </div>
                </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-8 bg-muted/20 border-2 border-dashed rounded-[3rem] text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 shadow-inner">
        <div className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
        <div className="flex items-center gap-2.5"><Zap className="size-4 text-yellow-500" /> WASM SPEED</div>
        <div className="flex items-center gap-2.5"><Sparkles className="size-4 text-primary" /> HD RENDER</div>
      </div>
    </div>
  );
}
