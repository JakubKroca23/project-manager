'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, UserPlus, CheckCircle2, KeyRound } from 'lucide-react';
import Image from 'next/image';

// --- SVG Logo Component (Refined to match image exactly) ---
const ContSystemLogo = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/logo.png"
            alt="ContSystem Logo"
            width={400}
            height={100}
            className="w-full h-auto"
            priority
            unoptimized
        />
    </div>
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSent, setRequestSent] = useState<{ type: 'access' | 'password', text: string } | null>(null);
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

            // Use hard navigation to ensure session cookies are properly set
            // router.push + router.refresh can cause race conditions on Vercel
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || 'Chyba při přihlašování');
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
            // First, try to send to user_requests table
            const { error: requestError } = await supabase
                .from('user_requests')
                .insert({
                    email,
                    request_type: 'access',
                    metadata: { source: 'login_page' }
                });

            // If table doesn't exist or other error, fallback to profiles update if logged in
            if (requestError) {
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
                    throw new Error('Žádost o přístup se nepodařilo odeslat. Prosím kontaktujte administrátora na jakub.kroca@contsystem.cz');
                }
            }

            setRequestSent({ type: 'access', text: 'Žádost o přístup byla odeslána administrátorovi.' });
        } catch (err: any) {
            setError(err.message || 'Nepodařilo se odeslat žádost. Zkuste to prosím později.');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Pro reset hesla zadejte svůj e-mail.');
            return;
        }

        setRequestLoading(true);
        setError(null);

        try {
            // 1. Try native Supabase reset (Best for automated flow)
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login?type=recovery`,
            });

            // 2. Also log request in user_requests for admin to see
            await supabase
                .from('user_requests')
                .insert({
                    email,
                    request_type: 'password_reset',
                    metadata: { native_reset_sent: !resetError }
                });

            if (resetError) {
                // If native reset fails (e.g. email not found in auth), we STILL log it in user_requests
                // so the admin can help the user.
                setRequestSent({ type: 'password', text: 'Požadavek byl předán administrátorovi k ručnímu vyřízení.' });
            } else {
                setRequestSent({ type: 'password', text: 'Instrukce pro reset hesla byly odeslány na váš e-mail.' });
            }
        } catch (err: any) {
            setError('Nepodařilo se odeslat žádost. Zkuste to prosím později.');
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#111111] overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#0099ff]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#0099ff]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <ContSystemLogo className="w-80 h-auto drop-shadow-2xl mb-2" />
                    <h2 className="text-xl font-medium text-white/70 tracking-tight">Plánování projektů Contsystem</h2>
                </div>

                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {requestSent && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-xs flex items-start gap-2">
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                <span>{requestSent.text}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4.5 w-4.5 text-gray-600 group-focus-within:text-[#0099ff] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-3 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0099ff]/50 focus:border-[#0099ff]/50 transition-all font-medium"
                                    placeholder="email@contsystem.cz"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Heslo</label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] font-bold text-gray-500 hover:text-blue-400 transition-colors uppercase tracking-[0.1em]"
                                >
                                    Zapomenuté heslo?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4.5 w-4.5 text-gray-600 group-focus-within:text-[#0099ff] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-3 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0099ff]/50 focus:border-[#0099ff]/50 transition-all font-medium"
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
                                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Zapamatovat login</span>
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
                            className="w-full flex items-center justify-center gap-2 bg-[#0099ff] hover:bg-[#0099ff]/90 text-white font-bold py-3 px-4 rounded-xl shadow-xl shadow-[#0099ff]/20 focus:outline-none focus:ring-2 focus:ring-[#0099ff]/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Přihlašování...</span>
                                </>
                            ) : (
                                <>
                                    <span>Přihlásit se</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="absolute bottom-[-100px] left-0 right-0 py-8 opacity-30">
                    <p className="text-gray-500 text-[10px] text-center tracking-[0.3em] uppercase font-bold">
                        © 2026 Contsystem s.r.o.
                    </p>
                </div>
            </div>
        </div>
    );
}
