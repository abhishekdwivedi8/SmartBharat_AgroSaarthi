-- Create cache table for AI Insights
CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  state TEXT NOT NULL,
  market_advisory JSONB,
  crop_advisories JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- Policies: public read and insert (cache is non-sensitive)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights_cache' AND policyname = 'Anyone can view ai insights cache'
  ) THEN
    CREATE POLICY "Anyone can view ai insights cache"
    ON public.ai_insights_cache
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_insights_cache' AND policyname = 'Anyone can insert ai insights cache'
  ) THEN
    CREATE POLICY "Anyone can insert ai insights cache"
    ON public.ai_insights_cache
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Index for fast lookups by crop/state
CREATE INDEX IF NOT EXISTS ai_insights_cache_crop_state_idx ON public.ai_insights_cache (crop, state);
