'use client';

import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center">
        {/* Outer Glowing Ring */}
        <div className="absolute inset-[-20px] rounded-full border-4 border-primary/5 border-t-primary animate-spin shadow-[0_0_40px_-5px_hsl(var(--primary)/0.3)]" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-[-10px] rounded-full border-2 border-dashed border-primary/10 animate-spin-slow opacity-40" />

        {/* GR7 LOGO CONTAINER */}
        <div className="relative size-24 md:size-32 flex items-center justify-center bg-white dark:bg-slate-900 border-[3px] border-slate-200 dark:border-primary/20 rounded-[2rem] shadow-2xl overflow-hidden animate-pulse-subtle group">
            <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                <text 
                    x="4" 
                    y="70" 
                    style={{ 
                        fill: '#0d5a71', 
                        fontSize: '44px', 
                        fontWeight: 900, 
                        fontFamily: 'Arial Black, sans-serif'
                    }}
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
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-tl-lg shadow-lg">
                <Sparkles className="size-3 md:size-4 animate-pulse" />
            </div>
        </div>
        
        {/* Status Text */}
        <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary animate-pulse">
                Initializing Studio...
            </p>
            <div className="w-32 h-1 bg-primary/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-primary w-1/2 animate-[loading-bar_1.5s_infinite_ease-in-out]" />
            </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
