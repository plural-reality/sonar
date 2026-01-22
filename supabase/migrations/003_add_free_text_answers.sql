ALTER TABLE answers
  ADD COLUMN IF NOT EXISTS free_text TEXT;

ALTER TABLE answers
  DROP CONSTRAINT IF EXISTS answers_selected_option_check;

ALTER TABLE answers
  ADD CONSTRAINT answers_selected_option_check
  CHECK (selected_option >= 0 AND selected_option <= 5);

ALTER TABLE answers
  DROP CONSTRAINT IF EXISTS answers_free_text_check;

ALTER TABLE answers
  ADD CONSTRAINT answers_free_text_check
  CHECK (
    (selected_option = 5 AND free_text IS NOT NULL AND length(trim(free_text)) > 0)
    OR (selected_option <> 5 AND free_text IS NULL)
  );
