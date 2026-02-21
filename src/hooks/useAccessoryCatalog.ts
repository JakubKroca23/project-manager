'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AccessoryCatalogItem } from '@/types/project';

export function useAccessoryCatalog() {
    const [items, setItems] = useState<AccessoryCatalogItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('accessory_catalog')
            .select('*')
            .order('name', { ascending: true });

        if (!error) {
            setItems(data || []);
        }
        setLoading(false);
    };

    const addItem = async (item: Partial<AccessoryCatalogItem>) => {
        const { data, error } = await supabase
            .from('accessory_catalog')
            .insert({
                ...item,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (!error && data) {
            setItems(prev => [...prev, data]);
            return data;
        }
        return null;
    };

    const updateItem = async (id: string, updates: Partial<AccessoryCatalogItem>) => {
        const { error } = await supabase
            .from('accessory_catalog')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (!error) {
            setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
            return true;
        }
        return false;
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase
            .from('accessory_catalog')
            .delete()
            .eq('id', id);

        if (!error) {
            setItems(prev => prev.filter(item => item.id !== id));
            return true;
        }
        return false;
    };

    return {
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
        refresh: fetchCatalog
    };
}
