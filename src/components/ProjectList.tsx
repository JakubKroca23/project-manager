'use client';

import React from 'react';
import { Project, ProjectStatus, ActionNeededBy } from '@/types/project';
import { Calendar, User as UserIcon, ListFilter } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
}

const statusMap: Record<ProjectStatus, { label: string; class: string }> = {
    new: { label: 'NOVÝ PROJEKT', class: 'status-new' },
    development: { label: 'VÝVOJ', class: 'status-development' },
    production: { label: 'VÝROBA', class: 'status-production' },
    completed: { label: 'DOKONČENO', class: 'status-completed' },
    on_hold: { label: 'POZASTAVENO', class: 'status-on_hold' },
    cancelled: { label: 'ZRUŠENO', class: 'status-cancelled' }
};

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
    return (
        <div className="card-glass overflow-visible">
            <div className="table-header-actions">
                <div className="search-in-table">
                    <input type="text" placeholder="Hledat projekty..." className="table-search-input" />
                </div>
                <button className="view-toggle-btn">
                    <ListFilter size={16} />
                    <span>Zobrazení</span>
                </button>
            </div>

            <table className="project-table">
                <thead>
                    <tr>
                        <th>Název Projektu</th>
                        <th>Klient</th>
                        <th>Vedoucí</th>
                        <th>Stav</th>
                        <th>Termín</th>
                        <th>Počet</th>
                        <th>Akce</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project) => (
                        <tr key={project.id}>
                            <td className="font-bold">{project.name}</td>
                            <td className="text-secondary">{project.customer || '-'}</td>
                            <td>
                                <div className="manager-cell">
                                    <div className="manager-avatar">
                                        <UserIcon size={12} />
                                    </div>
                                    <span>{project.manager}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${statusMap[project.status].class}`}>
                                    {statusMap[project.status].label}
                                </span>
                            </td>
                            <td>
                                <div className="deadline-cell">
                                    <Calendar size={14} className="text-secondary" />
                                    <span>{project.deadline || '-'}</span>
                                </div>
                            </td>
                            <td>
                                <span className="font-bold">{project.quantity} ks</span>
                            </td>
                            <td>
                                <div className="action-toggle-container">
                                    <button
                                        className={`action-toggle ${project.action_needed_by === 'internal' ? 'active-internal' : ''}`}
                                        title="Akce od nás"
                                    >
                                        Nás
                                    </button>
                                    <button
                                        className={`action-toggle ${project.action_needed_by === 'external' ? 'active-external' : ''}`}
                                        title="Externí akce"
                                    >
                                        Ext
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="table-footer">
                Celkem {projects.length} položek
            </div>
        </div>
    );
};

export default ProjectList;
