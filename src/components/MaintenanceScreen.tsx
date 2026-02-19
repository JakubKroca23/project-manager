import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Wrench, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Physics Configuration
const GRAVITY = 0.4;
const FRICTION = 0.99;
const BOUNCE = 0.7;
const MOUSE_FORCE = 1.5;
const MOUSE_RADIUS = 150;

interface PhysicsBody {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    rotation: number;
    vr: number; // Angular velocity
    element: HTMLElement;
}

interface MaintenanceScreenProps {
    estimatedEnd?: string;
}

export default function MaintenanceScreen({ estimatedEnd }: MaintenanceScreenProps) {
    const [version, setVersion] = useState('v1.0.0-alpha');
    const [gameEnabled, setGameEnabled] = useState(false);
    const [isGameActive, setIsGameActive] = useState(false);
    const [isRefreshed, setIsRefreshed] = useState(false);

    // Game Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();
    const bodiesRef = useRef<PhysicsBody[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const fetchSettings = async () => {
            // Version
            const { data: verData } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'system_info')
                .maybeSingle();

            if (verData?.settings) {
                setVersion((verData.settings as any).version || 'v1.0.0-alpha');
            }

            // Game Settings
            const { data: gameData } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'maintenance_minigame')
                .maybeSingle();

            if (gameData?.settings?.enabled) {
                setGameEnabled(true);
            }
        };
        fetchSettings();

        // Mouse Tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleRefresh = () => {
        if (gameEnabled && !isGameActive) {
            startGame();
        } else {
            setIsRefreshed(true);
            window.location.reload();
        }
    };

    const startGame = () => {
        if (!containerRef.current) return;
        setIsGameActive(true);

        const elements = Array.from(containerRef.current.children) as HTMLElement[];
        const bodies: PhysicsBody[] = [];

        // Convert DOM elements to Physics Bodies
        elements.forEach((el, index) => {
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;

            const rect = el.getBoundingClientRect();
            bodies.push({
                id: `body-${index}`,
                x: rect.left,
                y: rect.top,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                width: rect.width,
                height: rect.height,
                rotation: 0,
                vr: (Math.random() - 0.5) * 0.2,
                element: el
            });
        });

        bodiesRef.current = bodies;

        // Set absolute positioning to allow movement
        bodies.forEach(b => {
            b.element.style.position = 'fixed';
            b.element.style.left = '0';
            b.element.style.top = '0';
            b.element.style.width = `${b.width}px`;
            b.element.style.height = `${b.height}px`;
            b.element.style.margin = '0';
            b.element.style.transform = `translate(${b.x}px, ${b.y}px)`;
            b.element.style.zIndex = '50';
            b.element.style.transition = 'none'; // Disable CSS transitions for physics
        });

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const gameLoop = () => {
        const bodies = bodiesRef.current;
        const mouse = mouseRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;

        bodies.forEach(b => {
            // Gravity
            b.vy += GRAVITY;

            // Friction
            b.vx *= FRICTION;
            b.vy *= FRICTION;
            b.vr *= 0.98;

            // Mouse Interaction (Repulsion Field)
            const centerX = b.x + b.width / 2;
            const centerY = b.y + b.height / 2;
            const dx = centerX - mouse.x;
            const dy = centerY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);
                const push = force * MOUSE_FORCE * 2; // Stronger push
                b.vx += Math.cos(angle) * push;
                b.vy += Math.sin(angle) * push;
                b.vr += (Math.random() - 0.5) * force * 0.8;
            }

            // Update Position
            b.x += b.vx;
            b.y += b.vy;
            b.rotation += b.vr;

            // Screen Boundaries (Bounce)
            if (b.x < 0) {
                b.x = 0;
                b.vx *= -BOUNCE;
            } else if (b.x + b.width > width) {
                b.x = width - b.width;
                b.vx *= -BOUNCE;
            }

            if (b.y < 0) {
                b.y = 0;
                b.vy *= -BOUNCE;
            } else if (b.y + b.height > height) {
                b.y = height - b.height;
                b.vy *= -BOUNCE;
                // Ground friction
                b.vx *= 0.9;
                b.vr *= 0.9;
            }

            // Render
            b.element.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rotation}rad)`;
        });

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    return (
        <div
            ref={containerRef}
            className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground space-y-6 overflow-hidden select-none"
        >
            <div className="relative cursor-pointer group" onClick={handleRefresh}>
                <div className={`absolute inset-0 rounded-full bg-primary/20 duration-1000 ${isGameActive ? 'animate-none opacity-0' : 'animate-ping'}`}></div>
                <div className={`relative rounded-full bg-muted p-6 border-4 border-primary/30 shadow-2xl transition-transform duration-500 ${isGameActive ? 'scale-75 rotate-180 bg-orange-500 text-white border-orange-600' : 'group-hover:scale-110'}`}>
                    {isRefreshed ? (
                        <RefreshCw className="h-16 w-16 animate-spin text-primary" />
                    ) : (
                        <RefreshCw className={`h-16 w-16 text-primary transition-all duration-700 ${gameEnabled ? 'group-hover:rotate-180' : ''} ${isGameActive ? 'text-white' : ''}`} />
                    )}
                </div>
                {gameEnabled && !isGameActive && (
                    <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 border shadow-lg animate-bounce">
                        <Wrench className="h-6 w-6 text-orange-500" />
                    </div>
                )}
            </div>

            <div className="text-center space-y-2 max-w-md px-4 relative z-10">
                <h1 className="text-3xl font-black tracking-tight text-foreground uppercase drop-shadow-sm">
                    {isGameActive ? "Oops! Gravity Failure" : "Probíhá aktualizace"}
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                    {isGameActive ? (
                        "Systém se rozpadl! Zkuste pochytat elementy myší!"
                    ) : (
                        <>
                            Systém je momentálně v režimu údržby.
                            <br />
                            {estimatedEnd ? (
                                <>
                                    Očekávaný návrat do provozu v <strong>{new Date(estimatedEnd).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</strong>.
                                </>
                            ) : (
                                'Prosím, zkuste to znovu za chvíli.'
                            )}
                        </>
                    )}
                </p>
            </div>

            <div className="flex items-center gap-3 relative z-10">
                <button
                    onClick={handleRefresh}
                    disabled={isGameActive}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform active:scale-95 ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshed ? 'animate-spin' : ''}`} />
                    {isGameActive ? 'Hra běží...' : 'Obnovit stránku'}
                </button>
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-muted text-muted-foreground rounded-full font-bold text-sm shadow-md hover:bg-muted/80 transition-all active:scale-95"
                >
                    <LogOut className="h-4 w-4" />
                    Odhlásit se
                </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest pt-8">
                <span className={isGameActive ? "text-orange-500" : "animate-pulse"}>
                    {isGameActive ? "PHYSICS ENGINE ACTIVE" : "System Update"}
                </span>
                <span>•</span>
                <span>{version}</span>
            </div>
        </div>
    );
}
