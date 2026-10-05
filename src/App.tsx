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
import type { EventRow } from './lib/supabase';
import {
  EMPTY_PARTICIPANT,
  EMPTY_PAYMENT,
  type ParticipantData,
  type PaymentData,
  type RegistrationResult,
} from './lib/types';
import {
  checkDuplicate,
  generateRegistrationId,
  generateQrToken,
  uploadPaymentScreenshot,
  insertRegistration,
  insertRegistrationEvent,
} from './lib/registration';

type Phase = 'form' | 'loading' | 'error';

export default function App() {
  const [view, setView] = useState<View>('universe');
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [participant, setParticipant] = useState<ParticipantData>(EMPTY_PARTICIPANT);
  const [payment, setPayment] = useState<PaymentData>(EMPTY_PAYMENT);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [submitError, setSubmitError] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  const navigate = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleEventSelect = (event: EventRow) => {
    setSelectedEvent(event);
  };

  const handleEventsContinue = () => {
    if (selectedEvent) navigate('identity');
  };

  const handleIdentityContinue = () => {
    navigate('transmission');
  };

  const handleTransmissionContinue = () => {
    navigate('alignment');
  };

  const handleConfirm = async () => {
    if (!selectedEvent || !payment.screenshotFile) return;
    setPhase('loading');
    setSubmitError('');

    try {
      // Step 1: Duplicate check
      const isDuplicate = await checkDuplicate(participant.mobile, participant.email);
      if (isDuplicate) {
        setDuplicate(true);
        setPhase('form');
        navigate('existing');
        return;
      }

      // Step 2: Generate IDs
      const registrationId = generateRegistrationId();
      const qrToken = generateQrToken();

      // Step 3: Upload screenshot
      const screenshotUrl = await uploadPaymentScreenshot(payment.screenshotFile, registrationId);

      // Step 4: Insert registration
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
        payment_amount: selectedEvent.price,
        payment_utr: payment.utr.trim(),
        payment_screenshot_url: screenshotUrl,
        qr_token: qrToken,
      });

      // Step 5: Insert registration-event link
      await insertRegistrationEvent(regUuid, selectedEvent.id, selectedEvent.price);

      // Step 6: Success
      setResult({
        registrationId,
        participantName: participant.full_name.trim(),
        eventName: selectedEvent.name,
        amount: selectedEvent.price,
        paymentStatus: 'pending',
        qrToken,
      });
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
    // Reset state for a new registration
    setSelectedEvent(null);
    setParticipant(EMPTY_PARTICIPANT);
    setPayment(EMPTY_PAYMENT);
    setResult(null);
    setDuplicate(false);
    setPhase('form');
    setSubmitError('');
    navigate('universe');
  };

  const handleEnterUniverse = () => {
    navigate('orbits');
  };

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
          selectedEvent={selectedEvent}
          onSelect={handleEventSelect}
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
          selectedEvent={selectedEvent}
          onBack={() => navigate('identity')}
          onContinue={handleTransmissionContinue}
        />
      )}

      {view === 'alignment' && (
        <Alignment
          participant={participant}
          payment={payment}
          selectedEvent={selectedEvent}
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
