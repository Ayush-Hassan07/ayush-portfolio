CREATE TABLE IF NOT EXISTS public.project_media (
  project_id UUID NOT NULL,
  media_id UUID NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT project_media_pkey PRIMARY KEY (project_id, media_id),
  CONSTRAINT fk_project_media_project FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_media_asset FOREIGN KEY (media_id) REFERENCES public.media_asset(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS project_media_media_id_idx ON public.project_media(media_id);
