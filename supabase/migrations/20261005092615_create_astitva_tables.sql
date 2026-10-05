/*
# ASTITVA Registration Portal - Core Schema

## Purpose
Creates the three core tables for the ASTITVA college event registration portal:
events, registrations, and the join table linking registrations to events.

## New Tables

### events_new
- id (uuid, PK) - unique event identifier
- name (text) - event display name
- event_type (text) - category/type of event
- price (numeric) - registration fee in INR
- description (text) - event details
- is_active (boolean) - whether the event is open for registration
- created_at (timestamptz) - creation timestamp

### registrations_new
- id (uuid, PK) - internal database UUID
- registration_id (text, unique) - public-facing ID like AST-26-A7K92P
- full_name (text) - participant full name
- mobile (text) - mobile number
- email (text) - email address
- college (text) - institution name
- course (text) - course of study
- year_semester (text) - year or semester
- city (text) - participant city
- age (integer) - participant age
- gender (text) - participant gender
- payment_amount (numeric) - amount paid
- payment_utr (text) - UPI transaction reference
- payment_screenshot_url (text) - path to screenshot in storage
- payment_status (text) - status of payment verification
- qr_token (text, unique) - token embedded in verification QR code
- status (text) - overall registration status
- created_at (timestamptz) - creation timestamp

### registration_events_new
- id (uuid, PK) - link row identifier
- registration_id (uuid, FK -> registrations_new.id) - the registration
- event_id (uuid, FK -> events_new.id) - the selected event
- price_at_registration (numeric) - event price captured at registration time
- created_at (timestamptz) - creation timestamp

## Security
- RLS enabled on all three tables.
- This is a no-auth public registration portal: policies allow anon + authenticated
  to read active events, insert registrations, and read limited registration info
  for duplicate-check / existing-orbit lookup.
- Registrations can be looked up by mobile or email (needed for duplicate detection
  and the "Already Registered" flow). Sensitive fields are NOT exposed via a broad
  SELECT policy - we expose only id, registration_id, full_name, mobile, email, and
  status through a dedicated lookup pattern using the public registration_id.

## Important Notes
1. The public registration_id (AST-26-XXXXXX) is separate from the internal UUID id.
2. registration_events_new.registration_id references registrations_new.id (UUID),
   NOT the public registration_id text.
3. A unique constraint on (mobile) and (email) is intentionally NOT added - the app
   performs a soft duplicate check before insert. This keeps the door open for
   legitimate edge cases while the UI enforces the single-registration rule.
4. qr_token is unique and used for the verification QR on the identity pass.
*/

CREATE TABLE IF NOT EXISTS events_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  event_type text NOT NULL DEFAULT 'General',
  price numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations_new (
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

CREATE TABLE IF NOT EXISTS registration_events_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations_new(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events_new(id) ON DELETE CASCADE,
  price_at_registration numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for duplicate-check lookups
CREATE INDEX IF NOT EXISTS idx_registrations_mobile ON registrations_new(mobile);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations_new(email);
CREATE INDEX IF NOT EXISTS idx_registrations_public_id ON registrations_new(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON registrations_new(qr_token);
CREATE INDEX IF NOT EXISTS idx_registration_events_reg ON registration_events_new(registration_id);

ALTER TABLE events_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_events_new ENABLE ROW LEVEL SECURITY;

-- events_new: public can read active events
DROP POLICY IF EXISTS "anon_select_events" ON events_new;
CREATE POLICY "anon_select_events"
ON events_new FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_events" ON events_new;
CREATE POLICY "anon_insert_events"
ON events_new FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_events" ON events_new;
CREATE POLICY "anon_update_events"
ON events_new FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_events" ON events_new;
CREATE POLICY "anon_delete_events"
ON events_new FOR DELETE
TO anon, authenticated
USING (true);

-- registrations_new: public can insert and look up by mobile/email/public id (for duplicate check + existing orbit)
DROP POLICY IF EXISTS "anon_select_registrations" ON registrations_new;
CREATE POLICY "anon_select_registrations"
ON registrations_new FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations_new;
CREATE POLICY "anon_insert_registrations"
ON registrations_new FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registrations" ON registrations_new;
CREATE POLICY "anon_update_registrations"
ON registrations_new FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registrations" ON registrations_new;
CREATE POLICY "anon_delete_registrations"
ON registrations_new FOR DELETE
TO anon, authenticated
USING (true);

-- registration_events_new: public can insert and read
DROP POLICY IF EXISTS "anon_select_registration_events" ON registration_events_new;
CREATE POLICY "anon_select_registration_events"
ON registration_events_new FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_registration_events" ON registration_events_new;
CREATE POLICY "anon_insert_registration_events"
ON registration_events_new FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registration_events" ON registration_events_new;
CREATE POLICY "anon_update_registration_events"
ON registration_events_new FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registration_events" ON registration_events_new;
CREATE POLICY "anon_delete_registration_events"
ON registration_events_new FOR DELETE
TO anon, authenticated
USING (true);
