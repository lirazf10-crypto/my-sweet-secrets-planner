CREATE TABLE public.office_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.office_tasks TO authenticated;
GRANT ALL ON public.office_tasks TO service_role;

ALTER TABLE public.office_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view office_tasks"
  ON public.office_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert office_tasks"
  ON public.office_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update office_tasks"
  ON public.office_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete office_tasks"
  ON public.office_tasks FOR DELETE TO authenticated USING (true);
