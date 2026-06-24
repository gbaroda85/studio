'use client';

import { Cpu, Sparkles } from 'lucide-react';

/**
 * @fileOverview High-performance loading screen optimized for GPU.
 * Uses transform-gpu and scale3d to prevent CPU repaints during page transitions.
 * Set to a solid background opacity to ensure layout flashes are hidden.
 */

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-background backdrop-blur-xl animate-in fade-in duration-300 transform-gpu">
      {/* Subtle Background Ambiance - Using translate3d for absolute zero lag */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 size-96 bg-primary/20 rounded-full blur-[120px] animate-pulse transform-gpu translate3d-0" />
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-accent/20 rounded-full blur-[120px] animate-pulse transform-gpu translate3d-0" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center transform-gpu">
        {/* COMPACT STUDIO BOX - NEURAL STYLE */}
        <div className="relative size-28 md:size-32 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-primary/30 rounded-[2.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] flex items-center justify-center group overflow-hidden animate-breathing transform-gpu">
            
            {/* SOFT PULSING BACKGLOW */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse transform-gpu" />
            
            {/* GR7 LOGO - CLEAN SVG */}
            <svg viewBox="0 0 1000 1000" className="w-full h-full p-5 relative z-10 opacity-95 scale-110 transform-gpu">
                <text 
                    x="80" 
                    y="720" 
                    stroke="none"
                    style={{ 
                        fill: '#0d5a71', 
                        fontSize: '440px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                    className="dark:fill-white"
                >
                    GR
                </text>
                <text 
                    x="620" 
                    y="740" 
                    stroke="none"
                    style={{ 
                        fill: '#ef4444', 
                        fontSize: '640px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
                >
                    7
                </text>
            </svg>

            {/* DECORATIVE CORNER ACCENTS */}
            <div className="absolute top-4 left-4 size-1.5 bg-primary/30 rounded-full transform-gpu" />
            <div className="absolute top-4 right-4 size-1.5 bg-primary/30 rounded-full transform-gpu" />
            <div className="absolute bottom-4 left-4 size-1.5 bg-primary/30 rounded-full transform-gpu" />
            <div className="absolute bottom-4 right-4 size-1.5 bg-primary/30 rounded-full transform-gpu" />
        </div>
        
        {/* STATUS SECTION */}
        <div className="mt-10 flex flex-col items-center gap-4 transform-gpu">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-muted/80 border border-border/50 shadow-sm backdrop-blur-md transform-gpu">
                <Cpu className="size-3.5 text-primary animate-spin-slow" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80">
                    Initializing Studio
                </p>
            </div>
            
            {/* MINIMAL PROGRESS TRACK */}
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden relative border border-border/10 shadow-inner">
                <div className="absolute inset-0 bg-primary w-full -translate-x-full animate-progress-flow transform-gpu" />
            </div>
        </div>

        {/* FLOATING SPARKLE PARTICLES */}
        <div className="absolute -top-10 -left-10 opacity-40">
            <Sparkles className="size-6 text-primary animate-pulse transform-gpu" />
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
            0%, 100% { transform: scale3d(1, 1, 1); }
            50% { transform: scale3d(1.05, 1.05, 1); }
        }
        .translate3d-0 {
            transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  );
}
