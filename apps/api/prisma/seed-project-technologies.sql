-- Idempotent technology/skill mapping and project relationship seed.
-- Run after add-technology-skill.sql as the PostgreSQL table owner.

INSERT INTO public.technology (name, category)
VALUES
  ('PHP', 'Programming Language'),
  ('MySQL', 'Database'),
  ('HTML', 'Web Technology'),
  ('CSS', 'Web Technology'),
  ('Bootstrap', 'Framework'),
  ('JavaScript', 'Programming Language'),
  ('Java', 'Programming Language'),
  ('Java Swing', 'Desktop UI Framework')
ON CONFLICT (name) DO NOTHING;

UPDATE public.technology t SET skill_id = s.id
FROM public.skill s WHERE t.name = s.name AND t.skill_id IS NULL;
UPDATE public.technology t SET skill_id = s.id
FROM public.skill s WHERE t.name = 'MySQL' AND s.name = 'SQL' AND t.skill_id IS NULL;
UPDATE public.technology t SET skill_id = s.id
FROM public.skill s WHERE t.name = 'Java Swing' AND s.name = 'Java' AND t.skill_id IS NULL;

INSERT INTO public.project_technology (project_id, technology_id)
SELECT p.id, t.id FROM public.project p CROSS JOIN public.technology t
WHERE p.id = 'd284d4e4-6bce-4a36-adca-8290db1065da'
  AND t.name IN ('PHP','MySQL','HTML','CSS','Bootstrap','JavaScript')
ON CONFLICT (project_id, technology_id) DO NOTHING;

INSERT INTO public.project_technology (project_id, technology_id)
SELECT p.id, t.id FROM public.project p CROSS JOIN public.technology t
WHERE p.id = '917da245-2a3f-4735-9079-34b2daf1663a'
  AND t.name IN ('PHP','MySQL','HTML','CSS','Bootstrap')
ON CONFLICT (project_id, technology_id) DO NOTHING;

INSERT INTO public.project_technology (project_id, technology_id)
SELECT p.id, t.id FROM public.project p CROSS JOIN public.technology t
WHERE p.id = 'a713d31d-520b-477c-8488-dd9acf81e4f7'
  AND t.name IN ('PHP','MySQL','HTML','CSS','Bootstrap')
ON CONFLICT (project_id, technology_id) DO NOTHING;

INSERT INTO public.project_technology (project_id, technology_id)
SELECT p.id, t.id FROM public.project p CROSS JOIN public.technology t
WHERE p.id = '1e16b064-1f13-4249-9654-cbdc87d09c34'
  AND t.name IN ('Java','Java Swing')
ON CONFLICT (project_id, technology_id) DO NOTHING;
