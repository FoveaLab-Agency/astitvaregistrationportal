/*
# Create payment-screenshots storage bucket

## Purpose
Creates a public storage bucket for payment screenshot uploads from the
ASTITVA registration portal. Screenshots are uploaded by participants
during the "Complete Your Transmission" (payment) step.

## Changes
- Creates storage bucket "payment-screenshots" if it does not exist.
- Sets it public so uploaded screenshots can be referenced by URL for
  organizer review.
*/

INSERT INTO storage.buckets (id, name, public)
SELECT 'payment-screenshots', 'payment-screenshots', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'payment-screenshots'
);

-- Allow public upload to payment-screenshots bucket
DROP POLICY IF EXISTS "anon_upload_payment_screenshots" ON storage.objects;
CREATE POLICY "anon_upload_payment_screenshots"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "anon_read_payment_screenshots" ON storage.objects;
CREATE POLICY "anon_read_payment_screenshots"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "anon_delete_payment_screenshots" ON storage.objects;
CREATE POLICY "anon_delete_payment_screenshots"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'payment-screenshots');
