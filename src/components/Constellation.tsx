import { useMemo } from 'react';

type ConstellationProps = {
  className?: string;
  points?: number;
};

export default function Constellation({ className = '', points = 6 }: ConstellationProps) {
  const { dots, lines } = useMemo(() => {
    const dots = Array.from({ length: points }, () => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    }));
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < dots.length - 1; i++) {
      lines.push({
        x1: dots[i].x,
        y1: dots[i].y,
        x2: dots[i + 1].x,
        y2: dots[i + 1].y,
      });
    }
    return { dots, lines };
  }, [points]);

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(79, 195, 247, 0.15)"
          strokeWidth="0.2"
        />
      ))}
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r="0.6"
          fill="rgba(167, 232, 255, 0.5)"
          className="animate-twinkle"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </svg>
  );
}
