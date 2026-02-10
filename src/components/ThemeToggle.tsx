'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg bg-secondary text-muted-foreground opacity-50 cursor-not-allowed">
                <Sun size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors relative"
            title={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
        >
            <Sun size={20} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute top-2 left-2" />
            <Moon size={20} className="rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
            {/* Spacer to keep button size constant */}
            <div className="w-5 h-5 opacity-0" />
        </button>
    );
}
