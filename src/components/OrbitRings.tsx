type OrbitRingsProps = {
  className?: string;
  variant?: 'hero' | 'card' | 'section';
};

export default function OrbitRings({ className = '', variant = 'section' }: OrbitRingsProps) {
  if (variant === 'hero') {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <div className="relative w-[600px] h-[600px] max-w-[90vw] max-h-[90vw]">
          {/* Outer orbit */}
          <div
            className="absolute inset-0 rounded-full border border-stellar-200/8 animate-orbit-slow"
            style={{ borderStyle: 'dashed' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-stellar-300/60" style={{ boxShadow: '0 0 8px rgba(109, 213, 250, 0.8)' }} />
          </div>
          {/* Middle orbit */}
          <div className="absolute inset-[12%] rounded-full border border-stellar-200/12 animate-orbit-reverse-slow">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-stellar-400/50" style={{ boxShadow: '0 0 6px rgba(167, 232, 255, 0.7)' }} />
          </div>
          {/* Inner orbit */}
          <div className="absolute inset-[24%] rounded-full border border-stellar-200/15 animate-orbit-slow" style={{ animationDuration: '40s' }}>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-stellar-300/70" style={{ boxShadow: '0 0 6px rgba(109, 213, 250, 0.8)' }} />
          </div>
          {/* Core glow */}
          <div className="absolute inset-[40%] rounded-full bg-gradient-radial from-stellar-200/20 to-transparent animate-glow-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div className="relative w-32 h-32 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-full border border-stellar-200/15" />
          <div className="absolute inset-[15%] rounded-full border border-stellar-200/10 animate-orbit-slow" style={{ animationDuration: '30s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-stellar-300/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="relative w-[400px] h-[400px] max-w-[80vw] max-h-[80vw] opacity-30">
        <div className="absolute inset-0 rounded-full border border-stellar-200/8 animate-orbit-slow" style={{ animationDuration: '90s', borderStyle: 'dashed' }} />
        <div className="absolute inset-[20%] rounded-full border border-stellar-200/6 animate-orbit-reverse-slow" style={{ animationDuration: '70s' }} />
      </div>
    </div>
  );
}
