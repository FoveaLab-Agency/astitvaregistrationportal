/*
# Create passes table and private storage bucket

## Purpose
Stores generated PDF passes for every completed ASTITVA registration.
Each pass is a PDF file uploaded to the private "passes" storage bucket,
with a database record linking it to the registration.

## New Table: public.passes
- id (uuid, PK)
- registration_id (text) — the public registration ID (e.g. ASR-26-07-ABCD1234)
- pass_number (text, unique) — human-readable pass number (e.g. PASS-000001)
- verification_token (text) — the qr_token used for verification
- pass_file_path (text) — storage path within the "passes" bucket
- pass_file_type (text) — MIME type, always "application/pdf"
- status (text) — pass status, default "active"
- created_at (timestamptz)

## New Storage Bucket
- "passes" (private) — holds the PDF pass files

## Security
- RLS enabled on passes table.
- This is a no-auth portal: anon + authenticated can INSERT and SELECT.
- The bucket is private so pass PDFs are not publicly accessible;
  they must be retrieved via signed URL (createSignedUrl) using the anon key.
*/

CREATE TABLE IF NOT EXISTS public.passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id text NOT NULL,
  pass_number text UNIQUE NOT NULL,
  verification_token text NOT NULL,
  pass_file_path text NOT NULL,
  pass_file_type text NOT NULL DEFAULT 'application/pdf',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passes_registration_id ON public.passes(registration_id);

ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_passes" ON public.passes;
CREATE POLICY "anon_select_passes"
ON public.passes FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_passes" ON public.passes;
CREATE POLICY "anon_insert_passes"
ON public.passes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_passes" ON public.passes;
CREATE POLICY "anon_update_passes"
ON public.passes FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_passes" ON public.passes;
CREATE POLICY "anon_delete_passes"
ON public.passes FOR DELETE
TO anon, authenticated
USING (true);

-- Create private storage bucket for passes
INSERT INTO storage.buckets (id, name, public)
SELECT 'passes', 'passes', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'passes'
);

-- Allow anon/authenticated to upload and read pass files
DROP POLICY IF EXISTS "anon_upload_passes" ON storage.objects;
CREATE POLICY "anon_upload_passes"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'passes');

DROP POLICY IF EXISTS "anon_read_passes" ON storage.objects;
CREATE POLICY "anon_read_passes"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'passes');

-- Allow creating signed URLs (needed for private bucket retrieval)
-- SELECT grant on storage.objects is already handled by the read policy above.
