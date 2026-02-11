'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const IconButton = ({ children, onClick, title, className }: { children: React.ReactNode, onClick?: () => void, title?: string, className?: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 bg-white/5 hover:bg-white/10 active:scale-95 text-gray-300 hover:text-white border border-white/10",
            className
        )}
        title={title}
    >
        {children}
    </button>
);

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <IconButton className={className}>
                <Sun size={15} className="opacity-50" />
            </IconButton>
        );
    }

    return (
        <IconButton
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            className={className}
        >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} className="text-blue-400" />}
        </IconButton>
    );
}
