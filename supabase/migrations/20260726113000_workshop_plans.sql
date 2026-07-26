CREATE TABLE public.workshop_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_plans TO authenticated;
GRANT ALL ON public.workshop_plans TO service_role;

ALTER TABLE public.workshop_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view workshop_plans"
  ON public.workshop_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert workshop_plans"
  ON public.workshop_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update workshop_plans"
  ON public.workshop_plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete workshop_plans"
  ON public.workshop_plans FOR DELETE TO authenticated USING (true);

CREATE TABLE public.workshop_plan_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_plan_id UUID NOT NULL REFERENCES public.workshop_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_plan_ideas TO authenticated;
GRANT ALL ON public.workshop_plan_ideas TO service_role;

ALTER TABLE public.workshop_plan_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view workshop_plan_ideas"
  ON public.workshop_plan_ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert workshop_plan_ideas"
  ON public.workshop_plan_ideas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update workshop_plan_ideas"
  ON public.workshop_plan_ideas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete workshop_plan_ideas"
  ON public.workshop_plan_ideas FOR DELETE TO authenticated USING (true);
