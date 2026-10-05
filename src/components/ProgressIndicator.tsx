type Step = 'orbit' | 'identity' | 'transmission' | 'alignment';

type ProgressIndicatorProps = {
  current: Step;
};

const STEPS: { id: Step; label: string; num: string }[] = [
  { id: 'orbit', label: 'Orbit', num: '01' },
  { id: 'identity', label: 'Identity', num: '02' },
  { id: 'transmission', label: 'Transmission', num: '03' },
  { id: 'alignment', label: 'Alignment', num: '04' },
];

export default function ProgressIndicator({ current }: ProgressIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="relative flex items-center justify-center mb-12">
      {/* Orbital path line */}
      <svg
        className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-px w-full max-w-2xl mx-auto"
        preserveAspectRatio="none"
        viewBox="0 0 800 2"
        aria-hidden="true"
      >
        <line x1="0" y1="1" x2="800" y2="1" stroke="rgba(79, 195, 247, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
        <line
          x1="0"
          y1="1"
          x2={`${(currentIndex / (STEPS.length - 1)) * 800}`}
          y2="1"
          stroke="rgba(79, 195, 247, 0.5)"
          strokeWidth="1"
          className="transition-all duration-700"
        />
      </svg>

      <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
        {STEPS.map((step, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCurrent
                    ? 'bg-stellar-200/10 border border-stellar-200/40 border-glow'
                    : isComplete
                    ? 'bg-stellar-200/15 border border-stellar-200/30'
                    : 'bg-cosmos-900/80 border border-stellar-200/10'
                }`}
              >
                {isComplete && (
                  <div
                    className="absolute inset-0 rounded-full border border-stellar-200/20 animate-orbit-slow"
                    style={{ animationDuration: '15s' }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-stellar-300/60" />
                  </div>
                )}
                <span
                  className={`font-mono text-xs font-semibold ${
                    isCurrent || isComplete ? 'text-stellar-300' : 'text-gray-600'
                  }`}
                >
                  {step.num}
                </span>
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-[10px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${
                  isCurrent
                    ? 'text-stellar-400'
                    : isComplete
                    ? 'text-stellar-300/60'
                    : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
