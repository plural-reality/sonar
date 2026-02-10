-- Add key_questions field to presets table
-- Stores an array of macro-level questions (キークエスチョン) as JSONB
-- These are auto-generated from purpose/background and can be manually edited
ALTER TABLE presets ADD COLUMN key_questions JSONB DEFAULT '[]'::jsonb;

-- Add key_questions to sessions so they inherit from presets at session creation time
ALTER TABLE sessions ADD COLUMN key_questions JSONB DEFAULT '[]'::jsonb;

-- Update the create_preset_with_token function to accept key_questions
CREATE OR REPLACE FUNCTION create_preset_with_token(
    p_slug TEXT,
    p_title TEXT,
    p_purpose TEXT,
    p_background_text TEXT DEFAULT NULL,
    p_report_instructions TEXT DEFAULT NULL,
    p_og_title TEXT DEFAULT NULL,
    p_og_description TEXT DEFAULT NULL,
    p_key_questions JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
    slug TEXT,
    admin_token UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_preset_id UUID;
    new_admin_token UUID;
BEGIN
    -- Insert preset
    INSERT INTO presets (slug, title, purpose, background_text, report_instructions, og_title, og_description, key_questions)
    VALUES (p_slug, p_title, p_purpose, p_background_text, p_report_instructions, p_og_title, p_og_description, p_key_questions)
    RETURNING presets.id INTO new_preset_id;

    -- Insert admin token
    INSERT INTO preset_admin_tokens (preset_id)
    VALUES (new_preset_id)
    RETURNING preset_admin_tokens.admin_token INTO new_admin_token;

    RETURN QUERY SELECT p_slug, new_admin_token;
END;
$$;
