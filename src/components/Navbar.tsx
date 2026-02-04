'use client';

import React from 'react';
import {
    Calendar,
    Briefcase,
    Factory,
    Wrench,
    ShieldCheck,
    Search,
    Bell,
    Moon,
    Sun,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/lib/ThemeContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Timeline', icon: Calendar, href: '/' },
    { name: 'Projekty', icon: Briefcase, href: '/projekty' },
    { name: 'Výroba', icon: Factory, href: '/vyroba' },
    { name: 'Servis', icon: Wrench, href: '/servis' },
    { name: 'Admin', icon: ShieldCheck, href: '/admin' },
];

const Navbar = () => {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar-glass">
            <div className="navbar-container">
                <div className="navbar-links">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "nav-link",
                                    isActive && "nav-link-active"
                                )}
                            >
                                <item.icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="navbar-actions">
                    <div className="user-profile">
                        <div className="user-btn-corporate">
                            <span className="user-name-text">Jakub Kroča</span>
                        </div>
                    </div>
                    <button className="action-btn relative">
                        <Bell size={18} />
                        <span className="notification-dot"></span>
                    </button>
                    <button className="action-btn" onClick={toggleTheme} title={theme === 'light' ? 'Zapnout tmavý režim' : 'Zapnout světlý režim'}>
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
