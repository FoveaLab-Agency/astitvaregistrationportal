import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clnsfuhwwltrnovlgvte.supabase.co';
const supabaseAnonKey = 'sb_publishable_ULPLS_e4BCvhxe2QWoY0Ug_NwqngI5Y';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export type EventRow = {
  id: string;
  name: string;
  event_type: string;
  price: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type RegistrationRow = {
  id: string;
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
  payment_utr: string | null;
  payment_screenshot_url: string | null;
  payment_status: string;
  qr_token: string;
  status: string;
  created_at: string;
};

export type RegistrationEventRow = {
  id: string;
  registration_id: string;
  event_id: string;
  price_at_registration: number;
  created_at: string;
};

export const PAYMENT_SCREENSHOTS_BUCKET = 'payment-screenshots';
