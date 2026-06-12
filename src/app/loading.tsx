'use client';

import { Sparkles, Cpu, Zap, Box } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-700">
      {/* Subtle Background Ambiance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 size-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* COMPACT STUDIO BOX */}
        <div className="relative size-28 md:size-32 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-primary/30 rounded-[2rem] shadow-2xl overflow-hidden flex items-center justify-center group">
            
            {/* NEURAL SCANNING LINE EFFECT */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <div className="w-full h-1/2 bg-gradient-to-b from-primary/20 to-transparent -translate-y-full animate-[scanning_2s_infinite_ease-in-out]" />
                <div className="w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary),1)] -translate-y-full animate-[scanning_2s_infinite_ease-in-out]" />
            </div>

            {/* GR7 LOGO SIZED FOR BOX */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-6 relative z-0 opacity-90 scale-110">
                <text 
                    x="4" 
                    y="70" 
                    style={{ 
                        fill: '#0d5a71', 
                        fontSize: '44px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                    className="dark:fill-white"
                >
                    GR
                </text>
                <text 
                    x="62" 
                    y="75" 
                    style={{ 
                        fill: '#ef4444', 
                        fontSize: '66px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                >
                    7
                </text>
            </svg>

            {/* BOX CORNER ELEMENTS */}
            <div className="absolute top-3 left-3 size-1.5 bg-primary/20 rounded-full" />
            <div className="absolute top-3 right-3 size-1.5 bg-primary/20 rounded-full" />
            <div className="absolute bottom-3 left-3 size-1.5 bg-primary/20 rounded-full" />
            <div className="absolute bottom-3 right-3 size-1.5 bg-primary/20 rounded-full" />
        </div>
        
        {/* STATUS SECTION */}
        <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/50 shadow-sm">
                <Cpu className="size-3 text-primary animate-spin-slow" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/70">
                    Initializing Studio
                </p>
                <div className="flex gap-0.5">
                    <span className="size-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="size-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="size-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
            
            {/* MINI PROGRESS BAR */}
            <div className="w-32 h-0.5 bg-muted rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-primary w-full -translate-x-full animate-[progress-flow_1.5s_infinite_linear]" />
            </div>
        </div>

        {/* FLOATING PARTICLES (SUBTLE) */}
        <div className="absolute -top-10 -left-10 size-4 bg-primary/10 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-20 -right-12 size-3 bg-accent/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-12 left-1/2 size-2 bg-primary/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1.2s' }} />
      </div>

      <style jsx>{`
        @keyframes scanning {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(200%); }
        }
        @keyframes progress-flow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
