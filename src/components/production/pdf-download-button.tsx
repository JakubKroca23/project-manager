"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { JobCardPdf } from "./pdf-document"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PdfDownloadButtonProps {
    order: any
    tasks: any[]
    bomItems: any[]
    fileName?: string
}

export function PdfDownloadButton({ order, tasks, bomItems, fileName = "job-card.pdf" }: PdfDownloadButtonProps) {
    // If data is loading or missing, disable button?
    // For now assume data is passed correctly.

    return (
        <PDFDownloadLink
            document={<JobCardPdf order={order} tasks={tasks} bomItems={bomItems} />}
            fileName={fileName}
        >
            {/* @ts-ignore - render props signature issue in some versions */}
            {({ blob, url, loading, error }) => (
                <Button variant="outline" size="sm" disabled={loading}>
                    <Printer className="w-4 h-4 mr-2" />
                    {loading ? "Generuji..." : "Stáhnout PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
