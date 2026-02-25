'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActionContextType {
    onFit: (() => void) | null;
    setOnFit: (fn: (() => void) | null) => void;
    onJumpToToday: (() => void) | null;
    setOnJumpToToday: (fn: (() => void) | null) => void;
    onZoomIn: (() => void) | null;
    setOnZoomIn: (fn: (() => void) | null) => void;
    onZoomOut: (() => void) | null;
    setOnZoomOut: (fn: (() => void) | null) => void;
    onToggleDesign: (() => void) | null;
    setOnToggleDesign: (fn: (() => void) | null) => void;
    dayWidth: number;
    setDayWidth: (w: number) => void;
    isImportWizardOpen: boolean;
    setIsImportWizardOpen: (open: boolean) => void;
    customToolbar: ReactNode | null;
    setCustomToolbar: (content: ReactNode | null) => void;
    customLeftContent: ReactNode | null;
    setCustomLeftContent: (content: ReactNode | null) => void;
    detailInfo: ReactNode | null;
    setDetailInfo: (content: ReactNode | null) => void;
    detailActions: ReactNode | null;
    setDetailActions: (content: ReactNode | null) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export function ActionProvider({ children }: { children: ReactNode }) {
    const [onFit, setOnFit] = useState<(() => void) | null>(null);
    const [onJumpToToday, setOnJumpToToday] = useState<(() => void) | null>(null);
    const [onZoomIn, setOnZoomIn] = useState<(() => void) | null>(null);
    const [onZoomOut, setOnZoomOut] = useState<(() => void) | null>(null);
    const [onToggleDesign, setOnToggleDesign] = useState<(() => void) | null>(null);
    const [dayWidth, setDayWidth] = useState(25);
    const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
    const [customToolbar, setCustomToolbar] = useState<ReactNode | null>(null);
    const [customLeftContent, setCustomLeftContent] = useState<ReactNode | null>(null);
    const [detailInfo, setDetailInfo] = useState<ReactNode | null>(null);
    const [detailActions, setDetailActions] = useState<ReactNode | null>(null);

    return (
        <ActionContext.Provider value={{
            onFit, setOnFit,
            onJumpToToday, setOnJumpToToday,
            onZoomIn, setOnZoomIn,
            onZoomOut, setOnZoomOut,
            onToggleDesign, setOnToggleDesign,
            dayWidth, setDayWidth,
            isImportWizardOpen, setIsImportWizardOpen,
            customToolbar, setCustomToolbar,
            customLeftContent, setCustomLeftContent,
            detailInfo, setDetailInfo,
            detailActions, setDetailActions
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
