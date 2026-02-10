'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Bell, Calendar, Briefcase, GanttChart, LayoutDashboard } from 'lucide-react';

const navItems = [
    { name: 'TIMELINE', icon: Calendar, href: '/' },
    { name: 'PROJEKTY', icon: Briefcase, href: '/projekty' },
    { name: 'VÝROBA', icon: Factory, href: '/vyroba' },
    { name: 'SERVIS', icon: Wrench, href: '/servis' },
];

const Navbar = () => {
    const pathname = usePathname();

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
                            <span className="user-name-text">CONTSYSTEM s.r.o.</span>
                        </div>
                    </div>
                    <button className="action-btn relative">
                        <Bell size={18} />
                        <span className="notification-dot"></span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
