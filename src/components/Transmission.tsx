import { useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Upload, QrCode, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import Starfield from './Starfield';
import { validatePayment, getUpiQrString, UPI_ID, calculateTotal, countByType, type PaymentData } from '@/lib/types';
import { getQrCodeUrl } from '@/lib/qr';
import type { EventRow } from '@/lib/supabase';

type TransmissionProps = {
  payment: PaymentData;
  onChange: (data: PaymentData) => void;
  selectedEvents: EventRow[];
  onBack: () => void;
  onContinue: () => void;
};

export default function Transmission({ payment, onChange, selectedEvents, onBack, onContinue }: TransmissionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState(false);

  const upiString = getUpiQrString();
  const qrUrl = getQrCodeUrl(upiString, 220);
  const total = calculateTotal(selectedEvents);
  const counts = countByType(selectedEvents);
  const individualTotal = counts.individual * 100;
  const groupTotal = counts.group * 300;

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden">
      <Starfield density={30} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="section-label">03 — Complete Your Transmission</span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              Complete Your Transmission
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your transmission activates your place within the universe.
          </p>
        </div>

        <ProgressIndicator current="transmission" />

        <div className="glass-panel p-6 md:p-10 animate-scale-in">
          {/* Payment breakdown */}
          <div className="rounded-xl bg-cosmos-900/60 border border-stellar-200/10 p-5 mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stellar-300/50 mb-4">Payment Summary</p>

            {/* Selected events list */}
            <div className="space-y-2 mb-4 pb-4 border-b border-stellar-200/10">
              {selectedEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      e.event_type === 'Group' ? 'bg-stellar-200/8 text-stellar-300/60' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {e.event_type === 'Group' ? 'GRP' : 'IND'}
                    </span>
                    <span className="text-sm text-gray-300 truncate">{e.name}</span>
                  </div>
                  <span className="font-mono text-sm text-gray-400 ml-2 flex-shrink-0">₹{e.price}</span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5 mb-3">
              {counts.individual > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Individual events × ₹100 <span className="text-gray-600">({counts.individual})</span>
                  </span>
                  <span className="font-mono text-sm text-gray-300">₹{individualTotal}</span>
                </div>
              )}
              {counts.group > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Group events × ₹300 <span className="text-gray-600">({counts.group})</span>
                  </span>
                  <span className="font-mono text-sm text-gray-300">₹{groupTotal}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500">Number of events: {selectedEvents.length}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-stellar-200/10">
              <span className="text-sm font-semibold text-white">Total Amount</span>
              <span className="font-mono text-2xl font-bold text-stellar-300">₹{total}</span>
            </div>
          </div>

          {/* UPI QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <QrCode size={16} className="text-stellar-300" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.15em] uppercase font-medium text-stellar-300/80">Scan to Pay ₹{total}</span>
              </div>
              <div className="relative p-4 bg-white rounded-2xl">
                <img src={qrUrl} alt="UPI Payment QR Code" width={200} height={200} className="rounded-lg" />
              </div>
              <p className="text-xs text-gray-500 mt-4 font-mono">UPI ID: {UPI_ID}</p>
            </div>

            {/* Steps */}
            <div className="flex flex-col justify-center">
              <p className="text-xs tracking-[0.15em] uppercase font-medium text-stellar-300/60 mb-4">Payment Flow</p>
              <ol className="space-y-3">
                {['Scan QR & Pay', 'Enter UTR / Transaction ID', 'Upload Payment Screenshot', 'Confirm Payment'].map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-stellar-200/10 border border-stellar-200/20 flex items-center justify-center text-[10px] font-mono text-stellar-300">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-400">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* UTR input */}
          <div className="mb-6">
            <label className="cosmic-label" htmlFor="utr">UTR / Transaction ID</label>
            <input
              id="utr"
              type="text"
              className={`cosmic-input ${errors.utr && touched.utr ? 'error' : ''}`}
              value={payment.utr}
              onChange={(e) => {
                onChange({ ...payment, utr: e.target.value });
                if (touched.utr) setErrors((prev) => ({ ...prev, utr: validatePayment({ ...payment, utr: e.target.value }).utr ?? '' }));
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, utr: true }));
                setErrors((prev) => ({ ...prev, utr: validatePayment(payment).utr ?? '' }));
              }}
              placeholder="Enter your UTR or transaction reference"
            />
            {errors.utr && touched.utr && (
              <p className="text-xs text-red-400/80 mt-1.5">{errors.utr}</p>
            )}
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="cosmic-label">Payment Screenshot</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInput}
              className="hidden"
            />

            {!payment.screenshotUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 p-10 text-center ${
                  dragOver
                    ? 'border-stellar-200/50 bg-stellar-200/5'
                    : errors.screenshot && touched.screenshot
                    ? 'border-red-400/30 bg-red-400/5'
                    : 'border-stellar-200/15 hover:border-stellar-200/30 bg-cosmos-900/40'
                }`}
              >
                <Upload size={28} className="mx-auto text-stellar-300/50 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-gray-400 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-600">JPG, JPEG, PNG — max 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-cosmos-900/60 border border-stellar-200/20 p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={payment.screenshotUrl}
                    alt="Payment screenshot preview"
                    className="w-24 h-24 object-cover rounded-lg border border-stellar-200/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={16} className="text-stellar-300" strokeWidth={1.5} />
                      <span className="text-sm text-stellar-300 font-medium">Screenshot uploaded</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{payment.screenshotFile?.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {((payment.screenshotFile?.size ?? 0) / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            {errors.screenshot && touched.screenshot && (
              <p className="text-xs text-red-400/80 mt-1.5">{errors.screenshot}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-stellar-200/10">
            <button onClick={onBack} className="btn-ghost w-full sm:w-auto">
              <ArrowLeft size={16} strokeWidth={1.5} />
              Back
            </button>
            <button onClick={handleSubmit} className="btn-primary w-full sm:w-auto">
              Continue to Alignment
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
