"use client";

import { useState } from "react";
import { toggleApproval, updateRole } from "@/app/admin/users/actions";
import { Loader2, Check, X, Shield, ShieldAlert, User } from "lucide-react";

interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
    is_approved: boolean | null;
    created_at: string;
}

export function UserTable({ profiles }: { profiles: Profile[] }) {
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        setLoadingIds(prev => ({ ...prev, [id]: true }));
        await toggleApproval(id, !currentStatus);
        setLoadingIds(prev => ({ ...prev, [id]: false }));
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        setLoadingIds(prev => ({ ...prev, [id]: true }));
        await updateRole(id, newRole);
        setLoadingIds(prev => ({ ...prev, [id]: false }));
    };

    return (
        <div className="rounded-md border bg-card">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Uživatel</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stav</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Akce</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {profiles.map((profile) => (
                            <tr key={profile.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle font-medium">{profile.full_name || "Neznámý"}</td>
                                <td className="p-4 align-middle">{profile.email}</td>
                                <td className="p-4 align-middle">
                                    <select
                                        value={profile.role}
                                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                        disabled={loadingIds[profile.id]}
                                        className="bg-transparent border rounded p-1 text-xs"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="p-4 align-middle">
                                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${profile.is_approved ? 'border-transparent bg-green-500/15 text-green-600' : 'border-transparent bg-yellow-500/15 text-yellow-600'}`}>
                                        {profile.is_approved ? "Schváleno" : "Čeká"}
                                    </div>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <button
                                        onClick={() => handleToggleApproval(profile.id, profile.is_approved || false)}
                                        disabled={loadingIds[profile.id]}
                                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${profile.is_approved ? 'hover:bg-destructive/10 text-destructive' : 'hover:bg-green-500/10 text-green-600'}`}
                                    >
                                        {loadingIds[profile.id] ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : profile.is_approved ? (
                                            <span className="flex items-center gap-1"><X className="h-4 w-4" /> Zablokovat</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Schválit</span>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
