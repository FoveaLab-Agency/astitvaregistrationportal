import { useEffect, useState } from 'react';
import { Check, Loader2, Users, User, ArrowRight, X } from 'lucide-react';
import { fetchActiveEvents } from '@/lib/registration';
import { calculateTotal, countByType } from '@/lib/types';
import type { EventRow } from '@/lib/supabase';
import Starfield from './Starfield';

type EventsProps = {
  selectedEvents: EventRow[];
  onToggle: (event: EventRow) => void;
  onContinue: () => void;
};

export default function Events({ selectedEvents, onToggle, onContinue }: EventsProps) {
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

  const isSelected = (id: string) => selectedEvents.some((e) => e.id === id);
  const total = calculateTotal(selectedEvents);
  const counts = countByType(selectedEvents);

  // Group events by type
  const groupEvents = events.filter((e) => e.event_type === 'Group');
  const individualEvents = events.filter((e) => e.event_type !== 'Group');

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-32 px-6 md:px-8 overflow-hidden">
      <Starfield density={40} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="section-label">02 — Choose Your Path</span>
          <h2 className="cosmic-heading text-4xl sm:text-5xl md:text-6xl mt-4 mb-4">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              The Orbits
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Every path leads somewhere. Choose the orbits that define your emergence.
          </p>
          <p className="text-gray-500 text-xs mt-3">
            Individual events ₹100 · Group events ₹300 · Select multiple
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-stellar-300 animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-gray-500 text-sm tracking-wider">Loading events...</p>
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
            {/* Individual events */}
            {individualEvents.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <User size={16} className="text-stellar-300/60" strokeWidth={1.5} />
                  <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-stellar-300/60">Individual Events · ₹100</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {individualEvents.map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={idx}
                      selected={isSelected(event.id)}
                      onClick={() => onToggle(event)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Group events */}
            {groupEvents.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <Users size={16} className="text-stellar-300/60" strokeWidth={1.5} />
                  <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-stellar-300/60">Group Events · ₹300</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupEvents.map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={idx}
                      selected={isSelected(event.id)}
                      onClick={() => onToggle(event)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Live summary bar */}
            <div className="sticky bottom-6 z-20">
              <div className="glass-panel-strong max-w-2xl mx-auto p-5">
                {selectedEvents.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left w-full sm:flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-stellar-300/60">
                          {selectedEvents.length} Event{selectedEvents.length > 1 ? 's' : ''} Selected
                        </span>
                        <span className="text-[10px] text-gray-600">·</span>
                        <span className="text-[10px] text-gray-500">
                          {counts.individual} individual, {counts.group} group
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        <span className="font-mono text-stellar-300">₹{total}</span> total
                      </p>
                      {/* Quick chips of selected */}
                      <div className="flex flex-wrap gap-1.5 mt-2 max-h-12 overflow-hidden">
                        {selectedEvents.slice(0, 4).map((e) => (
                          <span key={e.id} className="text-[10px] px-2 py-0.5 rounded-full bg-stellar-200/8 text-stellar-300/70 border border-stellar-200/15">
                            {e.name}
                          </span>
                        ))}
                        {selectedEvents.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 text-gray-500">
                            +{selectedEvents.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onContinue}
                      className="btn-primary w-full sm:w-auto whitespace-nowrap"
                    >
                      Continue
                      <ArrowRight size={16} strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">Select at least one event to continue.</p>
                    <button
                      onClick={onContinue}
                      disabled
                      className="btn-primary opacity-40 cursor-not-allowed whitespace-nowrap"
                    >
                      Continue
                      <ArrowRight size={16} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function EventCard({
  event,
  index,
  selected,
  onClick,
}: {
  event: EventRow;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const isGroup = event.event_type === 'Group';

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer rounded-xl p-5 transition-all duration-300 animate-scale-in ${
        selected
          ? 'glass-panel-strong border-stellar-200/40 border-glow'
          : 'glass-panel hover:border-stellar-200/25'
      }`}
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      {/* Selection indicator */}
      <div className="relative flex items-center justify-between mb-4">
        <span className={`font-mono text-[9px] tracking-[0.15em] ${selected ? 'text-stellar-300' : 'text-stellar-300/30'}`}>
          {isGroup ? 'GROUP' : 'INDIVIDUAL'}
        </span>
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${
            selected
              ? 'bg-stellar-200/15 border-stellar-200/50'
              : 'border-stellar-200/20 group-hover:border-stellar-200/40'
          }`}
        >
          {selected && <Check size={14} className="text-stellar-300" strokeWidth={2.5} />}
        </div>
      </div>

      {/* Event name */}
      <h3 className={`relative font-display text-base font-semibold mb-1 transition-colors ${
        selected ? 'text-stellar-400' : 'text-white group-hover:text-stellar-400'
      }`}>
        {event.name}
      </h3>

      {/* Event type */}
      <span className="relative inline-block text-[10px] tracking-[0.12em] uppercase text-stellar-300/50 mb-3">
        {event.event_type}
      </span>

      {/* Description */}
      <p className="relative text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
        {event.description}
      </p>

      {/* Price */}
      <div className="relative flex items-center justify-between pt-3 border-t border-stellar-200/10">
        <span className="text-[9px] tracking-wider uppercase text-gray-500">Fee</span>
        <span className="font-mono text-base font-semibold text-stellar-300">
          ₹{event.price}
        </span>
      </div>
    </div>
  );
}
