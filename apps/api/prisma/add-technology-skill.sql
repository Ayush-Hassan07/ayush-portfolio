ALTER TABLE public.technology
  ADD COLUMN IF NOT EXISTS skill_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_technology_skill') THEN
    ALTER TABLE public.technology
      ADD CONSTRAINT fk_technology_skill FOREIGN KEY (skill_id)
      REFERENCES public.skill(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS technology_skill_id_idx ON public.technology(skill_id);
