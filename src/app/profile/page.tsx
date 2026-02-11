'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Shield, Moon, Sun, Monitor, Bell, Palette, Settings, Users, Key, AlertTriangle, Clock, KeyRound, CheckCircle, X, UserPlus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useAdmin, type UserRequest, type AdminLog } from '@/hooks/useAdmin';
import { approveAccessRequest } from '@/actions/admin';
import { cn } from '@/lib/utils';
import { ScrollText, Search as SearchIcon } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { profiles, userRequests, adminLogs, currentUserProfile, isAdmin, isLoading, updatePermission, updateUserPermissions, resetPasswordRequest, processUserRequest, refresh } = useAdmin();
    const [showSettings, setShowSettings] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [adminHistorySearch, setAdminHistorySearch] = useState('');
    const [notifications, setNotifications] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('notifications_enabled') !== 'false';
        }
        return true;
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [adminActiveTab, setAdminActiveTab] = useState<'users' | 'history'>('users');
    const [logFilter, setLogFilter] = useState<'all' | 'access' | 'permissions' | 'passwords'>('all');
    const [lastLogId, setLastLogId] = useState<string | null>(null);
    const [showNewLogToast, setShowNewLogToast] = useState(false);

    // Approval Modal State
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isProcessingApproval, setIsProcessingApproval] = useState(false);

    // Permissions Modal State
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null); // Using any temporarily for ease, or use UserProfile
    const [editedPermissions, setEditedPermissions] = useState<{ [key: string]: boolean }>({});
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications_enabled', String(newVal));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus({ type: null, message: '' });

        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'Hesla se neshodují.' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordStatus({ type: 'error', message: 'Heslo musí mít alespoň 6 znaků.' });
            return;
        }

        setIsChangingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordStatus({ type: 'success', message: 'Heslo bylo úspěšně změněno.' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordStatus({ type: 'error', message: error.message || 'Chyba při změně hesla.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const openApproveModal = (request: UserRequest) => {
        setSelectedRequest(request);
        setNewUserPassword(Math.random().toString(36).slice(-8)); // Suggest random password
        setApproveModalOpen(true);
    };

    const confirmApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !newUserPassword) return;

        setIsProcessingApproval(true);
        try {
            const result = await approveAccessRequest(selectedRequest.id, selectedRequest.email, newUserPassword);
            if (result.error) {
                alert(result.error);
            } else {
                setApproveModalOpen(false);
                // We'll trust the refresh or realtime update
                await refresh();
            }
        } catch (err: any) {
            alert(err.message || 'Chyba při schvalování.');
        } finally {
            setIsProcessingApproval(false);
        }
    };

    const openPermissionsModal = (user: any) => {
        setSelectedUserForPermissions(user);
        // Initialize with existing permissions or defaults (true if undefined)
        setEditedPermissions({
            timeline: user.permissions?.timeline !== false,
            projects: user.permissions?.projects !== false,
            projects_civil: user.permissions?.projects_civil !== false,
            projects_military: user.permissions?.projects_military !== false,
            service: user.permissions?.service !== false,
            production: user.permissions?.production !== false,
            purchasing: user.permissions?.purchasing !== false,
        });
        setPermissionsModalOpen(true);
    };


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!currentUserProfile) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <p className="text-muted-foreground">Profil nebyl nalezen. Zkuste se přihlásit znovu.</p>
                <button onClick={handleLogout} className="text-primary hover:underline flex items-center gap-2">
                    <LogOut size={16} /> Odhlásit se
                </button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-2xl mx-auto w-full py-4 space-y-6">

                {/* User Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 border-2 border-primary/20">
                            <User size={40} />
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-bold text-foreground">
                                {currentUserProfile.email.split('@')[0]}
                            </h2>
                            <p className="text-sm font-medium text-muted-foreground">{currentUserProfile.email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                    ID: {currentUserProfile.id}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md w-fit uppercase tracking-widest shadow-sm">
                                    <Shield size={10} />
                                    <span>Authenticated</span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-md w-fit uppercase tracking-widest shadow-sm">
                                        <Key size={10} />
                                        <span>Admin</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-bold text-[11px] shadow-md shadow-red-600/20 active:scale-[0.98] uppercase tracking-wider"
                            >
                                <LogOut size={14} />
                                <span>Odhlásit se</span>
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center justify-center gap-2 px-4 py-1.5 bg-muted/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-all font-bold text-[11px] border border-border/40 active:scale-[0.98] uppercase tracking-wider backdrop-blur-sm"
                            >
                                <Settings size={14} />
                                <span>Nastavení</span>
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowAdminPanel(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-bold text-[11px] active:scale-[0.98] uppercase tracking-wider shadow-md shadow-indigo-600/20"
                                >
                                    <Shield size={14} />
                                    <span>Admin Panel</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Popup Modal */}
                {showSettings && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setShowSettings(false)}
                        />
                        <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                        <Settings size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Nastavení systému</h3>
                                        <p className="text-xs text-muted-foreground">Správa uživatelů a přizpůsobení rozhraní</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors group"
                                    title="Zavřít nastavení"
                                >
                                    <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Vzhled */}
                                    <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                                            <Palette size={16} className="text-primary" />
                                            <span>Vzhled</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-3">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Barevný motiv</p>
                                                <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-xl p-1.5 border border-border/40">
                                                    <button
                                                        onClick={() => setTheme('light')}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'light' ? 'bg-background shadow-lg text-primary scale-[1.02] ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Sun size={14} />
                                                        <span>SVĚTLÝ</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setTheme('dark')}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-background shadow-lg text-primary scale-[1.02] ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Moon size={14} />
                                                        <span>TMAVÝ</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setTheme('system')}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'system' ? 'bg-background shadow-lg text-primary scale-[1.02] ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Monitor size={14} />
                                                        <span>SYSTÉM</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifikace */}
                                    <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                                            <Bell size={16} className="text-primary" />
                                            <span>Notifikace</span>
                                        </div>

                                        <div className="flex items-center justify-between bg-muted/50 px-4 py-3 rounded-xl border border-border/40">
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-bold text-foreground">Aktivovat</p>
                                                <p className="text-[10px] text-muted-foreground">Informační zprávy</p>
                                            </div>
                                            <button
                                                onClick={toggleNotifications}
                                                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${notifications ? 'bg-primary' : 'bg-gray-400'}`}
                                                title={notifications ? "Deaktivovat notifikace" : "Aktivovat notifikace"}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Zabezpečení - Změna hesla */}
                                <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                                        <Shield size={16} className="text-primary" />
                                        <span>Zabezpečení</span>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Nové heslo</label>
                                                <div className="relative">
                                                    <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="w-full bg-muted/50 border border-border/40 rounded-xl px-9 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                                                        placeholder="Zadejte nové heslo"
                                                        minLength={6}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Potvrzení hesla</label>
                                                <div className="relative">
                                                    <CheckCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full bg-muted/50 border border-border/40 rounded-xl px-9 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                                                        placeholder="Zadejte heslo znovu"
                                                        minLength={6}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {passwordStatus.message && (
                                            <div className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${passwordStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                                {passwordStatus.type === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                                {passwordStatus.message}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isChangingPassword || !newPassword || !confirmPassword}
                                            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isChangingPassword ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                            Změnit heslo
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-border bg-muted/5 flex justify-end">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                                >
                                    Hotovo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Panel Popup Modal */}
                {showAdminPanel && isAdmin && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setShowAdminPanel(false)}
                        />
                        <div className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">
                            {/* Modal Header Tabs */}
                            <div className="flex h-12 border-b border-border bg-muted/5 shrink-0">
                                <button
                                    onClick={() => setAdminActiveTab('users')}
                                    className={cn(
                                        "px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                                        adminActiveTab === 'users' ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-500/[0.03]" : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                                    )}
                                    title="Zobrazit správu uživatelů"
                                >
                                    Uživatelé
                                </button>
                                <button
                                    onClick={() => setAdminActiveTab('history')}
                                    className={cn(
                                        "px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                                        adminActiveTab === 'history' ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-500/[0.03]" : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                                    )}
                                    title="Zobrazit historii aktivit"
                                >
                                    Historie aktivit
                                </button>
                                {showNewLogToast && (
                                    <div className="ml-auto flex items-center px-4 animate-bounce">
                                        <div className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-600/30">Nový záznam!</div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {adminActiveTab === 'history' ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1">
                                                <ScrollText size={16} />
                                                <span>Log aktivit v reálném čase</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex bg-muted/50 p-1 rounded-xl border border-border/40 mr-2">
                                                    {(['all', 'access', 'permissions', 'passwords'] as const).map((f) => (
                                                        <button
                                                            key={f}
                                                            onClick={() => setLogFilter(f)}
                                                            className={cn(
                                                                "px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-lg transition-all",
                                                                logFilter === f ? "bg-white text-indigo-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                            title={`Filtrovat: ${f}`}
                                                        >
                                                            {f === 'all' ? 'Vše' : f === 'access' ? 'Přístup' : f === 'permissions' ? 'Práva' : 'Hesla'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="relative">
                                                    <SearchIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        placeholder="Hledat..."
                                                        value={adminHistorySearch}
                                                        onChange={(e) => setAdminHistorySearch(e.target.value)}
                                                        className="bg-muted px-8 py-1.5 rounded-xl text-[10px] w-48 border-none outline-none focus:ring-1 focus:ring-indigo-500/30"
                                                        title="Hledat v historii"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-border/60 rounded-2xl overflow-hidden bg-card shadow-inner max-h-[500px] overflow-y-auto">
                                            {(adminLogs || [])
                                                .filter(log => {
                                                    const matchesSearch = log.admin_email?.toLowerCase().includes(adminHistorySearch.toLowerCase()) ||
                                                        log.action.toLowerCase().includes(adminHistorySearch.toLowerCase()) ||
                                                        log.target_user_email?.toLowerCase().includes(adminHistorySearch.toLowerCase());

                                                    const matchesFilter = logFilter === 'all' ||
                                                        (logFilter === 'access' && (log.action.includes('žádost') || log.action.includes('Schválení'))) ||
                                                        (logFilter === 'permissions' && log.action.includes('oprávnění')) ||
                                                        (logFilter === 'passwords' && log.action.includes('hesla'));

                                                    return matchesSearch && matchesFilter;
                                                })
                                                .length > 0 ? (
                                                adminLogs
                                                    .filter(log => {
                                                        const matchesSearch = log.admin_email?.toLowerCase().includes(adminHistorySearch.toLowerCase()) ||
                                                            log.action.toLowerCase().includes(adminHistorySearch.toLowerCase()) ||
                                                            log.target_user_email?.toLowerCase().includes(adminHistorySearch.toLowerCase());

                                                        const matchesFilter = logFilter === 'all' ||
                                                            (logFilter === 'access' && (log.action.includes('žádost') || log.action.includes('Schválení'))) ||
                                                            (logFilter === 'permissions' && log.action.includes('oprávnění')) ||
                                                            (logFilter === 'passwords' && log.action.includes('hesla'));

                                                        return matchesSearch && matchesFilter;
                                                    })
                                                    .map(log => {
                                                        const isAccess = log.action.includes('žádost') || log.action.includes('Schválení');
                                                        const isPerms = log.action.includes('oprávnění');
                                                        const isPass = log.action.includes('hesla');

                                                        return (
                                                            <div key={log.id} className="p-3 border-b border-border/40 hover:bg-muted/[0.04] flex items-center justify-between gap-4 last:border-0 group transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
                                                                        isAccess ? "bg-amber-500/10 text-amber-600" :
                                                                            isPerms ? "bg-indigo-500/10 text-indigo-600" :
                                                                                isPass ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"
                                                                    )}>
                                                                        <Clock size={14} />
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <div className="text-xs font-bold text-foreground">
                                                                            {log.action}
                                                                            <span className="text-muted-foreground mx-2 font-normal">→</span>
                                                                            <span className={cn(
                                                                                "font-black uppercase tracking-tighter text-[10px]",
                                                                                isAccess ? "text-amber-600" :
                                                                                    isPerms ? "text-indigo-600" :
                                                                                        isPass ? "text-blue-600" : "text-muted-foreground"
                                                                            )}>
                                                                                {log.target_user_email || 'Systém'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                                                            <span className="font-bold text-muted-foreground/60">{log.admin_email?.split('@')[0]}</span>
                                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                                            {new Date(log.created_at).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {log.details && (
                                                                    <div className="text-[9px] font-mono bg-muted/70 px-2 py-1 rounded text-muted-foreground/80 max-w-[200px] truncate border border-border/20">
                                                                        {log.details}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                <div className="p-16 text-center text-muted-foreground space-y-3">
                                                    <ScrollText size={40} className="mx-auto opacity-10" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-foreground opacity-50 uppercase tracking-widest">Žádné záznamy</p>
                                                        <p className="text-[10px] italic">Zkuste změnit kritéria vyhledávání nebo filtr.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        {/* --- GUEST REQUESTS --- */}
                                        {userRequests.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-500 uppercase tracking-widest pl-1">
                                                    <UserPlus size={14} />
                                                    <span>Nové žádosti o přístup</span>
                                                </div>

                                                <div className="divide-y divide-border border rounded-2xl overflow-hidden bg-amber-500/[0.02] border-amber-500/20">
                                                    {userRequests.map((request) => (
                                                        <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-500/[0.05] transition-colors">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-foreground">{request.email}</span>
                                                                    <span className={cn(
                                                                        "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md",
                                                                        request.request_type === 'access' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-amber-500/10 text-amber-600'
                                                                    )}>
                                                                        {request.request_type === 'access' ? 'Přístup' : 'Reset hesla'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                                    <Clock size={10} />
                                                                    {new Date(request.created_at).toLocaleDateString('cs-CZ')}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => request.request_type === 'access' ? openApproveModal(request) : processUserRequest(request.id, 'processed')}
                                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-amber-500/20 active:scale-95"
                                                                    title="Schválit žádost"
                                                                >
                                                                    <CheckCircle size={12} />
                                                                    <span>Schválit</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => processUserRequest(request.id, 'rejected')}
                                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-border/50"
                                                                    title="Zamítnout žádost"
                                                                >
                                                                    <X size={12} />
                                                                    <span>Odmítnout</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* --- USER LIST --- */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <Users size={14} />
                                                    <span>Registrovaní uživatelé</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">CELKEM: {profiles.length}</span>
                                            </div>

                                            <div className="divide-y divide-border border rounded-2xl overflow-hidden bg-muted/5">
                                                {profiles.length > 0 ? (
                                                    profiles.map((profile) => (
                                                        <div key={profile.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors ${(profile.access_requested || profile.password_reset_requested) ? 'bg-amber-500/[0.03] border-l-4 border-l-amber-500' : ''}`}>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-sm font-bold text-foreground">
                                                                        {profile.email}
                                                                    </span>
                                                                    {profile.email === 'jakub.kroca@contsystem.cz' && (
                                                                        <span className="text-[9px] text-primary font-black bg-primary/10 px-1.5 py-0.5 rounded tracking-tighter">MAIN ADMIN</span>
                                                                    )}
                                                                    <div className="flex items-center gap-1.5">
                                                                        {profile.access_requested && (
                                                                            <span className="text-[9px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full uppercase animate-pulse">Request</span>
                                                                        )}
                                                                        {profile.password_reset_requested && (
                                                                            <span className="text-[9px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full uppercase animate-pulse">Reset</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-tighter">ID: {profile.id.slice(0, 18)}...</span>
                                                            </div>

                                                            <div className="flex items-center gap-6 justify-between sm:justify-end">
                                                                {profile.password_reset_requested && (
                                                                    <button
                                                                        onClick={() => resetPasswordRequest(profile.id)}
                                                                        className="text-[10px] font-bold text-blue-600 hover:text-white bg-blue-600/10 hover:bg-blue-600 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-blue-600/20"
                                                                        title="Potvrdit dokončení resetu hesla"
                                                                    >
                                                                        <CheckCircle size={10} />
                                                                        Reset hotov
                                                                    </button>
                                                                )}

                                                                <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Import</span>
                                                                    <button
                                                                        onClick={() => updatePermission(profile.id, !profile.can_import)}
                                                                        disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                                        className={`relative w-8 h-4.5 rounded-full transition-all duration-300 ${profile.can_import ? 'bg-emerald-500' : 'bg-gray-300'} ${profile.email === 'jakub.kroca@contsystem.cz' ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                                                                        title={`Oprávnění k importu: ${profile.can_import ? 'Povoleno' : 'Zakázáno'}`}
                                                                    >
                                                                        <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 ${profile.can_import ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    onClick={() => openPermissionsModal(profile)}
                                                                    disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                                    className={`p-2 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20 ${profile.email === 'jakub.kroca@contsystem.cz' ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
                                                                    title="Upravit systémová oprávnění"
                                                                >
                                                                    <Shield size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-sm text-muted-foreground italic">Žádní uživatelé k zobrazení.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-border bg-muted/5 flex justify-end shrink-0">
                                <button
                                    onClick={() => setShowAdminPanel(false)}
                                    className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                                    title="Zavřít administrátorský panel"
                                >
                                    Zavřít panel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Stats / Future overview (outside the main container for aesthetic) */}
                <div className="max-w-2xl mx-auto w-full pb-20">
                    <div className="flex flex-col items-center justify-center p-16 bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/40 text-center space-y-5 shadow-xl">
                        <div className="p-5 bg-primary/5 rounded-3xl text-primary/30 ring-1 ring-primary/10">
                            <Clock size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Přehled aktivit</h3>
                            <p className="text-sm text-muted-foreground/60 italic max-w-xs mx-auto font-medium">
                                Zde se brzy zobrazí detailní přehled vašich přiřazených úkolů a projektů.
                            </p>
                        </div>
                        <div className="pt-4 flex gap-4">
                            <div className="px-4 py-2 bg-muted/30 rounded-2xl border border-border/40">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Projekty</p>
                                <p className="text-2xl font-black text-foreground">--</p>
                            </div>
                            <div className="px-4 py-2 bg-muted/30 rounded-2xl border border-border/40">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Úkoly</p>
                                <p className="text-2xl font-black text-foreground">--</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {approveModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Schválit přístup</h3>
                            <button onClick={() => setApproveModalOpen(false)} className="p-1 hover:bg-muted rounded-full" title="Zavřít okno">
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Vytvořte účet pro uživatele <strong>{selectedRequest.email}</strong>.
                        </div>

                        <form onSubmit={confirmApproval} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Heslo pro uživatele</label>
                                <div className="relative">
                                    <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                        minLength={6}
                                        title="Zadejte heslo pro nového uživatele"
                                        placeholder="Nové heslo"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1">Heslo sdělte uživateli bezpečně.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setApproveModalOpen(false)}
                                    className="px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg"
                                    title="Zrušit schvalování"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessingApproval}
                                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                                    title="Vytvořit účet a schválit přístup"
                                >
                                    {isProcessingApproval ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={14} />}
                                    Vytvořit účet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Permissions Modal */}
            {permissionsModalOpen && selectedUserForPermissions && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm border border-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div>
                                <h3 className="text-lg font-bold">Oprávnění uživatele</h3>
                                <p className="text-xs text-muted-foreground font-mono mt-1">{selectedUserForPermissions.email}</p>
                            </div>
                            <button onClick={() => setPermissionsModalOpen(false)} className="p-1 hover:bg-muted rounded-full" title="Zavřít okno">
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'timeline', label: 'Timeline (Kalendář)' },
                                { key: 'projects', label: 'Zakázky (Projekty)', isParent: true },
                                { key: 'projects_civil', label: 'Civilní projekty', isSub: true },
                                { key: 'projects_military', label: 'Armádní projekty', isSub: true },
                                { key: 'service', label: 'Servisní projekty', isSub: true },
                                { key: 'production', label: 'Výroba' },
                                { key: 'purchasing', label: 'Nákup' },
                            ].map(({ key, label, isParent, isSub }) => (
                                <div
                                    key={key}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                                        isParent ? "bg-primary/5 border-primary/20 mt-2" :
                                            isSub ? "bg-muted/10 border-border/10 ml-6 scale-[0.98]" :
                                                "bg-muted/30 border-border/30"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {isSub && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                                        <span className={cn(
                                            "text-sm",
                                            isParent ? "font-bold text-primary" : "font-medium"
                                        )}>
                                            {label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setEditedPermissions(prev => ({ ...prev, [key]: !prev[key] }))}
                                        className={`relative w-10 h-6 rounded-full transition-all duration-200 ${editedPermissions[key] ? 'bg-primary' : 'bg-gray-400'}`}
                                        title={`Přepnout oprávnění: ${label}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${editedPermissions[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                            <button
                                onClick={() => setPermissionsModalOpen(false)}
                                className="px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg"
                                title="Zrušit změny"
                            >
                                Zrušit
                            </button>
                            <button
                                onClick={async () => {
                                    if (updateUserPermissions) {
                                        setIsSavingPermissions(true);
                                        const success = await updateUserPermissions(selectedUserForPermissions.id, editedPermissions);
                                        if (success) {
                                            setPermissionsModalOpen(false);
                                        }
                                        setIsSavingPermissions(false);
                                    }
                                }}
                                disabled={isSavingPermissions}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                                title="Uložit změny oprávnění"
                            >
                                {isSavingPermissions ? <Loader2 size={12} className="animate-spin" /> : <Shield size={14} />}
                                Uložit změny
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
