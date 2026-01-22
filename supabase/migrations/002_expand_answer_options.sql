ALTER TABLE answers
  DROP CONSTRAINT IF EXISTS answers_selected_option_check;

ALTER TABLE answers
  ADD CONSTRAINT answers_selected_option_check
  CHECK (selected_option >= 0 AND selected_option <= 4);
