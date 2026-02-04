'use client';

import React from 'react';

export default function TimelinePage() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="dashboard-container">
      <header className="mb-8">
        <h1>Timeline</h1>
        <p>Časový přehled zakázek a výrobních procesů.</p>
      </header>

      <div className="card-glass">
        <div className="table-header-actions" style={{ justifyContent: 'center', background: '#f8fafc' }}>
          <span className="font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>Února 2026</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="project-table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ minWidth: '200px', borderRight: '1px solid var(--border-light)' }}>Projekty / Zakázky</th>
                {days.map(day => (
                  <th key={day} style={{ textAlign: 'center', padding: '10px', fontSize: '10px', minWidth: '40px' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ borderRight: '1px solid var(--border-light)', fontWeight: '600' }}>📁 FCC</td>
                {days.map(day => (
                  <td key={day} style={{ padding: 0, borderRight: '1px solid #f1f5f9', height: '60px', position: 'relative' }}>
                    {day === 4 && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '0',
                        width: '150%',
                        height: '30px',
                        background: '#3b82f6',
                        borderRadius: '20px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        zIndex: 10
                      }}>
                        FCC
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}
