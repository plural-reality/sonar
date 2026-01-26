-- Add reframing phase to questions table
ALTER TABLE questions DROP CONSTRAINT questions_phase_check;
ALTER TABLE questions ADD CONSTRAINT questions_phase_check CHECK (phase IN ('exploration', 'deep-dive', 'reframing'));
