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
      "sticky top-24 z-40 w-full pointer-events-none mb-6 animate-in fade-in slide-in-from-top-4 duration-500 flex justify-start px-4 md:px-8 max-w-7xl mx-auto",
      className
    )}>
      <Button asChild variant="ghost" size="sm" className="pointer-events-auto group rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all px-5 border-2 border-border/50 hover:border-primary/30 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <Link href={href} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
        </Link>
      </Button>
    </div>
  );
}
