'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Factory, Wrench, Bell, LayoutDashboard } from 'lucide-react';


const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="navbar-glass">
            <div className="navbar-container">
                <div className="navbar-links">
                    <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
                        <Link
                            href="/"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[13px] font-bold tracking-wide transition-all ${pathname === '/'
                                ? 'bg-[#0091ff] text-white shadow-[0_0_15px_rgba(0,145,255,0.4)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LayoutDashboard size={14} strokeWidth={2.5} />
                            <span>DASHBOARD</span>
                        </Link>

                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                        <Link
                            href="/vyroba"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[13px] font-bold tracking-wide transition-all ${pathname === '/vyroba'
                                ? 'bg-[#0091ff] text-white shadow-[0_0_15px_rgba(0,145,255,0.4)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Factory size={14} strokeWidth={2.5} />
                            <span>VÝROBA</span>
                        </Link>

                        <Link
                            href="/servis"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[13px] font-bold tracking-wide transition-all ${pathname === '/servis'
                                ? 'bg-[#0091ff] text-white shadow-[0_0_15px_rgba(0,145,255,0.4)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Wrench size={14} strokeWidth={2.5} />
                            <span>SERVIS</span>
                        </Link>
                    </div>
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
