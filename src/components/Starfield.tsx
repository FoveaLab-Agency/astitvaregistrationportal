import { useMemo } from 'react';

type StarfieldProps = {
  density?: number;
  className?: string;
};

type Star = {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
};

export default function Starfield({ density = 80, className = '' }: StarfieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: density }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() < 0.85 ? 1 : Math.random() < 0.7 ? 2 : 3,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, [density]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-stellar-400 animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow: star.size > 1 ? '0 0 4px rgba(167, 232, 255, 0.8)' : 'none',
          }}
        />
      ))}
    </div>
  );
}
