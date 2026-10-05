import { Sparkles, Orbit, Rocket, ContactRound, FileText } from 'lucide-react';

export type View =
  | 'universe'
  | 'orbits'
  | 'identity'
  | 'transmission'
  | 'alignment'
  | 'confirmed'
  | 'pass'
  | 'existing'
  | 'passManagement';

type NavProps = {
  view: View;
  onNavigate: (view: View) => void;
};

const NAV_ITEMS: { label: string; view: View; icon: typeof Orbit }[] = [
  { label: 'The Universe', view: 'universe', icon: Sparkles },
  { label: 'The Orbits', view: 'orbits', icon: Orbit },
  { label: 'Enter Your Orbit', view: 'identity', icon: Rocket },
];

export default function NavBar({ view, onNavigate }: NavProps) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        view === 'universe'
          ? 'bg-transparent'
          : 'bg-cosmos-950/80 backdrop-blur-xl border-b border-stellar-200/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate('universe')}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-stellar-200/30 group-hover:border-stellar-200/60 transition-colors" />
            <div className="absolute inset-1.5 rounded-full border border-stellar-200/20 animate-orbit-slow" style={{ animationDuration: '20s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-stellar-300" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-stellar-200" style={{ boxShadow: '0 0 8px rgba(79, 195, 247, 0.8)' }} />
          </div>
          <span className="font-display font-bold text-sm tracking-[0.2em] text-stellar-400">
            ASTITVA
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-stellar-400 bg-stellar-200/5'
                    : 'text-gray-400 hover:text-stellar-400 hover:bg-stellar-200/5'
                }`}
              >
                <Icon size={14} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('passManagement')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
              view === 'passManagement'
                ? 'text-stellar-400 border border-stellar-200/30'
                : 'text-gray-500 hover:text-stellar-400 border border-transparent'
            }`}
          >
            <FileText size={14} strokeWidth={1.5} />
            Passes
          </button>
          <button
            onClick={() => onNavigate('existing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
              view === 'existing'
                ? 'text-stellar-400 border border-stellar-200/30'
                : 'text-gray-500 hover:text-stellar-400 border border-transparent'
            }`}
          >
            <ContactRound size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">Existing Orbit</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-center gap-1 pb-2 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider uppercase transition-all ${
                isActive
                  ? 'text-stellar-400 bg-stellar-200/10'
                  : 'text-gray-500'
              }`}
            >
              {item.label.replace('The ', '')}
            </button>
          );
        })}
      </div>
    </header>
  );
}
