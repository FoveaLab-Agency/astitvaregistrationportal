import { supabase } from './supabase';
import type { EventRow, RegistrationRow } from './supabase';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[array[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generate registration ID: ASR-26-NN-XXXXXXXX
 * NN = number of selected events (zero-padded to 2)
 * XXXXXXXX = 8 cryptographically random alphanumeric chars
 */
export function generateRegistrationId(eventCount: number): string {
  const padded = String(eventCount).padStart(2, '0');
  return `ASR-26-${padded}-${randomCode(8)}`;
}

export function generateQrToken(): string {
  return `${randomCode(8)}-${randomCode(8)}-${randomCode(8)}`;
}

/**
 * Check that the generated registration_id doesn't already exist.
 * If it does (astronomically unlikely), retry up to 5 times.
 */
export async function generateUniqueRegistrationId(eventCount: number): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateRegistrationId(eventCount);
    const { data, error } = await supabase
      .from('registrations_new')
      .select('registration_id')
      .eq('registration_id', id)
      .maybeSingle();

    if (error) throw new Error('Unable to verify registration ID uniqueness. Please try again.');
    if (!data) return id;
  }
  throw new Error('Unable to generate a unique registration ID. Please try again.');
}

export async function checkDuplicate(mobile: string, email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from('registrations_new')
    .select('id')
    .or(`mobile.eq.${mobile.trim()},email.eq.${normalizedEmail}`)
    .maybeSingle();

  if (error) {
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
    throw new Error('Unable to load events. Please try again.');
  }

  return (data as EventRow[]) ?? [];
}

export async function fetchRegistrationByPublicId(publicId: string): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations_new')
    .select('*')
    .eq('registration_id', publicId.trim().toUpperCase())
    .maybeSingle();

  if (error) return null;
  return data as RegistrationRow | null;
}

export async function fetchRegistrationEvents(regUuid: string): Promise<{ event_id: string; price_at_registration: number }[]> {
  const { data, error } = await supabase
    .from('registration_events_new')
    .select('event_id, price_at_registration')
    .eq('registration_id', regUuid);

  if (error) return [];
  return (data as { event_id: string; price_at_registration: number }[]) ?? [];
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
    throw new Error(error?.message || 'Unable to complete registration. Please try again.');
  }

  return { id: data.id };
}

/**
 * Insert multiple registration-event links in a single batch call.
 * Uses the registration's UUID (registrations_new.id), NOT the public text registration_id.
 */
export async function insertRegistrationEvents(
  registrationUuid: string,
  events: { id: string; price: number }[]
): Promise<void> {
  const rows = events.map((e) => ({
    registration_id: registrationUuid,
    event_id: e.id,
    price_at_registration: e.price,
  }));

  const { error } = await supabase
    .from('registration_events_new')
    .insert(rows);

  if (error) {
    throw new Error(error.message || 'Unable to link events to registration. Please try again.');
  }
}
