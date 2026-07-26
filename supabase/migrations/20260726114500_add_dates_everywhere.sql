ALTER TABLE public.promotion_tasks ADD COLUMN due_date DATE;
ALTER TABLE public.promotion_tasks ADD COLUMN start_time TIME;
ALTER TABLE public.promotion_tasks ADD COLUMN end_time TIME;

ALTER TABLE public.kitchen_experiments ADD COLUMN due_date DATE;
ALTER TABLE public.kitchen_experiments ADD COLUMN start_time TIME;
ALTER TABLE public.kitchen_experiments ADD COLUMN end_time TIME;

ALTER TABLE public.kitchen_routine_tasks ADD COLUMN due_date DATE;
ALTER TABLE public.kitchen_routine_tasks ADD COLUMN start_time TIME;
ALTER TABLE public.kitchen_routine_tasks ADD COLUMN end_time TIME;

ALTER TABLE public.home_tasks ADD COLUMN due_date DATE;
ALTER TABLE public.home_tasks ADD COLUMN start_time TIME;
ALTER TABLE public.home_tasks ADD COLUMN end_time TIME;

ALTER TABLE public.content_items ADD COLUMN due_date DATE;
ALTER TABLE public.content_items ADD COLUMN start_time TIME;
ALTER TABLE public.content_items ADD COLUMN end_time TIME;

ALTER TABLE public.orders ADD COLUMN start_time TIME;
ALTER TABLE public.orders ADD COLUMN end_time TIME;
