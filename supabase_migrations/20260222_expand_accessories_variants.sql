-- Add variants to accessory_catalog
ALTER TABLE public.accessory_catalog ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Add custom_variant to project_items
ALTER TABLE public.project_items ADD COLUMN IF NOT EXISTS variant TEXT;
