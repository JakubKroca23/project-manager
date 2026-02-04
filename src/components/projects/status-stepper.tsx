"use client"

import { motion } from "framer-motion"
import { Check, Circle } from "lucide-react"

const steps = [
    { id: "planning", label: "Nový projekt" },
    { id: "development", label: "Vývoj" },
    { id: "production", label: "Výroba" },
    { id: "completed", label: "Dokončeno" },
]

interface StatusStepperProps {
    currentStatus: string
    onStatusChange?: (status: string) => void
    readOnly?: boolean
}

export function StatusStepper({ currentStatus, onStatusChange, readOnly = true }: StatusStepperProps) {
    const currentIndex = steps.findIndex(s => s.id === currentStatus)

    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between">
                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-border/50 -z-10" />

                {/* Progress Line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                    className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isActive = index === currentIndex
                    const isLast = index === steps.length - 1

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                            <motion.button
                                disabled={readOnly}
                                onClick={() => onStatusChange?.(step.id)}
                                whileHover={!readOnly ? { scale: 1.1 } : {}}
                                whileTap={!readOnly ? { scale: 0.95 } : {}}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${isCompleted ? 'bg-primary border-primary text-white' :
                                        isActive ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' :
                                            'bg-background border-border text-muted-foreground'}
                                    ${!readOnly ? 'cursor-pointer' : 'cursor-default'}
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                )}
                            </motion.button>

                            <div className="flex flex-col items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
