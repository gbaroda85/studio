'use client';

import { Cpu, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-700">
      {/* Subtle Background Ambiance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 size-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* COMPACT STUDIO BOX - GLOWING STYLE */}
        <div className="relative size-28 md:size-32 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-primary/30 rounded-[2.5rem] shadow-2xl flex items-center justify-center group overflow-hidden animate-breathing">
            
            {/* SOFT PULSING BACKGLOW */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse" />
            
            {/* GR7 LOGO - CLEAN SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-6 relative z-10 opacity-90 scale-110 drop-shadow-sm">
                <text 
                    x="4" 
                    y="72" 
                    stroke="none"
                    style={{ 
                        fill: '#0d5a71', 
                        fontSize: '46px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                    className="dark:fill-white"
                >
                    GR
                </text>
                <text 
                    x="62" 
                    y="76" 
                    stroke="none"
                    style={{ 
                        fill: '#ef4444', 
                        fontSize: '68px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                >
                    7
                </text>
            </svg>

            {/* DECORATIVE CORNER ACCENTS */}
            <div className="absolute top-4 left-4 size-1 bg-primary/20 rounded-full" />
            <div className="absolute top-4 right-4 size-1 bg-primary/20 rounded-full" />
            <div className="absolute bottom-4 left-4 size-1 bg-primary/20 rounded-full" />
            <div className="absolute bottom-4 right-4 size-1 bg-primary/20 rounded-full" />
        </div>
        
        {/* STATUS SECTION */}
        <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-muted/50 border border-border/50 shadow-sm">
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
            
            {/* MINIMAL PROGRESS TRACK */}
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden relative border border-border/10 shadow-inner">
                <div className="absolute inset-0 bg-primary w-full -translate-x-full animate-progress-flow" />
            </div>
        </div>

        {/* FLOATING SPARKLE PARTICLES */}
        <div className="absolute -top-6 -left-6 opacity-30">
            <Sparkles className="size-4 text-primary animate-pulse" />
        </div>
        <div className="absolute top-20 -right-8 opacity-20" style={{ animationDelay: '0.8s' }}>
            <Sparkles className="size-3 text-accent animate-pulse" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-flow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-progress-flow {
            animation: progress-flow 2s infinite linear;
        }
        .animate-spin-slow {
            animation: spin 4s linear infinite;
        }
        .animate-breathing {
            animation: breathing 3s ease-in-out infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes breathing {
            0%, 100% { transform: scale(1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
            50% { transform: scale(1.03); box-shadow: 0 0 30px rgba(var(--primary), 0.15); }
        }
      `}</style>
    </div>
  );
}
