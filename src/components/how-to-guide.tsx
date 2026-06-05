
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
    Wand2
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
  Key, Unlock, Palette, ArrowLeftRight, Wand2
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
    <div className="w-full max-w-6xl mx-auto mt-12 mb-16 px-4 no-print">
      <div className="flex flex-col items-center text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="size-2.5" /> MASTER GUIDE
        </div>
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none text-slate-800 dark:text-white font-jakarta">
            How to use the <span className="text-gradient-hero">{title}</span>
        </h2>
        <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-[10px] uppercase opacity-60 tracking-widest">
            Follow our optimized workflow for industrial results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
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

          return (
            <Card key={index} className="group relative overflow-hidden border-2 border-border/40 hover:border-primary/40 transition-all duration-300 rounded-[2rem] bg-card hover:-translate-y-0.5 shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex gap-5 md:gap-8 items-start">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="size-12 md:size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-primary/10">
                            <Icon className="size-6 md:size-8" />
                        </div>
                        <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">0{index + 1}</span>
                    </div>
                    
                    <div className="space-y-1.5 flex-1 pt-1">
                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors font-jakarta">{titleText}</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-70 tracking-wide">
                            {descText}
                        </p>
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-8 bg-muted/20 border-2 border-dashed rounded-[2.5rem] text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 shadow-inner">
        <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE RAM</div>
        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> WASM SPEED</div>
        <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> HD RENDER</div>
      </div>
    </div>
  );
}
