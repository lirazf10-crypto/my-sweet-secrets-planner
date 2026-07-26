CREATE TABLE public.home_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_tasks TO authenticated;
GRANT ALL ON public.home_tasks TO service_role;

ALTER TABLE public.home_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view home_tasks"
  ON public.home_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert home_tasks"
  ON public.home_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update home_tasks"
  ON public.home_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete home_tasks"
  ON public.home_tasks FOR DELETE TO authenticated USING (true);
