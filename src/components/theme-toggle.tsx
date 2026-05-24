"use client";

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-9 w-16 bg-muted rounded-full" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDark ? "bg-slate-800" : "bg-slate-200"
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <div
        className={cn(
          "pointer-events-none flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
          isDark ? "translate-x-7 bg-slate-950" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={cn("h-3.5 w-3.5 text-amber-500/40", isDark ? "opacity-100" : "opacity-0")} />
        <Moon className={cn("h-3.5 w-3.5 text-primary/40", isDark ? "opacity-0" : "opacity-100")} />
      </div>
    </button>
  );
}

import { useEffect } from 'react';