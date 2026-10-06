/*
# Create events, registrations, registration_events tables

## Purpose
Creates the canonical table names (events, registrations, registration_events)
to replace the _new suffixed tables. Copies all existing data from the _new tables.
Does NOT delete or modify the _new tables or any existing data.

## New Tables
- events (same schema as events_new)
- registrations (same schema as registrations_new)
- registration_events (same schema as registration_events_new, with FK to registrations and events)

## Data Migration
- Copies all rows from events_new -> events
- Copies all rows from registrations_new -> registrations
- Copies all rows from registration_events_new -> registration_events
  (re-maps registration_id and event_id UUIDs to the copied rows in the new tables,
   which preserve the same UUIDs)

## Security
- RLS enabled on all three new tables.
- Same anon+authenticated CRUD policies as the _new tables (public registration portal, no auth).
*/

-- 1. Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  event_type text NOT NULL DEFAULT 'General',
  price numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_events" ON public.events;
CREATE POLICY "anon_select_events" ON public.events FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_events" ON public.events;
CREATE POLICY "anon_insert_events" ON public.events FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_events" ON public.events;
CREATE POLICY "anon_update_events" ON public.events FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_events" ON public.events;
CREATE POLICY "anon_delete_events" ON public.events FOR DELETE
TO anon, authenticated USING (true);

-- 2. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  college text NOT NULL,
  course text NOT NULL,
  year_semester text NOT NULL,
  city text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  payment_amount numeric NOT NULL DEFAULT 0,
  payment_utr text,
  payment_screenshot_url text,
  payment_status text NOT NULL DEFAULT 'pending',
  qr_token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_registrations" ON public.registrations;
CREATE POLICY "anon_select_registrations" ON public.registrations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON public.registrations;
CREATE POLICY "anon_insert_registrations" ON public.registrations FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registrations" ON public.registrations;
CREATE POLICY "anon_update_registrations" ON public.registrations FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registrations" ON public.registrations;
CREATE POLICY "anon_delete_registrations" ON public.registrations FOR DELETE
TO anon, authenticated USING (true);

-- 3. Create registration_events table
CREATE TABLE IF NOT EXISTS public.registration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  price_at_registration numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registration_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_registration_events" ON public.registration_events;
CREATE POLICY "anon_select_registration_events" ON public.registration_events FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registration_events" ON public.registration_events;
CREATE POLICY "anon_insert_registration_events" ON public.registration_events FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registration_events" ON public.registration_events;
CREATE POLICY "anon_update_registration_events" ON public.registration_events FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registration_events" ON public.registration_events;
CREATE POLICY "anon_delete_registration_events" ON public.registration_events FOR DELETE
TO anon, authenticated USING (true);

-- 4. Copy existing data from _new tables (only if target tables are empty)
DO $$
BEGIN
  -- Copy events
  IF (SELECT count(*) FROM public.events) = 0 THEN
    INSERT INTO public.events (id, name, event_type, price, description, is_active, created_at)
    SELECT id, name, event_type, price, description, is_active, created_at
    FROM public.events_new
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy registrations
  IF (SELECT count(*) FROM public.registrations) = 0 THEN
    INSERT INTO public.registrations (id, registration_id, full_name, mobile, email, college, course, year_semester, city, age, gender, payment_amount, payment_utr, payment_screenshot_url, payment_status, qr_token, status, created_at)
    SELECT id, registration_id, full_name, mobile, email, college, course, year_semester, city, age, gender, payment_amount, payment_utr, payment_screenshot_url, payment_status, qr_token, status, created_at
    FROM public.registrations_new
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy registration_events
  IF (SELECT count(*) FROM public.registration_events) = 0 THEN
    INSERT INTO public.registration_events (id, registration_id, event_id, price_at_registration, created_at)
    SELECT id, registration_id, event_id, price_at_registration, created_at
    FROM public.registration_events_new
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 5. Indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_registrations_mobile ON public.registrations(mobile);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_public_id ON public.registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON public.registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_registration_events_reg ON public.registration_events(registration_id);
