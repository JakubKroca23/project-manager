import React, { useState, useEffect } from 'react';
import { RefreshCw, Wrench, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface MaintenanceScreenProps {
    estimatedEnd?: string;
}

export default function MaintenanceScreen({ estimatedEnd }: MaintenanceScreenProps) {
    const [version, setVersion] = useState('v1.0.0-alpha');
    const [cranePos, setCranePos] = useState(50); // 0 to 100
    const [hookDown, setHookDown] = useState(false);

    useEffect(() => {
        const fetchVersion = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'system_info')
                .maybeSingle();

            if (data?.settings) {
                setVersion((data.settings as any).version || 'v1.0.0-alpha');
            }
        };
        fetchVersion();
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    const moveCrane = (dir: number) => {
        setCranePos(prev => Math.max(0, Math.min(100, prev + dir * 5)));
    };
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground space-y-6">
            <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 duration-1000"></div>
                <div className="relative rounded-full bg-muted p-6 border-4 border-primary/30 shadow-2xl">
                    <RefreshCw className="h-16 w-16 animate-spin text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 border shadow-lg">
                    <Wrench className="h-6 w-6 text-orange-500" />
                </div>
            </div>

            <div className="text-center space-y-2 max-w-md px-4">
                <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
                    Probíhá aktualizace
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                    Systém je momentálně v režimu údržby.
                    <br />
                    {estimatedEnd ? (
                        <>
                            Očekávaný návrat do provozu v <strong>{new Date(estimatedEnd).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</strong>.
                        </>
                    ) : (
                        'Prosím, zkuste to znovu za chvíli.'
                    )}
                </p>
            </div>

            <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform active:scale-95"
            >
                <RefreshCw className="h-4 w-4" />
                Obnovit stránku
            </button>

            {/* Crane Mini-game */}
            <div className="w-full max-w-md bg-muted/50 rounded-2xl border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <Truck size={12} /> Crane Game alpha
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => moveCrane(-1)}
                            className="bg-background border border-border p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-90"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => setHookDown(!hookDown)}
                            className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95"
                        >
                            {hookDown ? 'Nahoru' : 'Dolů'}
                        </button>
                        <button
                            onClick={() => moveCrane(1)}
                            className="bg-background border border-border p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-90"
                        >
                            →
                        </button>
                    </div>
                </div>

                <div className="h-40 bg-zinc-900/50 rounded-xl relative overflow-hidden border border-zinc-500/10">
                    {/* Crane Track */}
                    <div className="absolute top-4 left-4 right-4 h-1.5 bg-zinc-700/50 rounded-full" />

                    {/* Crane Hook */}
                    <div
                        className="absolute top-4 transition-all duration-300 ease-out flex flex-col items-center"
                        style={{ left: `${cranePos}%`, transform: 'translateX(-50%)' }}
                    >
                        {/* Wire */}
                        <div
                            className="w-0.5 bg-zinc-400 transition-all duration-500"
                            style={{ height: hookDown ? '80px' : '10px' }}
                        />
                        {/* Hook */}
                        <div className="w-6 h-6 border-4 border-t-0 border-zinc-400 rounded-b-xl relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-400" />
                        </div>
                    </div>

                    {/* Floor items */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-zinc-800" />
                    <div className="absolute bottom-4 left-10 w-8 h-8 bg-orange-500/20 border border-orange-500/40 rounded shadow-inner animate-pulse" />
                    <div className="absolute bottom-4 left-1/2 w-6 h-6 bg-blue-500/20 border border-blue-500/40 rounded shadow-inner" />
                    <div className="absolute bottom-4 right-10 w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded shadow-inner" />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest pt-8">
                <span className="animate-pulse">System Update</span>
                <span>•</span>
                <span>{version}</span>
            </div>
        </div>
    );
}
