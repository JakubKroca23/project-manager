'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { getMappedProjects } from '@/lib/data-utils';
import { Project } from '@/types/project';

type ZoomLevel = 'compact' | 'medium' | 'detailed';

export default function TimelinePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const projects = useMemo(() => getMappedProjects(), []);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('medium');

  // Konfigurace šířky podle zoomu
  const zoomWidths: Record<ZoomLevel, number> = {
    compact: 28,
    medium: 45,
    detailed: 75
  };

  const dayWidth = zoomWidths[zoomLevel];

  // Generování dat pro celý rok 2026
  const currentYear = new Date().getFullYear();
  const today = new Date();

  const calendarData = useMemo(() => {
    const dates = [];
    const start = new Date(currentYear, 0, 1);
    const end = new Date(currentYear, 11, 31);

    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [currentYear]);

  // Automatický scroll na dnešní den
  useEffect(() => {
    if (scrollContainerRef.current) {
      const todayElement = scrollContainerRef.current.querySelector('.current-day-header');
      if (todayElement) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const elementLeft = (todayElement as HTMLElement).offsetLeft;
        const elementWidth = (todayElement as HTMLElement).offsetWidth;

        // Offset pro sticky sloupec (250px)
        const stickyOffset = 250;

        scrollContainerRef.current.scrollLeft = (elementLeft - stickyOffset) - (containerWidth / 2) + (elementWidth / 2) + stickyOffset;
      }
    }
  }, [calendarData, zoomLevel]);

  const isSameDay = (d1: Date, d2Str?: string) => {
    if (!d2Str || d2Str === "-") return false;
    const d2 = new Date(d2Str);
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return months[monthIndex];
  };

  return (
    <div className="dashboard-container">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Timeline {currentYear}</h1>
          <p className="text-secondary text-sm">Časový přehled všech zakázek a termínů.</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Zoom Controls */}
          <div className="zoom-controls">
            {(['compact', 'medium', 'detailed'] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={`zoom-btn ${zoomLevel === level ? 'active' : ''}`}
              >
                {level === 'compact' ? 'Malé' : level === 'medium' ? 'Střední' : 'Velké'}
              </button>
            ))}
          </div>

          {/* Legenda */}
          <div className="flex gap-4 text-xs font-bold mb-1">
            <div className="flex items-center gap-1"><span className="milestone-dot dot-chassis dot-medium" style={{ cursor: 'default' }}></span> Podvozek</div>
            <div className="flex items-center gap-1"><span className="milestone-dot dot-body dot-medium" style={{ cursor: 'default' }}></span> Nástavba</div>
            <div className="flex items-center gap-1"><span className="milestone-dot dot-handover dot-medium" style={{ cursor: 'default' }}></span> Předání</div>
          </div>
        </div>
      </header>

      <div className="timeline-container" ref={scrollContainerRef}>
        <table className="timeline-table">
          <thead>
            <tr>
              <th rowSpan={2}>Projekty / Zakázky</th>
              {calendarData.map((date, idx) => {
                const isFirstDayOfMonth = date.getDate() === 1;
                const monthDays = calendarData.filter(d => d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()).length;

                if (isFirstDayOfMonth) {
                  return (
                    <th
                      key={`month-${date.getMonth()}`}
                      colSpan={monthDays}
                      className="month-name-header month-divider"
                    >
                      {getMonthName(date.getMonth())}
                    </th>
                  );
                }
                return null;
              })}
            </tr>
            <tr>
              {calendarData.map((date, idx) => {
                const isToday = isSameDay(date, today.toISOString());
                const isFirstDay = date.getDate() === 1;

                return (
                  <th
                    key={idx}
                    style={{ width: dayWidth, minWidth: dayWidth }}
                    className={`day-cell ${isToday ? 'current-day-header' : ''} ${isFirstDay ? 'month-divider' : ''}`}
                  >
                    {date.getDate()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="timeline-project-name">{project.name}</div>
                  <div className="timeline-project-id">{project.id} | {project.customer}</div>
                </td>
                {calendarData.map((date, idx) => {
                  const isToday = isSameDay(date, today.toISOString());
                  const isFirstDay = date.getDate() === 1;

                  const hasChassis = isSameDay(date, project.chassis_delivery);
                  const hasBody = isSameDay(date, project.body_delivery);
                  const hasHandover = isSameDay(date, project.customer_handover);
                  const hasClosed = isSameDay(date, project.closed_at);

                  return (
                    <td
                      key={idx}
                      style={{ width: dayWidth, minWidth: dayWidth }}
                      className={`day-cell ${isToday ? 'current-day-col' : ''} ${isFirstDay ? 'month-divider' : ''}`}
                    >
                      <div className="milestone-wrapper">
                        {hasChassis && <div className={`milestone-dot dot-chassis dot-${zoomLevel}`} title="Dodání podvozku"></div>}
                        {hasBody && <div className={`milestone-dot dot-body dot-${zoomLevel}`} title="Dodání nástavby"></div>}
                        {hasHandover && <div className={`milestone-dot dot-handover dot-${zoomLevel}`} title="Předání zákazníkovi"></div>}
                        {hasClosed && <div className={`milestone-dot dot-closed dot-${zoomLevel}`} title="Uzavřeno"></div>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
