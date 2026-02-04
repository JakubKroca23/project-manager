'use client';

import React from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Factory,
    Wrench,
    Calendar,
    ShieldCheck,
    Search,
    Bell,
    Moon,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Projekty', icon: Briefcase, href: '/projekty' },
    { name: 'Výroba', icon: Factory, href: '/vyroba' },
    { name: 'Servis', icon: Wrench, href: '/servis' },
    { name: 'Timeline', icon: Calendar, href: '/timeline' },
    { name: 'Admin', icon: ShieldCheck, href: '/admin' },
];

const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="navbar-glass">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <div className="logo-icon">PM</div>
                    <span className="logo-text">ProjectManager</span>
                </div>

                <div className="navbar-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "nav-link",
                                (pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))) && "nav-link-active"
                            )}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="navbar-actions">
                    <button className="action-btn"><Search size={20} /></button>
                    <button className="action-btn relative">
                        <Bell size={20} />
                        <span className="notification-dot"></span>
                    </button>
                    <button className="action-btn"><Moon size={20} /></button>
                    <div className="user-profile">
                        <div className="avatar">AD</div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
