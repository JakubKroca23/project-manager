"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X, Edit2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"

interface EditableFieldProps {
    value: any
    onSave: (newValue: any) => Promise<void>
    label: string
    type?: "text" | "number" | "date" | "textarea"
    canEdit?: boolean
    className?: string
}

export function EditableField({
    value,
    onSave,
    label,
    type = "text",
    canEdit = false,
    className = ""
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [currentValue, setCurrentValue] = useState(value)
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setCurrentValue(value)
    }, [value])

    const handleSave = async () => {
        if (currentValue === value) {
            setIsEditing(false)
            return
        }
        setIsLoading(true)
        try {
            await onSave(currentValue)
            setIsEditing(false)
        } catch (error) {
            console.error(error)
            alert("Chyba při ukládání")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setCurrentValue(value)
        setIsEditing(false)
    }

    if (!canEdit) {
        return (
            <div className={`group border-b border-border/10 pb-2 ${className}`}>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
                <p className="font-bold text-lg">{value || "–"}</p>
            </div>
        )
    }

    return (
        <div className={`group border-b border-border/10 pb-2 transition-colors hover:border-primary/30 ${className}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                {label}
            </label>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            ref={inputRef}
                            type={type === "textarea" ? "text" : type}
                            value={currentValue || ""}
                            onChange={(e) => setCurrentValue(e.target.value)}
                            className="h-9 font-bold text-lg bg-background/50 border-primary/30 focus:ring-primary/20"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') handleCancel()
                            }}
                        />
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between group/val cursor-pointer"
                        onClick={() => setIsEditing(true)}
                    >
                        <p className="font-bold text-lg group-hover:text-primary transition-colors">
                            {value || "–"}
                        </p>
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/val:opacity-100 transition-opacity" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
