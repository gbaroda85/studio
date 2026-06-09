'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolNavigationProps {
  href: string;
  label: string; 
  className?: string;
}

export function ToolNavigation({ href, label, className }: ToolNavigationProps) {
  return (
    <div className={cn(
      "fixed top-24 left-4 md:left-6 z-[40] animate-in fade-in slide-in-from-left-4 duration-500 no-print",
      className
    )}>
      <Button 
        asChild 
        variant="outline" 
        className="group h-9 md:h-10 px-2 md:px-4 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-2 border-primary/10 hover:border-primary transition-all duration-300 shadow-xl overflow-hidden w-fit"
      >
        <Link href={href} className="flex items-center gap-2">
          <div className="size-6 md:size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span className="font-black text-[9px] uppercase tracking-widest text-slate-800 dark:text-slate-200">
             Tools
          </span>
        </Link>
      </Button>
    </div>
  );
}
