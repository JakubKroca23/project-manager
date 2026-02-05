'use client';


import React, { useEffect, useRef, useMemo, useState } from 'react';
import { getMappedProjects } from '@/lib/data-utils';
import { Project } from '@/types/project';
import { Search } from 'lucide-react';

type ZoomLevel = 'compact' | 'medium' | 'detailed';

export default function TimelinePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const projects = useMemo(() => getMappedProjects(), []);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('medium');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrované projekty podle vyhledávání
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter((project: Project) =>
      (project.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (project.customer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (project.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Konfigurace šířky podle zoomu
  const zoomWidths: Record<ZoomLevel, number> = {
    compact: 5,
    medium: 20,
    detailed: 28
  };

  const dayWidth = zoomWidths[zoomLevel];
  const hideDayNumbers = dayWidth < 18;

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

        // Offset pro sticky sloupec (180px)
        const stickyOffset = 180;

        scrollContainerRef.current.scrollLeft = (elementLeft - stickyOffset) - (containerWidth / 2) + (elementWidth / 2) + stickyOffset;
      }
    }
  }, [calendarData, zoomLevel]);

  const isSameDay = (d1: Date, d2Str?: string) => {
    if (!d2Str || d2Str === "-") return false;
    // Parse Czech date format DD.MM.YYYY
    const parts = d2Str.split('.');
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
    const year = parseInt(parts[2], 10);
    return d1.getDate() === day &&
      d1.getMonth() === month &&
      d1.getFullYear() === year;
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
      <div className="table-header-actions" style={{ marginBottom: '1rem' }}>
        <div className="search-in-table" style={{ position: 'relative' }}>
          <Search
            size={16}
            className="text-secondary"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Hledat zakázky, zákazníky, kódy..."
            className="table-search-input"
            style={{ paddingLeft: '40px', width: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
      </div>

      <div className="timeline-container" ref={scrollContainerRef}>
        <table className={`timeline-table timeline-zoom-${zoomLevel}`}>
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
                const isToday = isSameDay(date, today.toLocaleDateString('cs-CZ'));
                const isFirstDay = date.getDate() === 1;

                return (
                  <th
                    key={idx}
                    style={{ width: dayWidth, minWidth: dayWidth }}
                    className={`day-cell ${isToday ? 'current-day-header' : ''} ${isFirstDay ? 'month-divider' : ''}`}
                  >
                    {!hideDayNumbers && date.getDate()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="timeline-project-name">{project.name}</div>
                  {zoomLevel !== 'compact' && (
                    <div className="timeline-project-id">{project.id} | {project.customer}</div>
                  )}
                </td>
                {calendarData.map((date, idx) => {
                  const isToday = isSameDay(date, today.toLocaleDateString('cs-CZ'));
                  const isFirstDay = date.getDate() === 1;

                  const hasChassis = isSameDay(date, project.chassis_delivery);
                  const hasBody = isSameDay(date, project.body_delivery);
                  const hasHandover = isSameDay(date, project.customer_handover);
                  const hasClosed = isSameDay(date, project.closed_at);

                  // Výpočet rozsahů
                  const parseDate = (dStr?: string) => {
                    if (!dStr || dStr === "-") return null;
                    const parts = dStr.split('.');
                    if (parts.length !== 3) return null;
                    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                  };

                  const dChassis = parseDate(project.chassis_delivery);
                  const dBody = parseDate(project.body_delivery);
                  const dClosed = parseDate(project.closed_at);

                  let isInRangeGreen = false; // M0 (Closed) -> min(M1, M2)
                  let isInRangeBlue = false;  // min(M1, M2) -> max(M1, M2)
                  let isInRangeYellow = false; // max(M1, M2) -> 14 dní po

                  if (dClosed && (dChassis || dBody)) {
                    const firstMilestone = dChassis && dBody
                      ? new Date(Math.min(dChassis.getTime(), dBody.getTime()))
                      : (dChassis || dBody)!;

                    if (date >= dClosed && date < firstMilestone) {
                      isInRangeGreen = true;
                    }
                  }

                  if (dChassis && dBody) {
                    const start = new Date(Math.min(dChassis.getTime(), dBody.getTime()));
                    const end = new Date(Math.max(dChassis.getTime(), dBody.getTime()));
                    if (date >= start && date <= end) {
                      isInRangeBlue = true;
                    }
                  }

                  const lastMainMilestone = dChassis && dBody
                    ? new Date(Math.max(dChassis.getTime(), dBody.getTime()))
                    : (dChassis || dBody);

                  if (lastMainMilestone) {
                    const dPost14 = new Date(lastMainMilestone);
                    dPost14.setDate(dPost14.getDate() + 14);
                    if (date > lastMainMilestone && date <= dPost14) {
                      isInRangeYellow = true;
                    }
                  }

                  const events = [];
                  if (hasChassis) events.push("Podvozek");
                  if (hasBody) events.push("Nástavba");
                  if (hasHandover) events.push("Předání");
                  if (hasClosed) events.push("Uzavřeno");

                  const tooltip = events.length > 0
                    ? `${date.toLocaleDateString('cs-CZ')}: ${events.join(", ")}`
                    : `${date.toLocaleDateString('cs-CZ')}`;

                  const cellClasses = [
                    'day-cell',
                    isToday ? 'current-day-col' : '',
                    isFirstDay ? 'month-divider' : '',
                    isInRangeGreen ? 'range-green' : '',
                    isInRangeBlue ? 'range-blue' : '',
                    isInRangeYellow ? 'range-yellow' : ''
                  ].filter(Boolean).join(' ');

                  return (
                    <td
                      key={idx}
                      style={{ width: dayWidth, minWidth: dayWidth }}
                      className={cellClasses}
                      title={tooltip}
                    >
                      <div className="milestone-wrapper">
                        {hasChassis && <div className="milestone-line line-chassis"></div>}
                        {hasBody && <div className="milestone-line line-body"></div>}
                        {hasHandover && <div className="milestone-line line-handover"></div>}
                        {hasClosed && <div className="milestone-line line-closed"></div>}
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
