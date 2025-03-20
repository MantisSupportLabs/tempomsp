CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';

alter publication supabase_realtime add table companies;