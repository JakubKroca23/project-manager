export default function ServisPage() {
    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '20px' }}>
                <h1>Servis</h1>
                <p>Správa servisních zakázek</p>
            </header>
            <div className="card-glass" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Připravujeme</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Tato sekce je momentálně ve vývoji.</p>
            </div>
        </div>
    );
}
