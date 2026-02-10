'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

// --- SVG Logo Component ---
const ContSystemLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 400 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stylized "F" (Horizontal Bars) */}
        <g opacity="0.8">
            <rect x="50" y="10" width="80" height="4" fill="white" />
            <rect x="55" y="18" width="75" height="4" fill="white" />
            <rect x="60" y="26" width="70" height="4" fill="white" />
            <rect x="65" y="34" width="65" height="4" fill="white" />
            <rect x="70" y="42" width="60" height="4" fill="white" />
            <rect x="75" y="50" width="55" height="4" fill="white" />
            <rect x="80" y="58" width="50" height="4" fill="white" />
        </g>

        {/* "ContSystem" Text */}
        <text x="40" y="85" fill="white" style={{ font: 'bold 56px sans-serif', letterSpacing: '-2px' }}>
            ContSystem
        </text>

        {/* "SIMPLE HANDLING" Text */}
        <text x="210" y="105" fill="#0ea5e9" style={{ font: 'bold 20px sans-serif', letterSpacing: '1px' }}>
            SIMPLE HANDLING
        </text>
    </svg>
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check for remembered email
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) throw loginError;

            router.push('/projekty');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Chyba při přihlašování');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAccess = async () => {
        if (!email) {
            setError('Pro žádost o přístup zadejte svůj e-mail.');
            return;
        }

        setRequestLoading(true);
        setError(null);

        try {
            // Check if user exists first or just try to track request
            // For now, we'll try to update the profile if it exists
            const { data: userData } = await supabase.auth.getUser();

            if (userData?.user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        access_requested: true,
                        last_request_at: new Date().toISOString()
                    })
                    .eq('id', userData.user.id);

                if (updateError) throw updateError;
            } else {
                // If not logged in, we inform they need to be registered first
                setError('Před žádostí o přístup se musíte nejprve zaregistrovat nebo přihlásit.');
                return;
            }

            setRequestSent(true);
        } catch (err: any) {
            setError('Nepodařilo se odeslat žádost. Zkuste to prosím později.');
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1a1a] relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <ContSystemLogo className="w-64 h-auto drop-shadow-2xl mb-4" />
                    <h2 className="text-xl font-medium text-white/90 tracking-tight">Přehled projektů</h2>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {requestSent && (
                            <div className="bg-green-500/15 border border-green-500/30 text-green-300 p-3 rounded-lg text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                <span>Žádost o přístup byla odeslána administrátorovi.</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4.5 w-4.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="email@contsystem.cz"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Heslo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4.5 w-4.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded border transition-colors ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-white/20 bg-white/5'}`}>
                                        {rememberMe && (
                                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Zapamatovat login</span>
                            </label>

                            {!requestSent && (
                                <button
                                    type="button"
                                    onClick={handleRequestAccess}
                                    disabled={requestLoading}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                                >
                                    {requestLoading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                                    Požádat o přístup
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Přihlašování...</span>
                                </>
                            ) : (
                                <>
                                    <span>Přihlásit se</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 group">
                    <p className="text-[#444] text-[10px] text-center tracking-widest uppercase font-bold group-hover:text-gray-500 transition-colors">
                        © 2026 Contsystem s.r.o.
                    </p>
                </div>
            </div>
        </div>
    );
}
