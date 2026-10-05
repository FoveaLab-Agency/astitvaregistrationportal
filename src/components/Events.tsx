import { useEffect, useState } from 'react';
import { Check, Loader2, Orbit as OrbitIcon, ArrowRight } from 'lucide-react';
import { fetchActiveEvents } from '@/lib/registration';
import type { EventRow } from '@/lib/supabase';
import Starfield from './Starfield';
import Constellation from './Constellation';

type EventsProps = {
  selectedEvent: EventRow | null;
  onSelect: (event: EventRow) => void;
  onContinue: () => void;
};

export default function Events({ selectedEvent, onSelect, onContinue }: EventsProps) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchActiveEvents();
        if (!cancelled) {
          setEvents(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden">
      <Starfield density={40} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="section-label">02 — Choose Your Path</span>
          <h2 className="cosmic-heading text-4xl sm:text-5xl md:text-6xl mt-4 mb-4">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              The Orbits
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Every path leads somewhere.<br />
            Choose the orbit that defines your emergence.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-stellar-300 animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-gray-500 text-sm tracking-wider">Mapping the orbits...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-panel max-w-md mx-auto p-8 text-center">
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        )}

        {/* Events grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {events.map((event, idx) => {
                const isSelected = selectedEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => onSelect(event)}
                    className={`group relative cursor-pointer rounded-2xl p-6 transition-all duration-500 animate-scale-in ${
                      isSelected
                        ? 'glass-panel-strong border-glow border-stellar-200/40'
                        : 'glass-panel hover:border-stellar-200/25'
                    }`}
                    style={{ animationDelay: `${idx * 0.08}s`, opacity: 0 }}
                  >
                    {/* Constellation overlay */}
                    <Constellation points={4} className="opacity-30 group-hover:opacity-60 transition-opacity duration-700" />

                    {/* Event number */}
                    <div className="relative flex items-center justify-between mb-5">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-stellar-300/40">
                        ORBIT-{String(idx + 1).padStart(2, '0')}
                      </span>
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stellar-200/10 border border-stellar-200/30">
                          <Check size={12} className="text-stellar-300" strokeWidth={2.5} />
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-stellar-300">Selected</span>
                        </div>
                      ) : (
                        <OrbitIcon size={16} className="text-stellar-200/20 group-hover:text-stellar-200/50 transition-colors" strokeWidth={1} />
                      )}
                    </div>

                    {/* Event name */}
                    <h3 className="relative font-display text-lg font-semibold text-white mb-1 group-hover:text-stellar-400 transition-colors">
                      {event.name}
                    </h3>

                    {/* Event type */}
                    <span className="relative inline-block text-[10px] tracking-[0.15em] uppercase text-stellar-300/60 mb-4">
                      {event.event_type}
                    </span>

                    {/* Description */}
                    <p className="relative text-xs text-gray-400 leading-relaxed mb-5 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Price */}
                    <div className="relative flex items-center justify-between pt-4 border-t border-stellar-200/10">
                      <span className="text-[10px] tracking-wider uppercase text-gray-500">Registration Fee</span>
                      <span className="font-mono text-lg font-semibold text-stellar-300">
                        ₹{event.price}
                      </span>
                    </div>

                    {/* Subtle orbital ring decoration */}
                    <div className="absolute -top-8 -right-8 w-24 h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <div className="w-full h-full rounded-full border border-stellar-200/20" />
                      <div className="absolute inset-3 rounded-full border border-stellar-200/10 animate-orbit-slow" style={{ animationDuration: '25s' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-stellar-300/60" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection status + continue */}
            <div className="sticky bottom-6 z-20">
              <div className="glass-panel-strong max-w-2xl mx-auto p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  {selectedEvent ? (
                    <>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-stellar-300/60 mb-1">Orbit Selected</p>
                      <p className="text-sm text-white font-medium">
                        {selectedEvent.name} · <span className="text-stellar-300 font-mono">₹{selectedEvent.price}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Choose an orbit to continue.</p>
                  )}
                </div>
                <button
                  onClick={onContinue}
                  disabled={!selectedEvent}
                  className="btn-primary w-full sm:w-auto whitespace-nowrap"
                >
                  Enter This Orbit
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
