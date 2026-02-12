-- Create app_settings table
create table if not exists public.app_settings (
    id text primary key,
    settings jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now(),
    updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.app_settings enable row level security;

-- Everyone authenticated can read settings
create policy "Anyone authenticated can view settings"
on public.app_settings for select
to authenticated
using (true);

-- Only admins can modify settings
create policy "Only admins can modify settings"
on public.app_settings for all
to authenticated
using (
    auth.jwt() ->> 'email' = 'jakub.kroca@contsystem.cz'
)
with check (
    auth.jwt() ->> 'email' = 'jakub.kroca@contsystem.cz'
);

-- Insert default timeline settings
insert into public.app_settings (id, settings)
values ('timeline_config', '{
    "colors": {
        "phaseInitial": {"color": "#bae6fd", "opacity": 0.4, "label": "Zahájení"},
        "phaseMounting": {"color": "#4ade80", "opacity": 0.35, "label": "Příprava"},
        "phaseBufferYellow": {"color": "#facc15", "opacity": 0.5, "label": "Montáž"},
        "phaseBufferOrange": {"color": "#fb923c", "opacity": 0.55, "label": "Revize"},
        "phaseService": {"color": "#ce93d8", "opacity": 0.35, "label": "Servis"},
        "milestoneChassis": {"color": "#f97316", "opacity": 1, "label": "Podvozek", "icon": "Truck"},
        "milestoneBody": {"color": "#a855f7", "opacity": 1, "label": "Nástavba", "icon": "Hammer"},
        "milestoneHandover": {"color": "#3b82f6", "opacity": 1, "label": "Předání", "icon": "ThumbsUp"},
        "milestoneDeadline": {"color": "#ef4444", "opacity": 1, "label": "Deadline", "icon": "AlertTriangle"},
        "milestoneServiceStart": {"color": "#ef4444", "opacity": 1, "label": "Zahájení servisu", "icon": "Play"},
        "milestoneServiceEnd": {"color": "#b91c1c", "opacity": 1, "label": "Ukončení servisu", "icon": "Check"}
    },
    "outline": {"enabled": true, "width": 1, "color": "#000000", "opacity": 0.2}
}'::jsonb)
on conflict (id) do nothing;
