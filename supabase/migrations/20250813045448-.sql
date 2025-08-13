-- Tighten RLS on crop_analysis: restrict access to authenticated owners only
-- Remove public/null access paths by recreating policies without user_id IS NULL

-- Ensure RLS is enabled
ALTER TABLE public.crop_analysis ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'crop_analysis' AND policyname = 'Users can create crop analysis'
  ) THEN
    DROP POLICY "Users can create crop analysis" ON public.crop_analysis;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'crop_analysis' AND policyname = 'Users can view their own crop analysis'
  ) THEN
    DROP POLICY "Users can view their own crop analysis" ON public.crop_analysis;
  END IF;
END
$$;

-- Recreate strict policies
CREATE POLICY "Users can create crop analysis"
ON public.crop_analysis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own crop analysis"
ON public.crop_analysis
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
