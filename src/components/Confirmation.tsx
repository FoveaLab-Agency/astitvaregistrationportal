import { CheckCircle2, ContactRound, Home, Loader2, AlertCircle } from 'lucide-react';
import Starfield from './Starfield';
import OrbitRings from './OrbitRings';
import { getQrCodeUrl } from '@/lib/qr';
import { getVerificationUrl } from '@/lib/qr';
import type { RegistrationResult } from '@/lib/types';

type ConfirmationProps = {
  result: RegistrationResult;
  onViewPass: () => void;
  onHome: () => void;
};

export default function Confirmation({ result, onViewPass, onHome }: ConfirmationProps) {
  const verificationUrl = getVerificationUrl(result.qrToken);
  const qrUrl = getQrCodeUrl(verificationUrl, 180);

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden flex items-center">
      <Starfield density={50} />
      <OrbitRings variant="section" className="opacity-40" />

      <div className="relative z-10 max-w-xl mx-auto w-full">
        {/* Success animation */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 rounded-full bg-stellar-200/10 animate-glow-pulse" />
            <div className="absolute w-32 h-32 rounded-full border border-stellar-200/15 animate-orbit-slow" style={{ animationDuration: '20s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-stellar-300" style={{ boxShadow: '0 0 8px rgba(109, 213, 250, 0.8)' }} />
            </div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-stellar-200/20 to-stellar-200/5 border border-stellar-200/30 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-stellar-300" strokeWidth={1.5} />
            </div>
          </div>

          <span className="section-label">Orbit Confirmed</span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl md:text-5xl mt-3 mb-3">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              Orbit Confirmed
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your journey has entered the ASTITVA universe.
          </p>
        </div>

        {/* Registration details */}
        <div className="glass-panel-strong p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          {/* Registration ID */}
          <div className="text-center mb-6 pb-6 border-b border-stellar-200/10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-stellar-300/50 mb-2">Your Cosmic Identity Code</p>
            <p className="font-mono text-2xl md:text-3xl font-bold text-stellar-300 text-glow tracking-wider">
              {result.registrationId}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider uppercase text-gray-500">Participant</span>
              <span className="text-sm text-white font-medium">{result.participantName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider uppercase text-gray-500">Selected Event</span>
              <span className="text-sm text-gray-200">{result.eventName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider uppercase text-gray-500">Amount Paid</span>
              <span className="font-mono text-sm text-stellar-300 font-semibold">₹{result.amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider uppercase text-gray-500">Payment Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
                <span className="text-xs text-yellow-400/80 capitalize">{result.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center pt-6 border-t border-stellar-200/10">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stellar-300/50 mb-3">Verification QR</p>
            <div className="p-3 bg-white rounded-xl">
              <img src={qrUrl} alt="Verification QR Code" width={140} height={140} className="rounded-lg" />
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">Scan to verify your registration</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <button onClick={onViewPass} className="btn-primary w-full sm:w-auto">
            <ContactRound size={16} strokeWidth={1.5} />
            View Identity Pass
          </button>
          <button onClick={onHome} className="btn-secondary w-full sm:w-auto">
            <Home size={16} strokeWidth={1.5} />
            Return to Universe
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6 animate-fade-in" style={{ animationDelay: '0.7s', opacity: 0 }}>
          Save your registration ID. You'll need it to access your identity pass.
        </p>
      </div>
    </section>
  );
}

export function RegistrationLoading() {
  return (
    <section className="relative min-h-screen cosmic-bg flex items-center justify-center overflow-hidden">
      <Starfield density={40} />
      <div className="relative z-10 text-center">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-20 h-20 rounded-full border border-stellar-200/15 animate-orbit-slow" style={{ animationDuration: '15s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-stellar-300" style={{ boxShadow: '0 0 8px rgba(109, 213, 250, 0.8)' }} />
          </div>
          <Loader2 size={28} className="text-stellar-300 animate-spin" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-400 tracking-wider">Entering the universe...</p>
      </div>
    </section>
  );
}

export function RegistrationError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="relative min-h-screen cosmic-bg flex items-center justify-center overflow-hidden px-6">
      <Starfield density={40} />
      <div className="relative z-10 max-w-md w-full text-center">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400/70" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="cosmic-heading text-2xl mb-3 text-red-400/90">Transmission Failed</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">{message}</p>
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      </div>
    </section>
  );
}
