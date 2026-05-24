
"use client";

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-10 w-10 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all shadow-sm group overflow-hidden"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <div className="relative h-6 w-6">
        <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500 absolute inset-0" />
        <Moon className="h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary absolute inset-0" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
