import { useState, useCallback } from 'react';
import type { View } from './components/NavBar';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import Events from './components/Events';
import Identity from './components/Identity';
import Transmission from './components/Transmission';
import Alignment from './components/Alignment';
import Confirmation, { RegistrationLoading, RegistrationError } from './components/Confirmation';
import IdentityPass from './components/IdentityPass';
import ExistingOrbit from './components/ExistingOrbit';
import VerifyPage from './components/VerifyPage';
import type { EventRow } from './lib/supabase';
import {
  EMPTY_PARTICIPANT,
  EMPTY_PAYMENT,
  calculateTotal,
  type ParticipantData,
  type PaymentData,
  type RegistrationResult,
} from './lib/types';
import {
  checkDuplicate,
  generateUniqueRegistrationId,
  generateQrToken,
  uploadPaymentScreenshot,
  insertRegistration,
  insertRegistrationEvents,
} from './lib/registration';
import { generateAndStorePass, type PassRecord } from './lib/pass';

type Phase = 'form' | 'loading' | 'error';

export default function App() {
  const [view, setView] = useState<View>('universe');
  const [selectedEvents, setSelectedEvents] = useState<EventRow[]>([]);
  const [participant, setParticipant] = useState<ParticipantData>(EMPTY_PARTICIPANT);
  const [payment, setPayment] = useState<PaymentData>(EMPTY_PAYMENT);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [passRecord, setPassRecord] = useState<PassRecord | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [submitError, setSubmitError] = useState('');

  // Check if we're on a verification route: /#/verify/<token>
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const verifyMatch = hash.match(/^#\/verify\/(.+)$/);
  const verifyToken = verifyMatch ? verifyMatch[1] : null;

  const navigate = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleToggleEvent = (event: EventRow) => {
    setSelectedEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (exists) return prev.filter((e) => e.id !== event.id);
      return [...prev, event];
    });
  };

  const handleEventsContinue = () => {
    if (selectedEvents.length > 0) navigate('identity');
  };

  const handleIdentityContinue = () => {
    navigate('transmission');
  };

  const handleTransmissionContinue = () => {
    navigate('alignment');
  };

  const handleConfirm = async () => {
    if (selectedEvents.length === 0 || !payment.screenshotFile) return;
    setPhase('loading');
    setSubmitError('');

    try {
      // Step 1: Duplicate check
      const isDuplicate = await checkDuplicate(participant.mobile, participant.email);
      if (isDuplicate) {
        setPhase('form');
        navigate('existing');
        return;
      }

      // Step 2: Generate unique registration ID based on event count
      const registrationId = await generateUniqueRegistrationId(selectedEvents.length);
      const qrToken = generateQrToken();

      // Step 3: Upload screenshot
      const screenshotUrl = await uploadPaymentScreenshot(payment.screenshotFile, registrationId);

      // Step 4: Insert registration
      const totalAmount = calculateTotal(selectedEvents);
      const { id: regUuid } = await insertRegistration({
        registration_id: registrationId,
        full_name: participant.full_name.trim(),
        mobile: participant.mobile.trim(),
        email: participant.email.trim().toLowerCase(),
        college: participant.college.trim(),
        course: participant.course.trim(),
        year_semester: participant.year_semester.trim(),
        city: participant.city.trim(),
        age: parseInt(participant.age, 10),
        gender: participant.gender,
        payment_amount: totalAmount,
        payment_utr: payment.utr.trim(),
        payment_screenshot_url: screenshotUrl,
        qr_token: qrToken,
      });

      // Step 5: Insert all registration-event links (batch)
      await insertRegistrationEvents(
        regUuid,
        selectedEvents.map((e) => ({ id: e.id, price: Number(e.price) }))
      );

      // Step 6: Generate, upload, and record the PDF pass
      const regResult: RegistrationResult = {
        registrationId,
        participantName: participant.full_name.trim(),
        gender: participant.gender,
        selectedEvents,
        totalAmount,
        paymentStatus: 'pending',
        qrToken,
      };
      const pass = await generateAndStorePass(regResult, participant);

      // Step 7: Success — only after pass is stored
      setResult(regResult);
      setPassRecord(pass);
      setPhase('form');
      navigate('confirmed');
    } catch (e) {
      setSubmitError((e as Error).message || 'Something went wrong during registration.');
      setPhase('error');
    }
  };

  const handleRetry = () => {
    setPhase('form');
    setSubmitError('');
    navigate('alignment');
  };

  const handleHome = () => {
    setSelectedEvents([]);
    setParticipant(EMPTY_PARTICIPANT);
    setPayment(EMPTY_PAYMENT);
    setResult(null);
    setPassRecord(null);
    setPhase('form');
    setSubmitError('');
    navigate('universe');
  };

  const handleEnterUniverse = () => {
    navigate('orbits');
  };

  // Verification page (separate route)
  if (verifyToken) {
    return <VerifyPage token={verifyToken} />;
  }

  // Loading state during submission
  if (phase === 'loading') {
    return (
      <div className="min-h-screen">
        <NavBar view={view} onNavigate={navigate} />
        <RegistrationLoading />
      </div>
    );
  }

  // Error state during submission
  if (phase === 'error') {
    return (
      <div className="min-h-screen">
        <NavBar view={view} onNavigate={navigate} />
        <RegistrationError message={submitError} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar view={view} onNavigate={navigate} />

      {view === 'universe' && (
        <Hero
          onEnter={handleEnterUniverse}
          onExplore={() => navigate('orbits')}
          onExisting={() => navigate('existing')}
        />
      )}

      {view === 'orbits' && (
        <Events
          selectedEvents={selectedEvents}
          onToggle={handleToggleEvent}
          onContinue={handleEventsContinue}
        />
      )}

      {view === 'identity' && (
        <Identity
          data={participant}
          onChange={setParticipant}
          onBack={() => navigate('orbits')}
          onContinue={handleIdentityContinue}
        />
      )}

      {view === 'transmission' && (
        <Transmission
          payment={payment}
          onChange={setPayment}
          selectedEvents={selectedEvents}
          onBack={() => navigate('identity')}
          onContinue={handleTransmissionContinue}
        />
      )}

      {view === 'alignment' && (
        <Alignment
          participant={participant}
          payment={payment}
          selectedEvents={selectedEvents}
          onBack={() => navigate('transmission')}
          onConfirm={handleConfirm}
        />
      )}

      {view === 'confirmed' && result && (
        <Confirmation
          result={result}
          onViewPass={() => navigate('pass')}
          onHome={handleHome}
        />
      )}

      {view === 'pass' && result && (
        <IdentityPass
          result={result}
          participant={participant}
          onBack={() => navigate('confirmed')}
        />
      )}

      {view === 'existing' && (
        <ExistingOrbit onBack={() => navigate('universe')} />
      )}

      {/* Footer */}
      <footer className="relative bg-cosmos-950 border-t border-stellar-200/8 py-8 px-6 text-center">
        <p className="font-display text-sm tracking-[0.2em] text-stellar-300/40 mb-2">ASTITVA</p>
        <p className="text-xs text-gray-600">Emergence Beyond Existence · 2026</p>
      </footer>
    </div>
  );
}
