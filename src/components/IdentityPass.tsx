import { ArrowLeft, Printer } from 'lucide-react';
import Starfield from './Starfield';
import { getQrCodeUrl, getVerificationUrl } from '@/lib/qr';
import type { RegistrationResult } from '@/lib/types';
import type { ParticipantData } from '@/lib/types';

type IdentityPassProps = {
  result: RegistrationResult;
  participant: ParticipantData;
  onBack: () => void;
};

export default function IdentityPass({ result, participant, onBack }: IdentityPassProps) {
  const verificationUrl = getVerificationUrl(result.qrToken);
  const qrUrl = getQrCodeUrl(verificationUrl, 160);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden">
      <Starfield density={30} />

      {/* Screen view */}
      <div className="relative z-10 max-w-2xl mx-auto no-print">
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="section-label">Identity Pass</span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              Identity Pass
            </span>
          </h2>
          <p className="text-gray-400 text-sm">Your identity within the ASTITVA universe.</p>
        </div>

        {/* Pass preview (on-screen dark version) */}
        <div className="glass-panel-strong p-8 md:p-10 animate-scale-in">
          <div className="text-center mb-6 pb-6 border-b border-stellar-200/15">
            <h3 className="font-display text-2xl font-bold tracking-[0.2em] text-white mb-1">ASTITVA</h3>
            <p className="text-[10px] tracking-[0.3em] uppercase text-stellar-300/60 mb-2">Emergence Beyond Existence</p>
            <p className="text-xs tracking-[0.2em] uppercase text-stellar-400 font-medium">Identity Pass</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <PassField label="Registration ID" value={result.registrationId} mono />
            <PassField label="Participant Name" value={participant.full_name} />
            <PassField label="Gender" value={result.gender} />
            <PassField label="College" value={participant.college} />
            <PassField label="Course" value={participant.course} />
            <PassField label="Year / Semester" value={participant.year_semester} />
            <PassField label="Mobile" value={participant.mobile} />
            <PassField label="Total Amount" value={`₹${result.totalAmount}`} />
            <PassField label="Payment Status" value={result.paymentStatus} capitalize />
          </div>

          {/* Selected events */}
          <div className="mb-6 pt-4 border-t border-stellar-200/15">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stellar-300/50 mb-3">
              Selected Events ({result.selectedEvents.length})
            </p>
            <div className="space-y-1.5">
              {result.selectedEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{e.name}</span>
                  <span className="font-mono text-xs text-gray-500">₹{e.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center pt-6 border-t border-stellar-200/15">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stellar-300/50 mb-3">Verification QR</p>
            <div className="p-3 bg-white rounded-xl">
              <img src={qrUrl} alt="Identity Pass QR" width={120} height={120} className="rounded-lg" />
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Scan this QR to verify your registration
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button onClick={handlePrint} className="btn-primary w-full sm:w-auto">
            <Printer size={16} strokeWidth={1.5} />
            Print / Save PDF
          </button>
          <button onClick={onBack} className="btn-secondary w-full sm:w-auto">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back
          </button>
        </div>
      </div>

      {/* Print version */}
      <div className="hidden print-page print:block">
        <div className="w-full">
          <div className="print-pass border-2 border-cyan-500 p-8 m-2 flex flex-col min-h-[90vh]">
            <div className="text-center mb-4 pb-4 border-b-2 border-cyan-500">
              <h3 className="text-2xl font-bold tracking-[0.15em] text-gray-900">ASTITVA</h3>
              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-600 mt-0.5">Emergence Beyond Existence</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-600 font-bold mt-1 print-accent">Identity Pass</p>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <PrintField label="Reg. ID" value={result.registrationId} />
                <PrintField label="Name" value={participant.full_name} />
                <PrintField label="Gender" value={result.gender} />
                <PrintField label="College" value={participant.college} />
                <PrintField label="Course" value={participant.course} />
                <PrintField label="Year/Sem" value={participant.year_semester} />
                <PrintField label="Mobile" value={participant.mobile} />
                <PrintField label="Amount" value={`₹${result.totalAmount}`} />
                <PrintField label="Payment" value={result.paymentStatus} />
              </div>
              <div className="mb-4">
                <p className="text-[8px] uppercase tracking-wider text-gray-500 mb-1">Selected Events ({result.selectedEvents.length})</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {result.selectedEvents.map((e) => (
                    <div key={e.id} className="flex justify-between border-b border-gray-200 py-0.5">
                      <span className="text-[9px] text-gray-700">{e.name}</span>
                      <span className="text-[8px] font-mono text-gray-500">₹{e.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between pt-3 border-t border-gray-300">
              <div className="text-[7px] text-gray-500">
                <p>Scan to verify</p>
                <p className="font-mono text-[6px]">{result.registrationId}</p>
              </div>
              <img src={qrUrl} alt="QR" width={90} height={90} className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PassField({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.15em] uppercase text-stellar-300/50 mb-1">{label}</p>
      <p className={`text-sm text-white ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function PrintField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-gray-200 pb-1">
      <span className="text-[8px] uppercase tracking-wider text-gray-500">{label}</span>
      <span className="text-[10px] font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
