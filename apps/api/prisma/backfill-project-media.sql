INSERT INTO public.project_media (project_id, media_id, sort_order, is_primary)
SELECT p.id, m.id, 0, true
FROM public.project p
JOIN public.media_asset m
  ON p.image_url = '/media/' || m.storage_key
  OR p.image_url LIKE '%/media/' || m.storage_key
WHERE p.image_url IS NOT NULL
ON CONFLICT (project_id, media_id) DO NOTHING;
