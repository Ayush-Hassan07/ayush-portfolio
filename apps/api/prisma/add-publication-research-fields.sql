ALTER TABLE public.publication
  ADD COLUMN IF NOT EXISTS repository_url TEXT;
