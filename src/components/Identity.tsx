import { useState } from 'react';
import { ArrowRight, ArrowLeft, User } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import Starfield from './Starfield';
import { validateParticipant, type ParticipantData } from '@/lib/types';

type IdentityProps = {
  data: ParticipantData;
  onChange: (data: ParticipantData) => void;
  onBack: () => void;
  onContinue: () => void;
};

const GENDERS = ['Male', 'Female', 'Other'];

export default function Identity({ data, onChange, onBack, onContinue }: IdentityProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (field: keyof ParticipantData, value: string) => {
    onChange({ ...data, [field]: value });
    if (touched[field]) {
      const newData = { ...data, [field]: value };
      const fieldErrors = validateParticipant(newData);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] ?? '' }));
    }
  };

  const handleBlur = (field: keyof ParticipantData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validateParticipant(data);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] ?? '' }));
  };

  const handleSubmit = () => {
    const allErrors = validateParticipant(data);
    setErrors(allErrors);
    setTouched(Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (Object.values(allErrors).some((e) => e)) return;
    onContinue();
  };

  const inputClass = (field: string) =>
    `cosmic-input ${errors[field] && touched[field] ? 'error' : ''}`;

  return (
    <section className="relative min-h-screen cosmic-bg pt-24 pb-20 px-6 md:px-8 overflow-hidden">
      <Starfield density={30} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="section-label">02 — Define Your Identity</span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">
            <span className="bg-gradient-to-b from-white to-stellar-300 bg-clip-text text-transparent">
              Define Your Identity
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Before entering the orbit, tell us who you are.
          </p>
        </div>

        <ProgressIndicator current="identity" />

        <div className="glass-panel p-6 md:p-10 animate-scale-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-stellar-200/10 border border-stellar-200/20 flex items-center justify-center">
              <User size={18} className="text-stellar-300" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">Participant Details</h3>
              <p className="text-xs text-gray-500">All fields are required</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="cosmic-label" htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                type="text"
                className={inputClass('full_name')}
                value={data.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                onBlur={() => handleBlur('full_name')}
                placeholder="Enter your full name"
              />
              {errors.full_name && touched.full_name && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.full_name}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="cosmic-label" htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                className={inputClass('mobile')}
                value={data.mobile}
                onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                onBlur={() => handleBlur('mobile')}
                placeholder="10-digit mobile number"
              />
              {errors.mobile && touched.mobile && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="cosmic-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={inputClass('email')}
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
              />
              {errors.email && touched.email && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* College */}
            <div className="md:col-span-2">
              <label className="cosmic-label" htmlFor="college">College / Institution</label>
              <input
                id="college"
                type="text"
                className={inputClass('college')}
                value={data.college}
                onChange={(e) => update('college', e.target.value)}
                onBlur={() => handleBlur('college')}
                placeholder="Your college or institution name"
              />
              {errors.college && touched.college && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.college}</p>
              )}
            </div>

            {/* Course */}
            <div>
              <label className="cosmic-label" htmlFor="course">Course</label>
              <input
                id="course"
                type="text"
                className={inputClass('course')}
                value={data.course}
                onChange={(e) => update('course', e.target.value)}
                onBlur={() => handleBlur('course')}
                placeholder="e.g. B.Tech, B.Com, B.A."
              />
              {errors.course && touched.course && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.course}</p>
              )}
            </div>

            {/* Year/Semester */}
            <div>
              <label className="cosmic-label" htmlFor="year_semester">Year / Semester</label>
              <input
                id="year_semester"
                type="text"
                className={inputClass('year_semester')}
                value={data.year_semester}
                onChange={(e) => update('year_semester', e.target.value)}
                onBlur={() => handleBlur('year_semester')}
                placeholder="e.g. 2nd Year, 4th Semester"
              />
              {errors.year_semester && touched.year_semester && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.year_semester}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="cosmic-label" htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                className={inputClass('city')}
                value={data.city}
                onChange={(e) => update('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                placeholder="Your city"
              />
              {errors.city && touched.city && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.city}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="cosmic-label" htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                className={inputClass('age')}
                value={data.age}
                onChange={(e) => update('age', e.target.value.slice(0, 2))}
                onBlur={() => handleBlur('age')}
                placeholder="Your age"
              />
              {errors.age && touched.age && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="md:col-span-2">
              <label className="cosmic-label">Gender</label>
              <div className="flex flex-wrap gap-3">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('gender', g)}
                    onBlur={() => handleBlur('gender')}
                    className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      data.gender === g
                        ? 'bg-stellar-200/10 border border-stellar-200/40 text-stellar-300'
                        : 'bg-cosmos-900/70 border border-stellar-200/15 text-gray-400 hover:border-stellar-200/25 hover:text-stellar-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && touched.gender && (
                <p className="text-xs text-red-400/80 mt-1.5">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-stellar-200/10">
            <button onClick={onBack} className="btn-ghost w-full sm:w-auto">
              <ArrowLeft size={16} strokeWidth={1.5} />
              Back to Orbits
            </button>
            <button onClick={handleSubmit} className="btn-primary w-full sm:w-auto">
              Continue
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
