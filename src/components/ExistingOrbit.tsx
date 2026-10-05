import { useState } from 'react';
import { Search, AlertCircle, ArrowLeft, Mail, Phone, Loader2 } from 'lucide-react';
import Starfield from './Starfield';
import { fetchRegistrationByPublicId } from '@/lib/registration';

type ExistingOrbitProps = {
  onBack: () => void;
};

export default function ExistingOrbit({ onBack }: ExistingOrbitProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<{ id: string; name: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setFound(null);
    setNotFound(false);

    try {
      const reg = await fetchRegistrationByPublicId(query.trim());
      if (reg) {
        setFound({ id: reg.registration_id, name: reg.full_name });
      } else {
        setNotFound(true);
      }
    } catch {
      setError('Unable to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden flex items-center">
      <Starfield density={40} />

      <div className="relative z-10 max-w-lg mx-auto w-full">
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="section-label">Existing Orbit</span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              Existing Orbit
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            This identity has already entered the ASTITVA universe.
          </p>
        </div>

        {/* Search */}
        <div className="glass-panel p-6 md:p-8 animate-scale-in mb-6">
          <label className="cosmic-label" htmlFor="search">Look up your registration</label>
          <div className="flex gap-3">
            <input
              id="search"
              type="text"
              className="cosmic-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="AST-26-XXXXXX"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn-primary px-4 whitespace-nowrap"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} strokeWidth={2} />}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">Enter your registration ID to check your status.</p>

          {notFound && (
            <div className="mt-5 p-4 rounded-lg bg-yellow-400/5 border border-yellow-400/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-400/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-yellow-400/90 font-medium">No orbit found</p>
                <p className="text-xs text-gray-400 mt-1">This registration ID does not exist in our universe. Please check and try again.</p>
              </div>
            </div>
          )}

          {found && (
            <div className="mt-5 p-4 rounded-lg bg-stellar-200/5 border border-stellar-200/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stellar-200/10 border border-stellar-200/30 flex items-center justify-center flex-shrink-0">
                <Search size={16} className="text-stellar-300" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stellar-300 font-medium">Identity verified</p>
                <p className="text-xs text-gray-400 mt-1">
                  {found.name} — <span className="font-mono text-stellar-300/80">{found.id}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Your orbit is confirmed. See you at ASTITVA.</p>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400/80 mt-4">{error}</p>}
        </div>

        {/* Already registered info */}
        <div className="glass-panel p-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-stellar-200/10 border border-stellar-200/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-stellar-300" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-semibold text-white mb-2">Need help?</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                If you believe this is an error, or you need to update your information, reach out to us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Mail size={14} className="text-stellar-300/60" strokeWidth={1.5} />
                  <a href="mailto:astitva@college.edu" className="hover:text-stellar-300 transition-colors">astitva@college.edu</a>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone size={14} className="text-stellar-300/60" strokeWidth={1.5} />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button onClick={onBack} className="btn-ghost">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Return to Universe
          </button>
        </div>
      </div>
    </section>
  );
}
