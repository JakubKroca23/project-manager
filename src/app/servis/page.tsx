'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServisRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/projekty?type=service');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-purple-500/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 animate-pulse">Přesměrování...</span>
            </div>
        </div>
    );
}
