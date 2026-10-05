import { supabase } from './supabase';
import type { EventRow, RegistrationRow } from './supabase';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length: number): string {
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += CHARSET[array[i] % CHARSET.length];
  }
  return result;
}

export function generateRegistrationId(): string {
  return `AST-26-${randomCode(6)}`;
}

export function generateQrToken(): string {
  return `${randomCode(8)}-${randomCode(8)}-${randomCode(8)}`;
}

export async function checkDuplicate(mobile: string, email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from('registrations_new')
    .select('id')
    .or(`mobile.eq.${mobile.trim()},email.eq.${normalizedEmail}`)
    .maybeSingle();

  if (error) {
    console.error('Duplicate check error:', error);
    throw new Error('Unable to verify identity. Please try again.');
  }

  return data !== null;
}

export async function fetchActiveEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events_new')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Fetch events error:', error);
    throw new Error('Unable to load orbits. Please try again.');
  }

  return (data as EventRow[]) ?? [];
}

export async function fetchRegistrationByPublicId(publicId: string): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations_new')
    .select('*')
    .eq('registration_id', publicId.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('Fetch registration error:', error);
    return null;
  }

  return data as RegistrationRow | null;
}

export async function uploadPaymentScreenshot(
  file: File,
  registrationId: string
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${registrationId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('payment-screenshots')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Unable to upload payment screenshot. Please try again.');
  }

  const { data: urlData } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export type RegistrationInput = {
  registration_id: string;
  full_name: string;
  mobile: string;
  email: string;
  college: string;
  course: string;
  year_semester: string;
  city: string;
  age: number;
  gender: string;
  payment_amount: number;
  payment_utr: string;
  payment_screenshot_url: string;
  qr_token: string;
};

export async function insertRegistration(
  input: RegistrationInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('registrations_new')
    .insert({
      registration_id: input.registration_id,
      full_name: input.full_name,
      mobile: input.mobile,
      email: input.email,
      college: input.college,
      course: input.course,
      year_semester: input.year_semester,
      city: input.city,
      age: input.age,
      gender: input.gender,
      payment_amount: input.payment_amount,
      payment_utr: input.payment_utr,
      payment_screenshot_url: input.payment_screenshot_url,
      qr_token: input.qr_token,
      payment_status: 'pending',
      status: 'confirmed',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Insert registration error:', error);
    throw new Error('Unable to complete registration. Please try again.');
  }

  return { id: data.id };
}

export async function insertRegistrationEvent(
  registrationUuid: string,
  eventId: string,
  priceAtRegistration: number
): Promise<void> {
  const { error } = await supabase
    .from('registration_events_new')
    .insert({
      registration_id: registrationUuid,
      event_id: eventId,
      price_at_registration: priceAtRegistration,
    });

  if (error) {
    console.error('Insert registration_event error:', error);
    throw new Error('Unable to link event to registration. Please try again.');
  }
}
