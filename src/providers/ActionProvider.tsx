'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActionContextType {
    onFit: (() => void) | null;
    setOnFit: (fn: (() => void) | null) => void;
    onImport: (() => void) | null;
    setOnImport: (fn: (() => void) | null) => void;
    isImportWizardOpen: boolean;
    setIsImportWizardOpen: (open: boolean) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export function ActionProvider({ children }: { children: ReactNode }) {
    const [onFit, setOnFit] = useState<(() => void) | null>(null);
    const [onImport, setOnImport] = useState<(() => void) | null>(null);
    const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

    return (
        <ActionContext.Provider value={{
            onFit, setOnFit,
            onImport, setOnImport,
            isImportWizardOpen, setIsImportWizardOpen
        }}>
            {children}
        </ActionContext.Provider>
    );
}

export function useActions() {
    const context = useContext(ActionContext);
    if (context === undefined) {
        throw new Error('useActions must be used within an ActionProvider');
    }
    return context;
}
