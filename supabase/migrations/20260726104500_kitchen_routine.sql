CREATE TABLE public.kitchen_routine_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kitchen_routine_tasks TO authenticated;
GRANT ALL ON public.kitchen_routine_tasks TO service_role;

ALTER TABLE public.kitchen_routine_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view kitchen_routine_tasks"
  ON public.kitchen_routine_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert kitchen_routine_tasks"
  ON public.kitchen_routine_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update kitchen_routine_tasks"
  ON public.kitchen_routine_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete kitchen_routine_tasks"
  ON public.kitchen_routine_tasks FOR DELETE TO authenticated USING (true);
