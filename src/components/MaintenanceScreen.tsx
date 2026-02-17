import React from 'react';
import { RefreshCw, Wrench } from 'lucide-react';

interface MaintenanceScreenProps {
    estimatedEnd?: string;
}

export default function MaintenanceScreen({ estimatedEnd }: MaintenanceScreenProps) {
    const handleRefresh = () => {
        window.location.reload();
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

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest pt-8">
                <span className="animate-pulse">System Update</span>
                <span>•</span>
                <span>v2.0</span>
            </div>
        </div>
    );
}
