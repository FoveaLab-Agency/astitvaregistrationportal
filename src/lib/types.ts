import type { EventRow } from './supabase';

export type ParticipantData = {
  full_name: string;
  mobile: string;
  email: string;
  college: string;
  course: string;
  year_semester: string;
  city: string;
  age: string;
  gender: string;
};

export type PaymentData = {
  utr: string;
  screenshotFile: File | null;
  screenshotUrl: string;
};

export type RegistrationResult = {
  registrationId: string;
  participantName: string;
  gender: string;
  selectedEvents: EventRow[];
  totalAmount: number;
  paymentStatus: string;
  qrToken: string;
};

export const EMPTY_PARTICIPANT: ParticipantData = {
  full_name: '',
  mobile: '',
  email: '',
  college: '',
  course: '',
  year_semester: '',
  city: '',
  age: '',
  gender: '',
};

export const EMPTY_PAYMENT: PaymentData = {
  utr: '',
  screenshotFile: null,
  screenshotUrl: '',
};

export function calculateTotal(events: EventRow[]): number {
  return events.reduce((sum, e) => sum + Number(e.price), 0);
}

export function countByType(events: EventRow[]): { individual: number; group: number } {
  return events.reduce(
    (acc, e) => {
      if (e.event_type === 'Group') acc.group++;
      else acc.individual++;
      return acc;
    },
    { individual: 0, group: 0 }
  );
}

export function validateParticipant(data: ParticipantData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.full_name.trim()) errors.full_name = 'Full name is required';
  else if (data.full_name.trim().length < 3) errors.full_name = 'Name must be at least 3 characters';

  if (!data.mobile.trim()) errors.mobile = 'Mobile number is required';
  else if (!/^[6-9]\d{9}$/.test(data.mobile.trim())) errors.mobile = 'Enter a valid 10-digit Indian mobile number';

  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Enter a valid email address';

  if (!data.college.trim()) errors.college = 'College / institution is required';
  if (!data.course.trim()) errors.course = 'Course is required';
  if (!data.year_semester.trim()) errors.year_semester = 'Year / semester is required';
  if (!data.city.trim()) errors.city = 'City is required';

  return errors;
}

export function validatePayment(data: PaymentData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.utr.trim()) errors.utr = 'UTR / Transaction ID is required';
  else if (data.utr.trim().length < 6) errors.utr = 'Enter a valid UTR / Transaction ID';

  if (!data.screenshotFile) errors.screenshot = 'Payment screenshot is required';

  return errors;
}

export const UPI_ID = 'astitva@upi';
export const UPI_PAYEE_NAME = 'ASTITVA';

export function getUpiQrString(): string {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&cu=INR`;
}
