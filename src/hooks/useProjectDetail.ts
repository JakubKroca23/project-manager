import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project, Milestone } from '@/types/project';
import { usePermissions } from '@/hooks/usePermissions';

export function useProjectDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [subProjects, setSubProjects] = useState<Project[]>([]);
    const [loadingMilestones, setLoadingMilestones] = useState(true);
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ name: '', date: '', status: 'pending', icon: 'Milestone' });
    const { canEdit } = usePermissions();

    const fetchSubProjects = useCallback(async () => {
        if (!id) return;
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('parent_id', id)
            .order('name', { ascending: true });

        if (!error) {
            setSubProjects(data || []);
        }
    }, [id]);

    const fetchProject = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching project:', error);
        } else {
            setProject(data);
            setEditedProject(data);
        }
        setLoading(false);
    }, [id]);

    const fetchMilestones = useCallback(async () => {
        if (!id) return;
        setLoadingMilestones(true);
        const { data, error } = await supabase
            .from('project_milestones')
            .select('*')
            .eq('project_id', id)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching milestones:', error);
        } else {
            setMilestones(data || []);
        }
        setLoadingMilestones(false);
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchProject();
            fetchMilestones();
            fetchSubProjects();
        }
    }, [id, fetchProject, fetchMilestones, fetchSubProjects]);

    const handleDeleteProject = async () => {
        if (!project) return;
        if (!confirm('VAROVÁNÍ: Opravdu smazat tuto zakázku? Tato akce je nevratná.')) return;

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id);

            if (error) throw error;
            router.push('/projekty');
        } catch (err: any) {
            console.error('Error deleting project:', err);
            alert('Chyba při mazání zakázky: ' + err.message);
        }
    };

    const handleDeleteSubProject = async (subId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Opravdu odstranit toto vozidlo?')) return;

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', subId);

            if (error) throw error;
            fetchSubProjects();
        } catch (err: any) {
            console.error('Error deleting sub-project:', err);
            alert('Chyba při mazání vozidla: ' + err.message);
        }
    };

    const handleAddMilestone = async () => {
        if (!newMilestone.name || !newMilestone.date) {
            alert('Vyplňte název a datum milníku.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('project_milestones')
                .insert({
                    project_id: id,
                    name: newMilestone.name,
                    date: newMilestone.date,
                    status: newMilestone.status,
                    icon: newMilestone.icon
                })
                .select()
                .single();

            if (error) throw error;

            setMilestones(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setNewMilestone({ name: '', date: '', status: 'pending', icon: 'Milestone' });
            setIsAddingMilestone(false);
        } catch (err) {
            console.error('Error adding milestone:', err);
            alert('Chyba při přidávání milníku.');
        }
    };

    const handleToggleMilestoneStatus = async (milestone: Milestone) => {
        const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
        try {
            const { error } = await supabase
                .from('project_milestones')
                .update({ status: newStatus })
                .eq('id', milestone.id);

            if (error) throw error;

            setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, status: newStatus } : m));
        } catch (err) {
            console.error('Error updating milestone status:', err);
            alert('Chyba při aktualizaci stavu milníku.');
        }
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        if (!confirm('Opravdu smazat tento milník?')) return;
        try {
            const { error } = await supabase
                .from('project_milestones')
                .delete()
                .eq('id', milestoneId);

            if (error) throw error;

            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
        } catch (err) {
            console.error('Error deleting milestone:', err);
            alert('Chyba při mazání milníku.');
        }
    };

    const validateProject = (proj: Project): { isValid: boolean, missing: string[] } => {
        const missing = [];
        if (!proj.name) missing.push('Název zakázky');
        if (!proj.customer) missing.push('Zákazník');
        if (!proj.manager) missing.push('Vedoucí projektu');
        if (!proj.priority) missing.push('Priorita');
        if (!proj.category) missing.push('Kategorie');
        if (!proj.abra_project) missing.push('Abra Zakázka');

        return { isValid: missing.length === 0, missing };
    };

    const handleSave = async () => {
        if (!editedProject || !project) return;

        if (editedProject.status === 'Aktivní' && project.status !== 'Aktivní') {
            const { isValid, missing } = validateProject(editedProject);
            if (!isValid) {
                alert(`Nelze aktivovat zakázku. Chybí tato pole:\n- ${missing.join('\n- ')}`);
                return;
            }
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userName = user?.email?.split('@')[0] || 'Neznámý';

            const updates = {
                ...editedProject,
                last_modified_by: userName,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', project.id);

            if (error) throw error;

            setProject(updates);
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving project:', err);
            alert('Chyba při ukládání změn.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProject(project);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Project, value: any) => {
        if (!editedProject) return;
        setEditedProject({ ...editedProject, [field]: value });
    };

    const handleCustomFieldChange = (key: string, value: any) => {
        if (!editedProject) return;
        setEditedProject({
            ...editedProject,
            custom_fields: {
                ...editedProject.custom_fields,
                [key]: value
            }
        });
    };

    const addCustomField = () => {
        const name = prompt("Název nového pole:");
        if (name && editedProject) {
            handleCustomFieldChange(name, "-");
        }
    };

    const removeCustomField = (key: string) => {
        if (!editedProject || !confirm(`Opravdu smazat pole "${key}"?`)) return;
        const newFields = { ...editedProject.custom_fields };
        delete newFields[key];
        setEditedProject({ ...editedProject, custom_fields: newFields });
    };

    return {
        id,
        project,
        loading,
        isEditing,
        setIsEditing,
        editedProject,
        saving,
        milestones,
        setMilestones,
        subProjects,
        loadingMilestones,
        isAddingMilestone,
        setIsAddingMilestone,
        newMilestone,
        setNewMilestone,
        canEdit,
        handleDeleteProject,
        handleDeleteSubProject,
        handleAddMilestone,
        handleToggleMilestoneStatus,
        handleDeleteMilestone,
        handleSave,
        handleCancel,
        handleChange,
        handleCustomFieldChange,
        addCustomField,
        removeCustomField,
        fetchSubProjects
    };
}
