import { Orbit, Compass, ContactRound } from 'lucide-react';
import Starfield from './Starfield';
import NebulaGlow from './NebulaGlow';
import OrbitRings from './OrbitRings';

type HeroProps = {
  onEnter: () => void;
  onExplore: () => void;
  onExisting: () => void;
};

export default function Hero({ onEnter, onExplore, onExisting }: HeroProps) {
  return (
    <section className="relative min-h-screen cosmic-bg flex items-center justify-center overflow-hidden">
      <Starfield density={120} />
      <NebulaGlow />
      <OrbitRings variant="hero" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmos-950/0 via-cosmos-950/0 to-cosmos-950 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-cosmos-950/50 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
        {/* Section label */}
        <div className="animate-fade-in-down mb-8">
          <span className="section-label">The Universe of</span>
        </div>

        {/* Main title */}
        <h1
          className="cosmic-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 animate-fade-in-up text-glow"
          style={{ animationDelay: '0.2s', opacity: 0 }}
        >
          <span className="bg-gradient-to-b from-white via-stellar-400 to-stellar-200 bg-clip-text text-transparent">
            ASTITVA
          </span>
        </h1>

        {/* Secondary */}
        <p
          className="font-display text-base sm:text-lg md:text-xl tracking-[0.4em] uppercase text-stellar-300/80 mb-10 animate-fade-in-up"
          style={{ animationDelay: '0.4s', opacity: 0 }}
        >
          Emergence Beyond Existence
        </p>

        {/* Supporting line */}
        <div
          className="max-w-2xl mx-auto mb-14 animate-fade-in-up"
          style={{ animationDelay: '0.6s', opacity: 0 }}
        >
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
            <span className="block">Every identity is a universe.</span>
            <span className="block">Every choice creates an orbit.</span>
            <span className="block">Every emergence changes the world around it.</span>
          </p>
        </div>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.8s', opacity: 0 }}
        >
          <button onClick={onEnter} className="btn-primary w-full sm:w-auto">
            <Orbit size={18} strokeWidth={2} />
            Enter the Universe
          </button>
          <button onClick={onExplore} className="btn-secondary w-full sm:w-auto">
            <Compass size={18} strokeWidth={1.5} />
            Explore Events
          </button>
          <button onClick={onExisting} className="btn-ghost w-full sm:w-auto">
            <ContactRound size={16} strokeWidth={1.5} />
            Already Registered
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1.2s', opacity: 0 }}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gray-600">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-stellar-200/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
