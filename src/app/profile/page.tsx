'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Shield, Moon, Sun, Monitor, Bell, Palette, Settings, Users, Key, AlertTriangle, Clock, KeyRound, CheckCircle, X, UserPlus, Activity, Briefcase, Gamepad2, Save, HardDrive } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAdmin, ADMIN_EMAIL, type UserRequest, type UserProfile } from '@/hooks/useAdmin';
import { approveAccessRequest } from '@/actions/admin';
import { cn } from '@/lib/utils';
import { FileManager } from '@/components/admin/FileManager';

const MaintenanceGameToggle = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSetting = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'maintenance_minigame')
                .maybeSingle();
            if (data?.settings?.enabled) {
                setEnabled(true);
            }
            setLoading(false);
        };
        fetchSetting();
    }, []);

    const toggleGame = async () => {
        const newVal = !enabled;
        setEnabled(newVal);
        const { error } = await supabase
            .from('app_settings')
            .upsert(
                {
                    id: 'maintenance_minigame',
                    settings: { enabled: newVal },
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'id' as any }
            );

        if (error) {
            showToast('Nepodařilo se změnit nastavení minihry', 'error');
            setEnabled(!newVal);
        } else {
            showToast(`Minihra ${newVal ? 'povolena' : 'zakázána'}`, 'success');
        }
    };

    if (loading) return <Loader2 size={16} className="animate-spin text-muted-foreground" />;

    return (
        <button
            onClick={toggleGame}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-indigo-500' : 'bg-gray-400'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${enabled ? 'translate-x-5' : 'translate-x-0'}`}>
                {enabled && <Gamepad2 size={10} className="text-indigo-500" />}
            </div>
        </button>
    );
};

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { profiles, userRequests, currentUserProfile, isAdmin, isLoading, updatePermission, updateUserPermissions, updateRole, resetPasswordRequest, processUserRequest } = useAdmin();

    const [showAdminPanel, setShowAdminPanel] = useState(false);
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
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showFileManager, setShowFileManager] = useState(false);

    // Approval Modal State
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isProcessingApproval, setIsProcessingApproval] = useState(false);

    // Permissions Modal State
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<UserProfile | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<{ [key: string]: boolean }>({});
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    // Maintenance Mode State
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [estimatedEndTime, setEstimatedEndTime] = useState('');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [systemVersion, setSystemVersion] = useState('');
    const [isSavingSystemInfo, setIsSavingSystemInfo] = useState(false);

    useEffect(() => {
        const fetchMaintenance = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'maintenance_mode')
                .maybeSingle();
            const settings = data?.settings as any;
            if (settings?.value === true) {
                setMaintenanceMode(true);
                if (settings?.estimated_end) {
                    const date = new Date(settings.estimated_end);
                    setEstimatedEndTime(date.toTimeString().slice(0, 5));
                }
            }
        };

        const fetchSystemInfo = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'system_info')
                .maybeSingle();
            const settings = data?.settings as any;
            if (settings?.version) {
                setSystemVersion(settings.version);
            }
        };

        fetchMaintenance();
        fetchSystemInfo();
    }, []);

    const saveSystemInfo = async () => {
        setIsSavingSystemInfo(true);
        const { error } = await supabase
            .from('app_settings')
            .upsert(
                {
                    id: 'system_info',
                    settings: { version: systemVersion },
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'id' as any }
            );

        if (error) {
            showToast('Nepodařilo se uložit systémové informace', 'error');
        } else {
            showToast('Systémové informace uloženy', 'success');
        }
        setIsSavingSystemInfo(false);
    };

    const toggleMaintenance = async () => {
        const newVal = !maintenanceMode;

        let ISOEndTime = null;
        if (newVal && estimatedEndTime) {
            const today = new Date();
            const [hours, minutes] = estimatedEndTime.split(':');
            today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            ISOEndTime = today.toISOString();
        }

        setMaintenanceMode(newVal);
        const { error } = await supabase
            .from('app_settings')
            .upsert(
                {
                    id: 'maintenance_mode',
                    settings: {
                        value: newVal,
                        estimated_end: ISOEndTime,
                        started_at: newVal ? new Date().toISOString() : null
                    },
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'id' as any }
            );
        if (error) {
            showToast('Nepodařilo se změnit režim údržby', 'error');
            setMaintenanceMode(!newVal);
        } else {
            showToast(`Režim údržby ${newVal ? 'zapnut' : 'vypnut'}`, 'success');
        }
    };

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

    /**
     * Display a temporary toast message.
     */
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: null }), 3000);
    };

    /**
     * Sign out the current user.
     */
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    /**
     * Toggle browser notifications setting.
     */
    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications_enabled', String(newVal));
    };

    /**
     * Handle user password change.
     */
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
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordStatus({ type: null, message: '' });
                showToast('Heslo bylo úspěšně změněno', 'success');
            }, 1500);
        } catch (error: any) {
            setPasswordStatus({ type: 'error', message: (error as Error).message || 'Chyba při změně hesla.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    /**
     * Open modal to approve a user request.
     */
    const openApproveModal = (request: UserRequest) => {
        setSelectedRequest(request);
        setNewUserPassword(Math.random().toString(36).slice(-8)); // Suggest random password
        setApproveModalOpen(true);
    };

    /**
     * Submit user approval request.
     */
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
                // Force reload to refresh data and clear request
                window.location.reload();
            }
        } catch (err: any) {
            alert((err as Error).message || 'Chyba při schvalování.');
        } finally {
            setIsProcessingApproval(false);
        }
    };

    /**
     * Open permissions management modal for a specific user.
     */
    const openPermissionsModal = (user: UserProfile) => {
        setSelectedUserForPermissions(user);
        // Initialize with existing permissions or defaults (true if undefined)
        setEditedPermissions({
            timeline: user.permissions?.timeline !== false,
            projects_civil: (user.permissions as any)?.projects_civil !== false,
            projects_military: (user.permissions as any)?.projects_military !== false,
            service: user.permissions?.service !== false,
            can_bulk_delete: (user.permissions as any)?.can_bulk_delete === true,
            is_manager: (user.permissions as any)?.is_manager === true,
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
                                {currentUserProfile.permissions?.is_manager && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-blue-600 px-2.5 py-1 rounded-md w-fit uppercase tracking-widest shadow-sm">
                                        <Briefcase size={10} />
                                        <span>Vedoucí zakázky</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0 sm:pt-1 w-full sm:w-40">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all font-bold text-[10px] shadow-md shadow-rose-600/20 active:scale-[0.98] uppercase tracking-wider w-full"
                            >
                                <LogOut size={12} />
                                <span>Odhlásit se</span>
                            </button>
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl transition-all font-bold text-[10px] border border-border uppercase tracking-wider w-full"
                            >
                                <Settings size={12} />
                                <span>Nastavení</span>
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-1.5 text-muted-foreground/60 hover:text-foreground rounded-lg transition-all font-bold text-[9px] uppercase tracking-wider w-full"
                            >
                                <KeyRound size={10} />
                                <span>Změnit heslo</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowSettingsModal(false)}
                    />
                    <div className="relative w-full h-[100dvh] sm:h-auto max-w-2xl bg-card border-t sm:border border-border rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col sm:max-h-[90vh] animate-in slide-in-from-bottom duration-500 sm:duration-300 sm:slide-in-from-none sm:zoom-in-95 fade-in overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                    <Settings size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Nastavení</h3>
                                    <p className="text-xs text-muted-foreground">Přizpůsobte si aplikaci svým potřebám</p>
                                </div>
                            </div>
                            <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
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
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Administrace */}
                                {isAdmin && (
                                    <div className="bg-indigo-500/[0.03] border border-indigo-500/20 rounded-2xl p-5 space-y-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                            <Shield size={16} />
                                            <span>Administrace</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowSettingsModal(false);
                                                    setShowAdminPanel(true);
                                                }}
                                                className="w-full flex items-center justify-between bg-white dark:bg-muted/30 px-4 py-3 rounded-xl border border-indigo-500/10 hover:bg-indigo-500/5 transition-colors"
                                            >
                                                <div className="text-left space-y-0.5">
                                                    <p className="text-[11px] font-bold text-foreground">Správa systému</p>
                                                    <p className="text-[10px] text-muted-foreground">Uživatelé a oprávnění</p>
                                                </div>
                                                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                                                    <Activity size={14} />
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowSettingsModal(false);
                                                    setShowFileManager(true);
                                                }}
                                                className="w-full flex items-center justify-between bg-white dark:bg-muted/30 px-4 py-3 rounded-xl border border-indigo-500/10 hover:bg-indigo-500/5 transition-colors"
                                            >
                                                <div className="text-left space-y-0.5">
                                                    <p className="text-[11px] font-bold text-foreground">Správce souborů</p>
                                                    <p className="text-[10px] text-muted-foreground">Správa nahraných výkresů v cloudu</p>
                                                </div>
                                                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                                                    <HardDrive size={14} />
                                                </div>
                                            </button>

                                            {currentUserProfile?.email === ADMIN_EMAIL && (
                                                <>
                                                    <div className="bg-white dark:bg-muted/30 p-4 rounded-xl border border-indigo-500/10 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5 pr-4 flex-1">
                                                                <p className="text-[11px] font-bold text-foreground">Verze aplikace</p>
                                                                <input
                                                                    type="text"
                                                                    value={systemVersion}
                                                                    onChange={(e) => setSystemVersion(e.target.value)}
                                                                    placeholder="Např. v1.0.0"
                                                                    className="w-full mt-1.5 bg-muted/50 border border-border/50 rounded-lg px-2 py-1.5 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500/30 outline-none"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={saveSystemInfo}
                                                                disabled={isSavingSystemInfo}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                                            >
                                                                {isSavingSystemInfo ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                                                                Uložit
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-muted/30 p-4 rounded-xl border border-indigo-500/10 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <p className="text-[11px] font-bold text-foreground">Režim údržby</p>
                                                                <p className="text-[10px] text-muted-foreground">Zablokuje přístup pro ostatní</p>
                                                            </div>
                                                            <button
                                                                onClick={toggleMaintenance}
                                                                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${maintenanceMode ? 'bg-orange-500' : 'bg-gray-400'}`}
                                                            >
                                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </button>
                                                        </div>
                                                        {maintenanceMode && (
                                                            <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-4">
                                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Odhadovaný konec:</label>
                                                                <input
                                                                    type="time"
                                                                    value={estimatedEndTime}
                                                                    onChange={(e) => setEstimatedEndTime(e.target.value)}
                                                                    className="bg-muted px-2 py-1 rounded text-[10px] font-bold outline-none border border-border/50"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="bg-white dark:bg-muted/30 p-4 rounded-xl border border-indigo-500/10 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <p className="text-[11px] font-bold text-foreground">Minihra při údržbě</p>
                                                                <MaintenanceGameToggle showToast={showToast} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Panel Popup Modal */}
            {showAdminPanel && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowAdminPanel(false)}
                    />
                    <div className="relative w-full h-[100dvh] sm:h-auto max-w-4xl bg-card border-t sm:border border-border rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col sm:max-h-[90vh] animate-in slide-in-from-bottom duration-500 sm:duration-300 sm:slide-in-from-none sm:zoom-in-95 fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border bg-indigo-500/[0.03]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-600">
                                    <Shield size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Administrační panel</h3>
                                    <p className="text-xs text-muted-foreground">Správa registrovaných uživatelů a přístupů</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAdminPanel(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors group"
                            >
                                <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                                                            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                            request.request_type === 'access' ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                                        )}>
                                                            {request.request_type === 'access' ? 'Přístup' : 'Reset'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium italic">
                                                        <Clock size={10} />
                                                        {new Date(request.created_at).toLocaleString('cs-CZ')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (request.request_type === 'access') {
                                                                openApproveModal(request);
                                                            } else {
                                                                processUserRequest(request.id, 'processed');
                                                            }
                                                        }}
                                                        className="text-[10px] font-bold text-emerald-600 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-emerald-500/20"
                                                    >
                                                        <CheckCircle size={10} />
                                                        Schválit
                                                    </button>
                                                    <button
                                                        onClick={() => processUserRequest(request.id, 'rejected')}
                                                        className="text-[10px] font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-4 py-1.5 rounded-xl transition-all border border-rose-500/20"
                                                    >
                                                        Smazat
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
                                                        >
                                                            <CheckCircle size={10} />
                                                            Reset hotov
                                                        </button>
                                                    )}

                                                    <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Role</span>
                                                        <select
                                                            value={profile.role || 'user'}
                                                            onChange={async (e) => {
                                                                const success = await updateRole(profile.id, e.target.value);
                                                                if (success) showToast('Role byla úspěšně změněna');
                                                                else showToast('Chyba při změně role', 'error');
                                                            }}
                                                            disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                            className="bg-transparent text-[10px] font-bold outline-none cursor-pointer disabled:cursor-not-allowed"
                                                        >
                                                            <option value="user" className="bg-card">USER</option>
                                                            <option value="admin" className="bg-card">ADMIN</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">V. zakázky</span>
                                                        <button
                                                            onClick={async () => {
                                                                const currentPerms = profile.permissions || {};
                                                                const success = await updateUserPermissions(profile.id, {
                                                                    ...currentPerms,
                                                                    is_manager: !currentPerms.is_manager || false
                                                                });
                                                                if (success) showToast('Status vedoucího byl změněn');
                                                                else showToast('Chyba při změně statusu', 'error');
                                                            }}
                                                            className={cn(
                                                                "w-8 h-4 rounded-full transition-all relative",
                                                                profile.permissions?.is_manager ? "bg-blue-600" : "bg-muted-foreground/30"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                                                                profile.permissions?.is_manager ? "right-0.5" : "left-0.5"
                                                            )} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Import</span>
                                                        <button
                                                            onClick={async () => {
                                                                await updatePermission(profile.id, !profile.can_import);
                                                                showToast(`Import byl ${!profile.can_import ? 'povolen' : 'zakázán'}`);
                                                            }}
                                                            disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                            className={`relative w-8 h-4.5 rounded-full transition-all duration-300 ${profile.can_import ? 'bg-emerald-500' : 'bg-gray-300'} ${profile.email === 'jakub.kroca@contsystem.cz' ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}`}
                                                        >
                                                            <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 ${profile.can_import ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => openPermissionsModal(profile)}
                                                        disabled={profile.email === 'jakub.kroca@contsystem.cz'}
                                                        className={`p-2 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20 ${profile.email === 'jakub.kroca@contsystem.cz' ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
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

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border bg-muted/5 flex justify-end">
                            <button
                                onClick={() => setShowAdminPanel(false)}
                                className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                            >
                                Zavřít panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {approveModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Schválit přístup</h3>
                            <button onClick={() => setApproveModalOpen(false)} className="p-1 hover:bg-muted rounded-full">
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Vytvořte účet pro uživatele <strong>{selectedRequest?.email}</strong>.
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
                                        className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm font-mono"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1">Heslo sdělte uživateli bezpečně.</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setApproveModalOpen(false)}
                                    className="px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessingApproval}
                                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2"
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
                                <p className="text-xs text-muted-foreground font-mono mt-1">{selectedUserForPermissions?.email}</p>
                            </div>
                            <button onClick={() => setPermissionsModalOpen(false)} className="p-1 hover:bg-muted rounded-full">
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'timeline', label: 'Timeline (Kalendář)' },
                                { key: 'projects_civil', label: 'Civilní projekty' },
                                { key: 'projects_military', label: 'Vojenské projekty' },
                                { key: 'service', label: 'Servisní projekty' },
                                { key: 'can_bulk_delete', label: 'Hromadné akce (Mazání/Edit)' },
                                { key: 'is_manager', label: 'Vedoucí zakázky' },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between p-3 rounded-xl border transition-all bg-muted/30 border-border/30"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setEditedPermissions(prev => ({ ...prev, [key]: !prev[key] }))}
                                        className={`relative w-10 h-6 rounded-full transition-all duration-200 ${editedPermissions[key] ? 'bg-primary' : 'bg-gray-400'}`}
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
                            >
                                Zrušit
                            </button>
                            <button
                                onClick={async () => {
                                    if (updateUserPermissions && selectedUserForPermissions) {
                                        setIsSavingPermissions(true);
                                        const success = await updateUserPermissions(selectedUserForPermissions.id, editedPermissions);
                                        if (success) {
                                            setPermissionsModalOpen(false);
                                        }
                                        setIsSavingPermissions(false);
                                    }
                                }}
                                disabled={isSavingPermissions}
                                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 flex items-center gap-2"
                            >
                                {isSavingPermissions ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                                Uložit změny
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.type && (
                <div className={cn(
                    "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border transition-all duration-500 animate-in fade-in slide-in-from-bottom-5",
                    toast.type === 'success' ? "bg-emerald-500 border-emerald-400/20 text-white" :
                        toast.type === 'error' ? "bg-red-500 border-red-400/20 text-white" :
                            "bg-blue-500 border-blue-400/20 text-white"
                )}>
                    {toast.type === 'success' && <CheckCircle size={18} />}
                    {toast.type === 'error' && <AlertTriangle size={18} />}
                    {toast.type === 'info' && <Clock size={18} />}
                    <span className="text-sm font-bold tracking-wide">{toast.message}</span>
                    <button onClick={() => setToast({ message: '', type: null })} className="ml-2 hover:opacity-70">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-sm:w-full border border-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div>
                                <h3 className="text-lg font-bold">Změna hesla</h3>
                                <p className="text-xs text-muted-foreground">Zadejte své nové přístupové heslo</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordStatus({ type: null, message: '' });
                                }}
                                className="p-1 hover:bg-muted rounded-full transition-colors"
                            >
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-mono">Nové heslo</label>
                                    <div className="relative">
                                        <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-muted/50 border border-border/40 rounded-xl px-9 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                                            placeholder="Alespoň 6 znaků"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1 font-mono">Potvrzení hesla</label>
                                    <div className="relative">
                                        <CheckCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-muted/50 border border-border/40 rounded-xl px-9 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                                            placeholder="Zopakujte heslo"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {passwordStatus.message && (
                                <div className={cn(
                                    "text-[11px] px-3 py-2 rounded-lg flex items-center gap-2",
                                    passwordStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                )}>
                                    {passwordStatus.type === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                    <span className="font-medium">{passwordStatus.message}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordStatus({ type: null, message: '' });
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                                    className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isChangingPassword ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                    Uložit heslo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* File Manager Modal */}
            {showFileManager && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowFileManager(false)}
                    />
                    <div className="relative w-full h-[100dvh] sm:h-auto max-w-4xl bg-card border-t sm:border border-border rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col sm:max-h-[90vh] animate-in slide-in-from-bottom duration-500 sm:duration-300 sm:slide-in-from-none sm:zoom-in-95 fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border bg-indigo-500/[0.03]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-600">
                                    <HardDrive size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Správce cloudových souborů</h3>
                                    <p className="text-xs text-muted-foreground">Centrální správa všech nahraných příloh</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFileManager(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors group"
                            >
                                <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <FileManager />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border bg-muted/5 flex justify-end">
                            <button
                                onClick={() => setShowFileManager(false)}
                                className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                            >
                                Zavřít
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
