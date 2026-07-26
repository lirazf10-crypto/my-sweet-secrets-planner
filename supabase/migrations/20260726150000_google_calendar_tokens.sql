CREATE TABLE public.google_calendar_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refresh_token TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_calendar_tokens TO authenticated;
GRANT ALL ON public.google_calendar_tokens TO service_role;

ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view google_calendar_tokens"
  ON public.google_calendar_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert google_calendar_tokens"
  ON public.google_calendar_tokens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update google_calendar_tokens"
  ON public.google_calendar_tokens FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete google_calendar_tokens"
  ON public.google_calendar_tokens FOR DELETE TO authenticated USING (true);
