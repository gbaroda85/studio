'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolNavigationProps {
  href: string;
  label: string; // Received but we standardize it for a cleaner look
  className?: string;
}

export function ToolNavigation({ href, label, className }: ToolNavigationProps) {
  return (
    <div className={cn(
      "fixed top-28 left-4 md:left-10 z-[60] animate-in fade-in slide-in-from-left-4 duration-500 no-print",
      className
    )}>
      <Button 
        asChild 
        variant="outline" 
        className="group h-10 md:h-12 px-2.5 md:px-5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-primary/20 hover:border-primary hover:shadow-[0_0_25px_rgba(var(--primary),0.2)] transition-all duration-300 shadow-2xl overflow-hidden"
      >
        <Link href={href} className="flex items-center gap-2 md:gap-3">
          {/* Circular Arrow Icon Container */}
          <div className="size-7 md:size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
            <ArrowLeft className="h-4 w-4 md:h-4.5 md:w-4.5 transition-transform group-hover:-translate-x-0.5" />
          </div>
          
          {/* standardized Compact Label */}
          <div className="flex flex-col items-start leading-none pr-1 md:pr-0">
            <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
               <span className="hidden sm:inline">Back to </span>Tools
            </span>
          </div>
        </Link>
      </Button>
    </div>
  );
}
