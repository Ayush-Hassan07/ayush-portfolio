-- Convert legacy local/API-hosted media URLs to deployment-safe relative paths.
UPDATE public.project
SET image_url = regexp_replace(image_url, '^https?://[^/]+(/media/[a-f0-9-]+\.webp)$', '\\1')
WHERE image_url ~ '^https?://[^/]+/media/[a-f0-9-]+\.webp$';

UPDATE public.certification
SET image_url = regexp_replace(image_url, '^https?://[^/]+(/media/[a-f0-9-]+\.webp)$', '\\1')
WHERE image_url IS NOT NULL
  AND image_url ~ '^https?://[^/]+/media/[a-f0-9-]+\.webp$';
