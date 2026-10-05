import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Calendar, User, Users, CreditCard, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { RegistrationRow, EventRow } from '@/lib/supabase';
import Starfield from './Starfield';

type VerifyPageProps = {
  token: string;
};

type VerifyData = {
  registration: RegistrationRow;
  events: EventRow[];
};

export default function VerifyPage({ token }: VerifyPageProps) {
  const [status, setStatus] = useState<'loading' | 'verified' | 'invalid'>('loading');
  const [data, setData] = useState<VerifyData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch registration by qr_token
        const { data: reg, error: regError } = await supabase
          .from('registrations_new')
          .select('*')
          .eq('qr_token', token.trim())
          .maybeSingle();

        if (regError || !reg) {
          if (!cancelled) setStatus('invalid');
          return;
        }

        // Fetch linked events
        const { data: regEvents, error: evError } = await supabase
          .from('registration_events_new')
          .select('event_id')
          .eq('registration_id', (reg as RegistrationRow).id);

        let events: EventRow[] = [];
        if (!evError && regEvents && regEvents.length > 0) {
          const eventIds = regEvents.map((re: { event_id: string }) => re.event_id);
          const { data: eventRows } = await supabase
            .from('events_new')
            .select('*')
            .in('id', eventIds);
          events = (eventRows as EventRow[]) ?? [];
        }

        if (!cancelled) {
          setData({ registration: reg as RegistrationRow, events });
          setStatus('verified');
        }
      } catch {
        if (!cancelled) setStatus('invalid');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <section className="relative min-h-screen cosmic-bg flex items-center justify-center overflow-hidden px-6 py-20">
      <Starfield density={50} />

      <div className="relative z-10 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldCheck size={20} className="text-stellar-300" strokeWidth={1.5} />
            <span className="font-display text-sm font-bold tracking-[0.2em] text-stellar-400">ASTITVA</span>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-stellar-300/50">Registration Verification</p>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div className="glass-panel-strong p-12 text-center">
            <Loader2 size={32} className="mx-auto text-stellar-300 animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">Verifying registration...</p>
          </div>
        )}

        {/* Invalid */}
        {status === 'invalid' && (
          <div className="glass-panel-strong p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-400/70" strokeWidth={1.5} />
            </div>
            <h2 className="cosmic-heading text-2xl text-red-400/90 mb-3">INVALID</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              This verification token does not match any registration in the ASTITVA database.
              The QR code may be invalid or tampered with.
            </p>
          </div>
        )}

        {/* Verified */}
        {status === 'verified' && data && (
          <div className="glass-panel-strong p-6 md:p-8 animate-scale-in">
            {/* Verified badge */}
            <div className="text-center mb-6 pb-6 border-b border-stellar-200/10">
              <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-400" strokeWidth={1.5} />
              </div>
              <h2 className="cosmic-heading text-2xl text-green-400 mb-2">VERIFIED</h2>
              <p className="text-xs text-gray-400">This is a genuine ASTITVA registration.</p>
            </div>

            {/* Registration details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-stellar-300/50" strokeWidth={1.5} />
                  <span className="text-xs tracking-wider uppercase text-gray-500">Registration ID</span>
                </div>
                <span className="font-mono text-sm text-stellar-300 font-semibold">{data.registration.registration_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-stellar-300/50" strokeWidth={1.5} />
                  <span className="text-xs tracking-wider uppercase text-gray-500">Name</span>
                </div>
                <span className="text-sm text-white font-medium">{data.registration.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-stellar-300/50" strokeWidth={1.5} />
                  <span className="text-xs tracking-wider uppercase text-gray-500">Gender</span>
                </div>
                <span className="text-sm text-gray-200">{data.registration.gender}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-stellar-300/50" strokeWidth={1.5} />
                  <span className="text-xs tracking-wider uppercase text-gray-500">Events</span>
                </div>
                <span className="text-sm text-gray-200">{data.events.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-stellar-300/50" strokeWidth={1.5} />
                  <span className="text-xs tracking-wider uppercase text-gray-500">Amount Paid</span>
                </div>
                <span className="font-mono text-sm text-stellar-300 font-semibold">₹{data.registration.payment_amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-stellar-300/50" strokeWidth={1.5} />
                  <span className="text-xs tracking-wider uppercase text-gray-500">Status</span>
                </div>
                <span className="text-xs text-green-400/80 capitalize">{data.registration.status}</span>
              </div>
            </div>

            {/* Selected events */}
            {data.events.length > 0 && (
              <div className="pt-4 border-t border-stellar-200/10">
                <p className="text-[10px] tracking-[0.2em] uppercase text-stellar-300/50 mb-3">Selected Events</p>
                <div className="space-y-1.5">
                  {data.events.map((e) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{e.name}</span>
                      <span className="text-[10px] text-gray-600 uppercase">{e.event_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="#"
            className="text-xs text-gray-500 hover:text-stellar-300 transition-colors"
          >
            Return to ASTITVA
          </a>
        </div>
      </div>
    </section>
  );
}
