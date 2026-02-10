'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SortingState, VisibilityState, ColumnSizingState } from '@tanstack/react-table';

interface TableSettings {
    columnOrder: string[];
    columnVisibility: VisibilityState;
    sorting: SortingState;
    columnSizing: ColumnSizingState;
}

const DEFAULT_SETTINGS: TableSettings = {
    columnOrder: [],
    columnVisibility: {},
    sorting: [],
    columnSizing: {},
};

export function useTableSettings(tableId: string) {
    const [settings, setSettings] = useState<TableSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const settingsRef = useRef<TableSettings>(DEFAULT_SETTINGS);

    // Load settings from Supabase
    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoaded(true);
                    return;
                }

                const { data, error } = await supabase
                    .from('user_table_settings')
                    .select('column_order, column_visibility, sorting, column_sizing')
                    .eq('user_id', user.id)
                    .eq('table_id', tableId)
                    .single();

                if (data && !error) {
                    const loaded: TableSettings = {
                        columnOrder: data.column_order || [],
                        columnVisibility: (data.column_visibility as VisibilityState) || {},
                        sorting: (data.sorting as SortingState) || [],
                        columnSizing: (data.column_sizing as ColumnSizingState) || {},
                    };
                    setSettings(loaded);
                    settingsRef.current = loaded;
                }
            } catch (err) {
                console.error('Failed to load table settings:', err);
            } finally {
                setIsLoaded(true);
            }
        }
        load();
    }, [tableId]);

    // Save settings to Supabase (debounced)
    const saveToSupabase = useCallback(async (newSettings: TableSettings) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('user_table_settings')
                .upsert({
                    user_id: user.id,
                    table_id: tableId,
                    column_order: newSettings.columnOrder,
                    column_visibility: newSettings.columnVisibility,
                    sorting: newSettings.sorting,
                    column_sizing: newSettings.columnSizing,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,table_id' });
        } catch (err) {
            console.error('Failed to save table settings:', err);
        }
    }, [tableId]);

    const debouncedSave = useCallback((newSettings: TableSettings) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveToSupabase(newSettings);
        }, 1000);
    }, [saveToSupabase]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const updateSettings = useCallback((partial: Partial<TableSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...partial };
            settingsRef.current = next;
            debouncedSave(next);
            return next;
        });
    }, [debouncedSave]);

    const setColumnOrder = useCallback((order: string[]) => {
        updateSettings({ columnOrder: order });
    }, [updateSettings]);

    const setColumnVisibility = useCallback((visibility: VisibilityState) => {
        updateSettings({ columnVisibility: visibility });
    }, [updateSettings]);

    const setSorting = useCallback((sorting: SortingState) => {
        updateSettings({ sorting });
    }, [updateSettings]);

    const setColumnSizing = useCallback((sizing: ColumnSizingState) => {
        updateSettings({ columnSizing: sizing });
    }, [updateSettings]);

    return {
        columnOrder: settings.columnOrder,
        columnVisibility: settings.columnVisibility,
        sorting: settings.sorting,
        columnSizing: settings.columnSizing,
        setColumnOrder,
        setColumnVisibility,
        setSorting,
        setColumnSizing,
        isLoaded,
    };
}
