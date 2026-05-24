
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
      "sticky top-20 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-border/40 py-3 mb-8 flex justify-center animate-in fade-in slide-in-from-top-4 duration-500",
      className
    )}>
      <div className="w-full max-w-7xl px-4 md:px-8">
        <Button asChild variant="ghost" size="sm" className="group rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all px-5 border border-border/50 hover:border-primary/30 shadow-sm bg-white/50 dark:bg-black/20">
          <Link href={href} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
