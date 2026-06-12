'use client';

import { Sparkles, Cpu, Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl animate-in fade-in duration-700">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 size-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative flex flex-col items-center">
        {/* Complex Orbital Animation */}
        <div className="absolute inset-[-40px] rounded-full border border-primary/10 animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-[-30px] rounded-full border-2 border-dashed border-primary/5 animate-[spin_8s_linear_infinite_reverse]" />
        <div className="absolute inset-[-20px] rounded-full border-t-4 border-primary shadow-[0_0_40px_-5px_hsl(var(--primary)/0.4)] animate-[spin_1.5s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite]" />

        {/* GR7 LOGO CONTAINER */}
        <div className="relative size-32 md:size-40 flex items-center justify-center bg-white dark:bg-slate-900 border-[3px] border-slate-200 dark:border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-float group">
            {/* Shimmer Effect over Logo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none z-10" />
            
            <svg viewBox="0 0 100 100" className="w-full h-full p-4 relative z-0">
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
            
            {/* Status Icons */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-tl-xl shadow-xl z-20">
                <Sparkles className="size-4 animate-pulse" />
            </div>
        </div>
        
        {/* Status Text & Progress */}
        <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
                <Cpu className="size-3 text-primary animate-bounce" />
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-primary animate-pulse">
                    Initializing GR7 Studio
                </p>
                <Zap className="size-3 text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            
            {/* Modern Slim Progress Bar */}
            <div className="w-48 h-1 bg-primary/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full animate-[loading-shimmer_1.5s_infinite_ease-in-out]" />
            </div>
            
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
                Optimizing Local RAM Buffers
            </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
