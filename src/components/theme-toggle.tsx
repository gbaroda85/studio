
"use client";

import * as React from 'react';
import {Moon, Sun} from 'lucide-react';
import {useTheme} from 'next-themes';

import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const {setTheme} = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:bg-primary/10 transition-colors">
          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-2xl">
        <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-lg font-bold py-2">
          ☀️ Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-lg font-bold py-2">
          🌙 Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-lg font-bold py-2">
          💻 System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
