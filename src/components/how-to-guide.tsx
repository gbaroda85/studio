
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
    Scan
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon Map to fix serialization error
const ICON_MAP: Record<string, any> = {
  FileDigit, Settings2, MonitorCheck, UploadCloud, BrainCircuit, 
  FileText, Clipboard, FileCode, Monitor, Download, Layers, 
  SearchCode, Scaling, Maximize, ScanLine, Smartphone, 
  UserCircle, Eraser, ImageIcon, PenLine, Layout, AlignCenter, 
  Hash, PenTool, Type, Eye, Landmark, Map, Gauge, AreaChart, 
  Fuel, Waves, Activity, Target, Sparkles, Zap, ShieldCheck,
  Scissors, Printer, Merge, Lock, Heart, FileStack, Scan
};

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
    <div className="w-full max-w-7xl mx-auto mt-20 mb-24 px-4 no-print">
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="size-3" /> Step-by-Step Masterclass
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight text-slate-800 dark:text-white">
            How to use the <span className="text-gradient-hero">{title}</span>
        </h2>
        <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-sm uppercase opacity-60 tracking-widest">
            Follow our industrial-grade workflow for the best results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {steps.map((step, index) => {
          const isObject = typeof step !== 'string';
          const titleText = isObject ? (step as StepDetail).title : (step as string).split(':')[0] || `Step ${index + 1}`;
          const descText = isObject ? (step as StepDetail).description : (step as string).split(':')[1] || (step as string);
          const iconName = isObject ? (step as StepDetail).icon : undefined;
          
          const Icon = (iconName && ICON_MAP[iconName]) || CheckCircle2;

          return (
            <Card key={index} className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] bg-card hover:-translate-y-1 shadow-xl hover:shadow-primary/10">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-row gap-6 md:gap-8 items-center text-left">
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="size-16 md:size-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-primary/20">
                            <Icon className="size-8 md:size-12" />
                        </div>
                        <div className="bg-primary/5 px-3 py-0.5 rounded-full border border-primary/10">
                           <span className="text-[10px] font-black text-primary uppercase">STEP 0{index + 1}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors">{titleText}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-bold uppercase opacity-80 line-clamp-3">
                            {descText}
                        </p>
                        <div className="pt-2 flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Studio Logic Active <ChevronRight className="size-3" />
                        </div>
                    </div>
                </div>
              </CardContent>
              <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
            </Card>
          );
        })}
      </div>

      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-10 bg-muted/20 border-2 border-dashed rounded-[3rem] text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 shadow-inner">
        <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-green-500" /> SECURE LOCAL HANDSHAKE</div>
        <div className="flex items-center gap-2"><Zap className="size-5 text-yellow-500" /> NATIVE WASM SPEED</div>
        <div className="flex items-center gap-2"><Sparkles className="size-5 text-primary" /> STUDIO QUALITY RENDER</div>
      </div>
    </div>
  );
}
