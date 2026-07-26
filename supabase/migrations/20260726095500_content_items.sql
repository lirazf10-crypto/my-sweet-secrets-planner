CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  hook TEXT,
  storyboard TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'idea'
    CHECK (status IN ('idea', 'in_progress', 'ready', 'posted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view content_items"
  ON public.content_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert content_items"
  ON public.content_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update content_items"
  ON public.content_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete content_items"
  ON public.content_items FOR DELETE TO authenticated USING (true);
