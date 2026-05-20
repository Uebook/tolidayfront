'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
       const { theme, setTheme, resolvedTheme } = useTheme();
       const [mounted, setMounted] = React.useState(false);

       React.useEffect(() => {
              setMounted(true);
       }, []);

       if (!mounted) {
              return <div className="w-9 h-9 flex-shrink-0" />; // Placeholder
       }

       return (
              <button
                     onClick={(e) => {
                            e.preventDefault();
                            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                     }}
                     className="p-2 rounded-lg hover:bg-[var(--table-header)] dark:hover:bg-[var(--table-header)] transition-colors flex items-center justify-center flex-shrink-0"
                     style={{ color: 'hsl(var(--muted-foreground))' }}
                     aria-label="Toggle theme"
              >
                     {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
       );
}
