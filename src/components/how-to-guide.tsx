
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Sparkles, Zap, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type StepDetail = {
  title: string;
  description: string;
  icon?: any;
};

type HowToGuideProps = {
  title: string;
  steps: (string | StepDetail)[];
};

export function HowToGuide({ title, steps }: HowToGuideProps) {
  const isRich = steps.length > 0 && typeof steps[0] !== 'string';

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 mb-24 px-4 no-print">
      <div className="flex flex-col items-center text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="size-3" /> Step-by-Step Masterclass
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
            How to use the <span className="text-gradient-hero">{title}</span>
        </h2>
        <p className="text-muted-foreground font-semibold max-w-2xl mx-auto text-sm uppercase opacity-60 tracking-widest">
            Follow our industrial-grade workflow for the best results.
        </p>
      </div>

      <div className={cn(
        "grid gap-6 md:gap-8",
        isRich ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
      )}>
        {steps.map((step, index) => {
          const content = typeof step === 'string' ? { title: `Step ${index + 1}`, description: step } : step;
          const Icon = content.icon || CheckCircle2;

          return (
            <Card key={index} className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] bg-card hover:-translate-y-2 shadow-xl hover:shadow-primary/10">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <Icon className="size-6" />
                    </div>
                    <span className="text-4xl font-black text-foreground/5 italic">0{index + 1}</span>
                </div>
                
                <div className="space-y-3">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors">{content.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                        {content.description}
                    </p>
                </div>

                <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                </div>
              </CardContent>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
            </Card>
          );
        })}
      </div>

      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-8 bg-muted/20 border-2 border-dashed rounded-[3rem] text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
        <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> SECURE LOCAL HANDSHAKE</div>
        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-500" /> NATIVE WASM SPEED</div>
        <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> STUDIO QUALITY RENDER</div>
      </div>
    </div>
  );
}
