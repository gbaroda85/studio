"use client";

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-9 w-20" />;

  const isDark = theme === 'dark';

  return (
    <label className="theme-switch">
      <input 
        type="checkbox" 
        className="theme-switch__checkbox" 
        checked={isDark}
        onChange={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <div className="theme-switch__container">
        <div className="theme-switch__circle-container">
          <div className="theme-switch__sun-moon-container">
            <div className="theme-switch__moon">
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
            </div>
          </div>
        </div>
        <div className="theme-switch__clouds"></div>
        <div className="theme-switch__stars-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 144 55"
            fill="currentColor"
            className="w-full h-full"
          >
            <path
              d="M3.1 50.48c.12-1.6.73-3.22 1.54-4.65.41-.72.89-1.4 1.38-2.06.49-.66 1.06-1.26 1.62-1.83a15.42 15.42 0 0 1 2.01-1.7c.74-.53 1.54-1.01 2.37-1.4 1.66-.78 3.48-1.24 5.34-1.24s3.68.46 5.34 1.24c.83.39 1.63.87 2.37 1.4.74.53 1.41 1.1 2.01 1.7.56.57 1.13 1.17 1.62 1.83.49.66.97 1.34 1.38 2.06.81 1.43 1.42 3.05 1.54 4.65h-38.5zM105.4 50.48c.12-1.6.73-3.22 1.54-4.65.41-.72.89-1.4 1.38-2.06.49-.66 1.06-1.26 1.62-1.83a15.42 15.42 0 0 1 2.01-1.7c.74-.53 1.54-1.01 2.37-1.4 1.66-.78 3.48-1.24 5.34-1.24s3.68.46 5.34 1.24c.83.39 1.63.87 2.37 1.4.74.53 1.41 1.1 2.01 1.7.56.57 1.13 1.17 1.62 1.83.49.66.97 1.34 1.38 2.06.81 1.43 1.42 3.05 1.54 4.65h-38.5z"
            ></path>
          </svg>
        </div>
      </div>
    </label>
  );
}
