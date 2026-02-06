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

  // Pomocná funkce pro parsování data (použitá v řazení)
  const parseDateForSort = (dStr?: string) => {
    if (!dStr || dStr === "-") return 0;
    const parts = dStr.split('.');
    if (parts.length !== 3) return 0;
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
  };

  // Filtrované a seřazené projekty
  const sortedProjects = useMemo(() => {
    const todayNum = new Date().getTime();

    // 1. Filtrace
    let result = [...projects];
    if (searchQuery) {
      result = result.filter((project: Project) =>
        (project.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.customer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (project.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    // 2. Kategorizace a výpočet vah pro řazení
    return result.sort((a, b) => {
      const getPriority = (p: Project) => {
        const dChassis = parseDateForSort(p.chassis_delivery);
        const dBody = parseDateForSort(p.body_delivery);
        const dHandover = parseDateForSort(p.customer_handover);
        const lastMain = Math.max(dChassis, dBody);

        // Fialová - Předáno (nejnižší priorita)
        if (dHandover > 0 && todayNum > dHandover) return 3;

        // Červená - Zpožděné (střední priorita)
        const dPost21 = lastMain + (21 * 24 * 60 * 60 * 1000);
        if (lastMain > 0 && todayNum > dPost21 && dHandover === 0) return 2;

        // Aktivní (nejvyšší priorita)
        return 1;
      };

      const prioA = getPriority(a);
      const prioB = getPriority(b);

      if (prioA !== prioB) return prioA - prioB;

      // V rámci stejné priority řadit podle nejnovějšího data
      const getMaxDate = (p: Project) => Math.max(
        parseDateForSort(p.customer_handover),
        parseDateForSort(p.body_delivery),
        parseDateForSort(p.chassis_delivery),
        parseDateForSort(p.closed_at)
      );

      return getMaxDate(b) - getMaxDate(a);
    });
  }, [projects, searchQuery]);

  // Konfigurace šířky podle zoomu
  const zoomWidths: Record<ZoomLevel, number> = {
    compact: 5,
    medium: 20,
    detailed: 28
  };

  const dayWidth = zoomWidths[zoomLevel];
  const hideDayNumbers = dayWidth < 18;

  const today = new Date();

  // Generování dat pro roky 2025 - 2026
  const calendarData = useMemo(() => {
    const dates = [];
    const start = new Date(2025, 0, 1);
    const end = new Date(2026, 11, 31);

    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

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
        <div className="search-in-table" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              className="text-secondary"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Hledat..."
              className="table-search-input"
              style={{ paddingLeft: '40px', width: '250px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="timeline-legend">
            <div className="legend-section">
              <div className="legend-item"><div className="legend-box range-green"></div><span>Příprava</span></div>
              <div className="legend-item"><div className="legend-box range-yellow"></div><span>Montáž</span></div>
              <div className="legend-item"><div className="legend-box range-orange"></div><span>Finále</span></div>
              <div className="legend-item"><div className="legend-box range-red"></div><span>Zpoždění</span></div>
              <div className="legend-item"><div className="legend-box range-purple"></div><span>Předáno</span></div>
            </div>
            <div className="legend-divider"></div>
            <div className="legend-section">
              <div className="legend-item"><div className="legend-line line-closed"></div><span>Uzavřeno</span></div>
              <div className="legend-item"><div className="legend-line line-chassis"></div><span>Podvozek</span></div>
              <div className="legend-item"><div className="legend-line line-body"></div><span>Nástavba</span></div>
              <div className="legend-item"><div className="legend-line line-handover"></div><span>Předání</span></div>
            </div>
          </div>
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
                  const monthName = getMonthName(date.getMonth());
                  const displayMonth = date.getMonth() === 0 ? `${monthName} ${date.getFullYear()}` : monthName;

                  return (
                    <th
                      key={`month-${date.getFullYear()}-${date.getMonth()}`}
                      colSpan={monthDays}
                      className="month-name-header month-divider"
                    >
                      {displayMonth}
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
            {sortedProjects.map((project: Project) => (
              <tr key={project.id}>
                {(() => {
                  // Výpočet stavu pro levý sloupec (Dnes)
                  const todayNum = new Date().getTime();
                  const dChassis = parseDateForSort(project.chassis_delivery);
                  const dBody = parseDateForSort(project.body_delivery);
                  const dHandover = parseDateForSort(project.customer_handover);
                  const dClosed = parseDateForSort(project.closed_at);
                  const lastMain = Math.max(dChassis, dBody);

                  let statusClass = '';

                  if (dHandover > 0 && todayNum > dHandover) {
                    statusClass = 'range-purple';
                  } else if (lastMain > 0 && todayNum > (lastMain + 21 * 24 * 60 * 60 * 1000) && dHandover === 0) {
                    statusClass = 'range-red';
                  } else if (lastMain > 0 && todayNum > (lastMain + 14 * 24 * 60 * 60 * 1000)) {
                    statusClass = 'range-orange';
                  } else if (lastMain > 0 && todayNum > lastMain) {
                    statusClass = 'range-yellow';
                  } else if (dClosed > 0 && todayNum >= dClosed && todayNum <= (lastMain || todayNum)) {
                    statusClass = 'range-green';
                  }

                  return (
                    <td className={statusClass}>
                      <div className="timeline-project-name">{project.name}</div>
                      {zoomLevel !== 'compact' && (
                        <div className="timeline-project-id">{project.id} | {project.customer}</div>
                      )}
                    </td>
                  );
                })()}
                {calendarData.map((date, idx) => {
                  const isToday = isSameDay(date, today.toLocaleDateString('cs-CZ'));
                  const isFirstDay = date.getDate() === 1;

                  const hasChassis = isSameDay(date, project.chassis_delivery);
                  const hasBody = isSameDay(date, project.body_delivery);
                  const hasHandover = isSameDay(date, project.customer_handover);
                  const hasClosed = isSameDay(date, project.closed_at);

                  // Výpočet rozsahů pro grid
                  const dChassisTimestamp = parseDateForSort(project.chassis_delivery);
                  const dBodyTimestamp = parseDateForSort(project.body_delivery);
                  const dHandoverTimestamp = parseDateForSort(project.customer_handover);
                  const dClosedTimestamp = parseDateForSort(project.closed_at);

                  const dCh = dChassisTimestamp ? new Date(dChassisTimestamp) : null;
                  const dBo = dBodyTimestamp ? new Date(dBodyTimestamp) : null;
                  const dCl = dClosedTimestamp ? new Date(dClosedTimestamp) : null;

                  let isInRangeGreen = false;  // M0 (Closed) -> max(M1, M2)
                  let isInRangeYellow = false; // max(M1, M2) -> +14 dní
                  let isInRangeOrange = false; // +14 dní -> +21 dní
                  let isInRangeRed = false;    // +21 dní -> Předání / Dnes

                  const lastM = (dCh && dBo)
                    ? new Date(Math.max(dCh.getTime(), dBo.getTime()))
                    : (dCh || dBo || null);

                  if (dCl && lastM) {
                    if (date >= dCl && date <= lastM) {
                      isInRangeGreen = true;
                    }
                  }

                  if (lastM) {
                    const dP14 = new Date(lastM);
                    dP14.setDate(dP14.getDate() + 14);

                    const dP21 = new Date(dP14);
                    dP21.setDate(dP21.getDate() + 7);

                    const dHan = dHandoverTimestamp ? new Date(dHandoverTimestamp) : null;
                    const gridEndDate = dHan || today;

                    if (date > lastM && date <= dP14) {
                      isInRangeYellow = true;
                    } else if (date > dP14 && date <= dP21) {
                      isInRangeOrange = true;
                    } else if (date > dP21 && date <= gridEndDate) {
                      isInRangeRed = true;
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
                    isInRangeYellow ? 'range-yellow' : '',
                    isInRangeOrange ? 'range-orange' : '',
                    isInRangeRed ? 'range-red' : ''
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
