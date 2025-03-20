-- Fix companies table migration
-- Remove the line that adds companies to realtime publication since it's already there

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
