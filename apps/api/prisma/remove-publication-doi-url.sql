UPDATE public.publication
SET paper_url = doi_url
WHERE (paper_url IS NULL OR paper_url = '')
  AND doi_url IS NOT NULL
  AND doi_url <> '';

ALTER TABLE public.publication
  DROP COLUMN IF EXISTS doi_url;
