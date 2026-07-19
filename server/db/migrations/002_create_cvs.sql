-- CV Drafts
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  access_token_hash TEXT, -- SHA-256 hash of the anonymous access token
  title TEXT DEFAULT 'My Resume',
  personal_data JSONB NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_cvs_user_id ON cvs(user_id);

-- Index for cleaning up anonymous CVs that have not been updated for 3 days
CREATE INDEX idx_cvs_anonymous_updated_at ON cvs(updated_at) WHERE user_id IS NULL;