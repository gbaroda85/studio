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
      "fixed top-[100px] left-4 md:left-8 z-[60] animate-in fade-in slide-in-from-left-4 duration-500 no-print",
      className
    )}>
      <Button asChild variant="outline" size="sm" className="group rounded-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-2 border-primary/20 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all px-4 h-10 shadow-2xl">
        <Link href={href} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden sm:inline">{label}</span>
          <span className="font-black text-[10px] uppercase tracking-[0.2em] sm:hidden">Back</span>
        </Link>
      </Button>
    </div>
  );
}
