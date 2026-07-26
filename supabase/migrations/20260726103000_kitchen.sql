CREATE TABLE public.kitchen_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kitchen_experiments TO authenticated;
GRANT ALL ON public.kitchen_experiments TO service_role;

ALTER TABLE public.kitchen_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view kitchen_experiments"
  ON public.kitchen_experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert kitchen_experiments"
  ON public.kitchen_experiments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update kitchen_experiments"
  ON public.kitchen_experiments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete kitchen_experiments"
  ON public.kitchen_experiments FOR DELETE TO authenticated USING (true);

CREATE TABLE public.kitchen_freezer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kitchen_freezer_items TO authenticated;
GRANT ALL ON public.kitchen_freezer_items TO service_role;

ALTER TABLE public.kitchen_freezer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view kitchen_freezer_items"
  ON public.kitchen_freezer_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert kitchen_freezer_items"
  ON public.kitchen_freezer_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update kitchen_freezer_items"
  ON public.kitchen_freezer_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete kitchen_freezer_items"
  ON public.kitchen_freezer_items FOR DELETE TO authenticated USING (true);
