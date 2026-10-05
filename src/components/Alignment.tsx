import { useState } from 'react';
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import Starfield from './Starfield';
import type { ParticipantData, PaymentData } from '@/lib/types';
import type { EventRow } from '@/lib/supabase';

type AlignmentProps = {
  participant: ParticipantData;
  payment: PaymentData;
  selectedEvent: EventRow | null;
  onBack: () => void;
  onConfirm: () => void;
};

const CONSENTS = [
  { id: 'accurate', text: 'I confirm that the information provided is accurate.' },
  { id: 'no-change', text: 'I understand that my selected event cannot be changed after confirmation.' },
  { id: 'guidelines', text: 'I have read and agree to the event guidelines.' },
];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stellar-200/8 last:border-0">
      <span className="text-xs tracking-wider uppercase text-gray-500">{label}</span>
      <span className="text-sm text-gray-200 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function Alignment({ participant, payment, selectedEvent, onBack, onConfirm }: AlignmentProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    accurate: false,
    'no-change': false,
    guidelines: false,
  });
  const [error, setError] = useState('');

  const allConsented = Object.values(consents).every(Boolean);

  const handleConfirm = () => {
    if (!allConsented) {
      setError('All three confirmations are required to continue.');
      return;
    }
    setError('');
    onConfirm();
  };

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden">
      <Starfield density={30} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="section-label">04 — Alignment Check</span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              Alignment Check
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Everything is aligned. Confirm your journey.
          </p>
        </div>

        <ProgressIndicator current="alignment" />

        <div className="space-y-6 animate-scale-in">
          {/* Identity */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-stellar-200/10 border border-stellar-200/20 flex items-center justify-center">
                <span className="font-mono text-[10px] text-stellar-300">02</span>
              </div>
              <h3 className="font-display text-sm font-semibold tracking-wider uppercase text-stellar-300/80">Identity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <DetailRow label="Name" value={participant.full_name} />
              <DetailRow label="Mobile" value={participant.mobile} />
              <DetailRow label="Email" value={participant.email} />
              <DetailRow label="College" value={participant.college} />
              <DetailRow label="Course" value={participant.course} />
              <DetailRow label="Year/Sem" value={participant.year_semester} />
              <DetailRow label="City" value={participant.city} />
              <DetailRow label="Age" value={participant.age} />
              <DetailRow label="Gender" value={participant.gender} />
            </div>
          </div>

          {/* Orbit */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-stellar-200/10 border border-stellar-200/20 flex items-center justify-center">
                <span className="font-mono text-[10px] text-stellar-300">01</span>
              </div>
              <h3 className="font-display text-sm font-semibold tracking-wider uppercase text-stellar-300/80">Orbit</h3>
            </div>
            <DetailRow label="Selected Event" value={selectedEvent?.name ?? ''} />
            <DetailRow label="Event Type" value={selectedEvent?.event_type ?? ''} />
            <div className="flex items-center justify-between py-2.5 border-b border-stellar-200/8 last:border-0">
              <span className="text-xs tracking-wider uppercase text-gray-500">Price</span>
              <span className="font-mono text-sm text-stellar-300 font-semibold">₹{selectedEvent?.price}</span>
            </div>
          </div>

          {/* Transmission */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-stellar-200/10 border border-stellar-200/20 flex items-center justify-center">
                <span className="font-mono text-[10px] text-stellar-300">03</span>
              </div>
              <h3 className="font-display text-sm font-semibold tracking-wider uppercase text-stellar-300/80">Transmission</h3>
            </div>
            <DetailRow label="Amount" value={`₹${selectedEvent?.price}`} />
            <DetailRow label="UTR" value={payment.utr} />
            <div className="flex items-center justify-between py-2.5 border-b border-stellar-200/8 last:border-0">
              <span className="text-xs tracking-wider uppercase text-gray-500">Screenshot</span>
              {payment.screenshotUrl ? (
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-stellar-300" strokeWidth={1.5} />
                  <span className="text-sm text-stellar-300">Uploaded</span>
                </div>
              ) : (
                <span className="text-sm text-gray-600">Not uploaded</span>
              )}
            </div>
          </div>

          {/* Consent */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck size={18} className="text-stellar-300" strokeWidth={1.5} />
              <h3 className="font-display text-sm font-semibold tracking-wider uppercase text-stellar-300/80">Confirmation</h3>
            </div>
            <div className="space-y-4">
              {CONSENTS.map((consent) => (
                <label
                  key={consent.id}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={consents[consent.id]}
                      onChange={(e) => {
                        setConsents((prev) => ({ ...prev, [consent.id]: e.target.checked }));
                        setError('');
                      }}
                      className="sr-only peer"
                    />
                    <div className={`w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center ${
                      consents[consent.id]
                        ? 'bg-stellar-200/15 border-stellar-200/50'
                        : 'bg-cosmos-900/70 border-stellar-200/20 group-hover:border-stellar-200/35'
                    }`}>
                      {consents[consent.id] && <CheckCircle2 size={14} className="text-stellar-300" strokeWidth={2} />}
                    </div>
                  </div>
                  <span className={`text-sm leading-relaxed transition-colors ${consents[consent.id] ? 'text-gray-200' : 'text-gray-400'}`}>
                    {consent.text}
                  </span>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-red-400/80 mt-4">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
            <button onClick={onBack} className="btn-ghost w-full sm:w-auto">
              <ArrowLeft size={16} strokeWidth={1.5} />
              Return
            </button>
            <button onClick={handleConfirm} className="btn-primary w-full sm:w-auto" disabled={!allConsented}>
              Confirm Journey
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
