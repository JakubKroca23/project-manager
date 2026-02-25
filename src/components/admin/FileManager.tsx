'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    FileText,
    Trash2,
    Download,
    Loader2,
    Search,
    RefreshCcw,
    ExternalLink,
    AlertCircle,
    Calendar,
    HardDrive,
    Info
} from 'lucide-react';
import { toast } from 'sonner';

interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        size: number;
        mimetype: string;
    };
}

export function FileManager() {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            // Supabase storage list doesn't recurse easily without a path
            // We'll try to list all contents. If we have a folder structure, 
            // we might need to crawl it or use a different approach.
            // For now, we'll list the root and common folder patterns.

            const { data: rootFiles, error: rootError } = await supabase.storage
                .from('drawings')
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'desc' },
                });

            if (rootError) throw rootError;

            // Since we use ${project_id}/${filename}, we need to list folders too
            const allFiles: StorageFile[] = [];

            // Filter out folders (which don't have metadata in some supabase versions, or check for mimetype)
            const folders = rootFiles?.filter(f => !f.metadata) || [];
            const filesInRoot = rootFiles?.filter(f => f.metadata) || [];

            allFiles.push(...(filesInRoot as any));

            // Fetch files from subfolders (projects)
            for (const folder of folders) {
                const { data: subFiles } = await supabase.storage
                    .from('drawings')
                    .list(folder.name);

                if (subFiles) {
                    allFiles.push(...subFiles.map(f => ({
                        ...f,
                        name: `${folder.name}/${f.name}`
                    })) as any);
                }
            }

            setFiles(allFiles);
        } catch (error: any) {
            console.error('Error fetching files:', error);
            toast.error('Nepodařilo se načíst seznam souborů.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDelete = async (path: string) => {
        if (!confirm(`Opravdu chcete smazat soubor "${path}"? Tato akce je nevratná.`)) return;

        setDeleting(path);
        try {
            const { error } = await supabase.storage
                .from('drawings')
                .remove([path]);

            if (error) throw error;

            setFiles(prev => prev.filter(f => f.name !== path));
            toast.success('Soubor byl smazán.');
        } catch (error: any) {
            toast.error('Chyba při mazání souboru.');
        } finally {
            setDeleting(null);
        }
    };

    const handleDownload = async (path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('drawings')
                .createSignedUrl(path, 60); // 1 minute link

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (error) {
            // Fallback to getting public URL if signed fails
            const { data } = supabase.storage.from('drawings').getPublicUrl(path);
            if (data?.publicUrl) {
                window.open(data.publicUrl, '_blank');
            } else {
                toast.error('Nepodařilo se vygenerovat odkaz ke stažení.');
            }
        }
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                        type="text"
                        placeholder="Hledat soubor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border/40 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={fetchFiles}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-border/40"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                        <span>Aktualizovat</span>
                    </button>
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2">
                        <HardDrive size={12} />
                        <span>{files.length} SOUBORŮ</span>
                    </div>
                </div>
            </div>

            {/* File List */}
            <div className="bg-background/50 border border-border/40 rounded-2xl overflow-hidden shadow-sm">
                {loading && files.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest">Načítám úložiště...</p>
                    </div>
                ) : filteredFiles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border/40">
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Název souboru / Cesta</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Velikost</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vytvořeno</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Akce</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {filteredFiles.map((file) => (
                                    <tr key={file.name} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-foreground line-clamp-1 break-all">{file.name}</span>
                                                    <span className="text-[9px] text-muted-foreground/60 font-mono tracking-tighter">ID: {file.id || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                {file.metadata ? formatSize(file.metadata.size) : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <Calendar size={10} />
                                                {new Date(file.created_at || file.updated_at).toLocaleDateString('cs-CZ')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleDownload(file.name)}
                                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all active:scale-90"
                                                    title="Stáhnout / Zobrazit"
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.name)}
                                                    disabled={deleting === file.name}
                                                    className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all active:scale-90 disabled:opacity-50"
                                                    title="Smazat ze serveru"
                                                >
                                                    {deleting === file.name ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                        <AlertCircle size={40} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">
                            {searchTerm ? 'Nebyly nalezeny žádné odpovídající soubory' : 'V úložišti nejsou žádné nahrané soubory'}
                        </p>
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4 items-start">
                <div className="p-2 bg-primary/10 rounded-xl text-primary mt-1">
                    <Info size={16} />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-primary italic lowercase">Informace pro správce:</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Zde vidíte všechny soubory nahrané v systému. Soubory jsou uloženy v bucketu <code className="bg-primary/5 px-1 rounded text-primary font-mono text-[9px]">drawings</code>.
                        Cesta začíná ID zakázky (např. <code className="bg-primary/5 px-1 rounded text-primary font-mono text-[9px]">K2024-001/</code>).
                        Smazáním souboru zde jej trvale odstraníte z cloudu, ale odkaz v detailu zakázky může zůstat nefunkční, pokud jej nesmažete i v editaci zakázky.
                    </p>
                </div>
            </div>
        </div>
    );
}
