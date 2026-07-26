CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view customers"
  ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert customers"
  ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update customers"
  ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete customers"
  ON public.customers FOR DELETE TO authenticated USING (true);

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  delivery_date DATE,
  price NUMERIC CHECK (price IS NULL OR price >= 0),
  status TEXT NOT NULL DEFAULT 'pending_deposit'
    CHECK (status IN ('pending_deposit', 'in_progress', 'ready', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view orders"
  ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert orders"
  ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can update orders"
  ON public.orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can delete orders"
  ON public.orders FOR DELETE TO authenticated USING (true);
