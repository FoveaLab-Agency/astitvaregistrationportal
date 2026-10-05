import { jsPDF } from 'jspdf';
import { supabase } from './supabase';
import { getQrCodeUrl, getVerificationUrl } from './qr';
import type { RegistrationResult } from './types';
import type { ParticipantData } from './types';

const PASSES_BUCKET = 'passes';

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
 * Fetch the QR code image as base64 for embedding in the PDF.
 */
async function fetchQrAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:image/png;base64, prefix — jsPDF wants raw base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a professional PDF pass using jsPDF.
 * Returns a Blob ready for upload.
 */
async function generatePassPdf(
  result: RegistrationResult,
  participant: ParticipantData
): Promise<Blob> {
  const verificationUrl = getVerificationUrl(result.qrToken);
  const qrImgUrl = getQrCodeUrl(verificationUrl, 200);
  const qrBase64 = await fetchQrAsBase64(qrImgUrl);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const cardWidth = 180;
  const cardHeight = 100;
  const marginLeft = (pageWidth - cardWidth) / 2;
  const marginTop = 30;

  // Outer border
  pdf.setDrawColor(79, 195, 247);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(marginLeft, marginTop, cardWidth, cardHeight, 3, 3);

  // Inner accent line
  pdf.setDrawColor(180, 220, 240);
  pdf.setLineWidth(0.3);
  pdf.line(marginLeft + 6, marginTop + 20, marginLeft + cardWidth - 6, marginTop + 20);

  // Header
  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text('ASTITVA', pageWidth / 2, marginTop + 12, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('EMERGENCE BEYOND EXISTENCE', pageWidth / 2, marginTop + 16, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(79, 195, 247);
  pdf.text('IDENTITY PASS', pageWidth / 2, marginTop + 24, { align: 'center' });

  // Left column: participant details
  const colLeft = marginLeft + 10;
  let rowY = marginTop + 32;
  const lineGap = 7;

  const details: { label: string; value: string }[] = [
    { label: 'Reg. ID', value: result.registrationId },
    { label: 'Name', value: participant.full_name },
    { label: 'Gender', value: result.gender },
    { label: 'College', value: participant.college },
    { label: 'Course', value: participant.course },
    { label: 'Year/Sem', value: participant.year_semester },
    { label: 'Mobile', value: participant.mobile },
    { label: 'Amount', value: `Rs. ${result.totalAmount}` },
  ];

  pdf.setFontSize(8);
  for (const d of details) {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 120, 120);
    pdf.text(d.label + ':', colLeft, rowY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(d.value, colLeft + 22, rowY);
    rowY += lineGap;
  }

  // Events section below the details
  const eventsY = rowY + 2;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Selected Events (${result.selectedEvents.length}):`, colLeft, eventsY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  const eventsStr = result.selectedEvents.map((e) => e.name).join(', ');
  const wrappedEvents = pdf.splitTextToSize(eventsStr, 120);
  pdf.text(wrappedEvents, colLeft, eventsY + 5);

  // Right side: QR code
  const qrSize = 35;
  const qrX = marginLeft + cardWidth - qrSize - 12;
  const qrY = marginTop + 28;
  pdf.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  // QR label
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Scan to verify', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });

  // Verification token below QR
  pdf.setFontSize(5);
  pdf.setTextColor(140, 140, 140);
  pdf.text(result.registrationId, qrX + qrSize / 2, qrY + qrSize + 7, { align: 'center' });

  // Footer line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  pdf.line(marginLeft + 6, marginTop + cardHeight - 8, marginLeft + cardWidth - 6, marginTop + cardHeight - 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(150, 150, 150);
  pdf.text('ASTITVA 2026 · This pass is non-transferable', pageWidth / 2, marginTop + cardHeight - 4, { align: 'center' });

  return pdf.output('blob');
}

/**
 * Generate a unique pass number: PASS-XXXXXXXX
 */
export function generatePassNumber(): string {
  return `PASS-${randomCode(8)}`;
}

/**
 * Verify that a pass_number doesn't already exist, retry if needed.
 */
async function generateUniquePassNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const num = generatePassNumber();
    const { data, error } = await supabase
      .from('passes')
      .select('id')
      .eq('pass_number', num)
      .maybeSingle();
    if (error) throw new Error('Unable to verify pass number uniqueness.');
    if (!data) return num;
  }
  throw new Error('Unable to generate a unique pass number.');
}

export type PassRecord = {
  id: string;
  registration_id: string;
  pass_number: string;
  verification_token: string;
  pass_file_path: string;
  pass_file_type: string;
  status: string;
  created_at: string;
};

/**
 * Full pass pipeline:
 * 1. Generate the PDF
 * 2. Upload it to the private "passes" bucket
 * 3. Insert a record into public.passes
 * Returns the pass record.
 */
export async function generateAndStorePass(
  result: RegistrationResult,
  participant: ParticipantData
): Promise<PassRecord> {
  // 1. Generate PDF
  const pdfBlob = await generatePassPdf(result, participant);

  // 2. Generate unique pass number
  const passNumber = await generateUniquePassNumber();

  // 3. Upload to private "passes" bucket
  const filePath = `${result.registrationId}/${passNumber}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(PASSES_BUCKET)
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Unable to upload pass PDF.');
  }

  // 4. Insert record into passes table
  const { data: passRow, error: insertError } = await supabase
    .from('passes')
    .insert({
      registration_id: result.registrationId,
      pass_number: passNumber,
      verification_token: result.qrToken,
      pass_file_path: filePath,
      pass_file_type: 'application/pdf',
      status: 'active',
    })
    .select('*')
    .single();

  if (insertError || !passRow) {
    // Clean up orphaned file if DB insert fails
    await supabase.storage.from(PASSES_BUCKET).remove([filePath]);
    throw new Error(insertError?.message || 'Unable to create pass record.');
  }

  return passRow as PassRecord;
}

/**
 * Create a signed URL to download a pass PDF from the private bucket.
 * Valid for 60 seconds.
 */
export async function getPassSignedUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(PASSES_BUCKET)
    .createSignedUrl(filePath, 60);

  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Fetch all pass records (for organizer Pass Management).
 */
export async function fetchAllPasses(): Promise<(PassRecord & { registrations_new?: { full_name: string; payment_amount: number } })[]> {
  const { data, error } = await supabase
    .from('passes')
    .select('*, registrations_new!inner(full_name, payment_amount)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    // Fallback without join
    const { data: simple } = await supabase
      .from('passes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    return (simple as PassRecord[]) ?? [];
  }

  return (data as (PassRecord & { registrations_new?: { full_name: string; payment_amount: number } })[]) ?? [];
}

/**
 * Fetch a single pass by registration ID.
 */
export async function fetchPassByRegistrationId(registrationId: string): Promise<PassRecord | null> {
  const { data, error } = await supabase
    .from('passes')
    .select('*')
    .eq('registration_id', registrationId.trim().toUpperCase())
    .maybeSingle();

  if (error) return null;
  return data as PassRecord | null;
}
