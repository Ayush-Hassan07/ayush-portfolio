-- Correct legacy values produced by the earlier cleanup expression.
-- This only rewrites the URL prefix; it does not rename or delete files.
UPDATE public.project
SET image_url = regexp_replace(image_url, '^https?://[^/]+/media/', '/media/')
WHERE image_url ~ '^https?://[^/]+/media/[a-f0-9-]+\.webp$';

UPDATE public.project
SET image_url = NULL
WHERE image_url = '\\1';
