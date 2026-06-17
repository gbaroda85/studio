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
    RotateCw,
    Plus,
    Building2,
    User2,
    ListFilter,
    Gift,
    Clock,
    Hourglass,
    Timer,
    RotateCcw,
    MousePointer2
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
  Key, Unlock, Palette, ArrowLeftRight, Wand2, Pipette, Contrast,
  RotateCw, Plus, Building2, User2, ListFilter, Gift, Clock, Hourglass, Timer, RotateCcw
};

const STEP_COLORS = [
    { 
      bg: "bg-[#0d9488]", 
      border: "border-[#0d9488]", 
      text: "text-white", 
      line: "bg-[#2dd4bf]", 
      iconGradient: "bg-gradient-to-br from-[#14b8a6] to-[#0d9488]",
      innerShadow: "shadow-[inset_4px_4px_8px_rgba(255,255,255,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2),0_15px_35px_rgba(0,0,0,0.3)]"
    },
    { 
      bg: "bg-[#7c3aed]", 
      border: "border-[#7c3aed]", 
      text: "text-white", 
      line: "bg-[#a78bfa]", 
      iconGradient: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]",
      innerShadow: "shadow-[inset_4px_4px_8px_rgba(255,255,255,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2),0_15px_35px_rgba(0,0,0,0.3)]"
    },
    { 
      bg: "bg-[#ea580c]", 
      border: "border-[#ea580c]", 
      text: "text-white", 
      line: "bg-[#fb923c]", 
      iconGradient: "bg-gradient-to-br from-[#f97316] to-[#ea580c]",
      innerShadow: "shadow-[inset_4px_4px_8px_rgba(255,255,255,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2),0_15px_35px_rgba(0,0,0,0.3)]"
    },
    { 
      bg: "bg-[#2563eb]", 
      border: "border-[#2563eb]", 
      text: "text-white", 
      line: "bg-[#60a5fa]", 
      iconGradient: "bg-gradient-to-br from-[#3b82f6] to-[#2563eb]",
      innerShadow: "shadow-[inset_4px_4px_8px_rgba(255,255,255,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2),0_15px_35px_rgba(0,0,0,0.3)]"
    },
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
  const isOddCount = steps.length % 2 !== 0;

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-12 mb-16 px-4 no-print">
      <div className="flex flex-col items-start text-left mb-16 space-y-1">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
        {steps.map((step, index) => {
          const isObject = typeof step !== 'string';
          const isLastItem = index === steps.length - 1;
          const shouldCenter = isLastItem && isOddCount;
          
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
          
          const Icon = (iconName && ICON_MAP[iconName]) || 
                       (titleText.toLowerCase().includes('upload') ? UploadCloud : 
                        titleText.toLowerCase().includes('select') ? MousePointer2 :
                        titleText.toLowerCase().includes('format') ? Layers :
                        titleText.toLowerCase().includes('save') || titleText.toLowerCase().includes('download') ? Download :
                        CheckCircle2);

          const colorSet = STEP_COLORS[index % STEP_COLORS.length];

          return (
            <div 
                key={index} 
                className={cn(
                    "relative w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
                    shouldCenter && "md:col-span-2 flex justify-center"
                )} 
                style={{ animationDelay: `${index * 100}ms` }}
            >
                {/* Cleaned Card Container - Reduced Height and Removed Triangle Pointer */}
                <div className={cn(
                    "relative ml-10 md:ml-12 lg:ml-16 rounded-[2.5rem] py-4 md:py-5 px-6 md:px-8 md:pl-20 lg:pl-24 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-1 h-full flex flex-col justify-center",
                    colorSet.bg,
                    shouldCenter && "md:max-w-[650px] w-full"
                )}>
                    
                    {/* Left Icon Area with Premium 3D Look */}
                    <div className={cn(
                        "absolute -left-10 md:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 size-20 md:size-24 lg:size-28 rounded-[2rem] flex items-center justify-center border-[6px] border-white/20 transition-transform duration-500 hover:scale-110 transform-gpu",
                        colorSet.iconGradient,
                        colorSet.innerShadow
                    )}>
                        <Icon className="size-8 md:size-10 lg:size-12 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)]" />
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4 text-left">
                        <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white font-jakarta">
                                {titleText}
                            </h3>
                            <div className={cn("h-1 w-20 md:w-32 rounded-full opacity-80 shadow-sm", colorSet.line)} />
                        </div>
                        <p className="text-xs md:sm text-white/80 font-bold leading-relaxed uppercase tracking-wider">
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

      <div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-8 bg-muted/20 border-2 border-dashed rounded-[3rem] text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 shadow-inner">
        <div className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
        <div className="flex items-center gap-2.5"><Zap className="size-4 text-yellow-500" /> WASM SPEED</div>
        <div className="flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> HD RENDER</div>
      </div>
    </div>
  );
}
