'use client';

import { Cpu, Sparkles } from 'lucide-react';

/**
 * @fileOverview High-performance loading screen optimized for GPU.
 * Uses transform-gpu and scale3d to prevent CPU repaints during page transitions.
 */

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-300 transform-gpu">
      {/* Subtle Background Ambiance - Using translate3d for absolute zero lag */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 size-64 bg-primary/20 rounded-full blur-[100px] animate-pulse transform-gpu translate3d-0" />
        <div className="absolute bottom-1/4 right-1/4 size-64 bg-accent/20 rounded-full blur-[100px] animate-pulse transform-gpu translate3d-0" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center transform-gpu">
        {/* COMPACT STUDIO BOX - NEURAL STYLE */}
        <div className="relative size-24 md:size-28 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-primary/30 rounded-[2.5rem] shadow-2xl flex items-center justify-center group overflow-hidden animate-breathing transform-gpu">
            
            {/* SOFT PULSING BACKGLOW */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse transform-gpu" />
            
            {/* GR7 LOGO - CLEAN SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-5 relative z-10 opacity-95 scale-110 transform-gpu">
                <text 
                    x="8" 
                    y="70" 
                    stroke="none"
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
                    x="64" 
                    y="74" 
                    stroke="none"
                    style={{ 
                        fill: '#ef4444', 
                        fontSize: '64px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                >
                    7
                </text>
            </svg>

            {/* DECORATIVE CORNER ACCENTS */}
            <div className="absolute top-4 left-4 size-1 bg-primary/30 rounded-full transform-gpu" />
            <div className="absolute top-4 right-4 size-1 bg-primary/30 rounded-full transform-gpu" />
            <div className="absolute bottom-4 left-4 size-1 bg-primary/30 rounded-full transform-gpu" />
            <div className="absolute bottom-4 right-4 size-1 bg-primary/30 rounded-full transform-gpu" />
        </div>
        
        {/* STATUS SECTION */}
        <div className="mt-8 flex flex-col items-center gap-4 transform-gpu">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-muted/50 border border-border/50 shadow-sm transform-gpu">
                <Cpu className="size-3 text-primary animate-spin-slow" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/70">
                    Initializing Studio
                </p>
            </div>
            
            {/* MINIMAL PROGRESS TRACK */}
            <div className="w-24 h-0.5 bg-muted rounded-full overflow-hidden relative border border-border/10">
                <div className="absolute inset-0 bg-primary w-full -translate-x-full animate-progress-flow transform-gpu" />
            </div>
        </div>

        {/* FLOATING SPARKLE PARTICLES */}
        <div className="absolute -top-6 -left-6 opacity-30">
            <Sparkles className="size-4 text-primary animate-pulse transform-gpu" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-flow {
            0% { transform: translateX(-100%) translateZ(0); }
            100% { transform: translateX(100%) translateZ(0); }
        }
        .animate-progress-flow {
            animation: progress-flow 1.5s infinite linear;
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        .animate-breathing {
            animation: breathing 2s ease-in-out infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg) translateZ(0); }
            to { transform: rotate(360deg) translateZ(0); }
        }
        @keyframes breathing {
            0%, 100% { transform: scale3d(1, 1, 1); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2); }
            50% { transform: scale3d(1.04, 1.04, 1); box-shadow: 0 0 25px rgba(var(--primary), 0.15); }
        }
        .translate3d-0 {
            transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  );
}
