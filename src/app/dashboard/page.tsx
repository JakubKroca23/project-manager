export default function DashboardPage() {
    return (
        <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    Welcome to Contsystem PM
                </h3>
                <p className="text-sm text-muted-foreground">
                    Select a project from the sidebar or creating a new one to get started.
                </p>
            </div>
        </div>
    )
}
