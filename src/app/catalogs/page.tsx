import { CatalogsClient } from './catalogs-client'
import { PageContainer } from "@/components/layout/PageContainer"

export const metadata = {
    title: 'Katalogy | ProjectManager',
    description: 'Správa katalogů klientů, nástaveb a příslušenství',
}

export default function CatalogsPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold mb-8">Katalogy</h1>
            <CatalogsClient />
        </PageContainer>
    )
}
