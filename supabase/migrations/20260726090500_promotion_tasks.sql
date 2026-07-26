CREATE TABLE public.promotion_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotion_tasks TO authenticated;
GRANT ALL ON public.promotion_tasks TO service_role;

ALTER TABLE public.promotion_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view promotion_tasks"
  ON public.promotion_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert promotion_tasks"
  ON public.promotion_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update promotion_tasks"
  ON public.promotion_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete promotion_tasks"
  ON public.promotion_tasks FOR DELETE TO authenticated USING (true);
