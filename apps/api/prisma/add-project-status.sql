ALTER TABLE project
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'draft';

ALTER TABLE project
  DROP CONSTRAINT IF EXISTS project_status_check;

ALTER TABLE project
  ADD CONSTRAINT project_status_check
  CHECK (status IN ('draft', 'planned', 'ongoing', 'finished', 'paused', 'archived'));
