import { useEffect, useRef, useState } from 'react';

export default function NebulaGlow({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setOffset({ x: dx * 30, y: dy * 30 });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-20 transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(79, 195, 247, 0.3) 0%, transparent 70%)',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-15 transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(46, 36, 116, 0.5) 0%, transparent 70%)',
          transform: `translate(${-offset.x}px, ${-offset.y}px)`,
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
