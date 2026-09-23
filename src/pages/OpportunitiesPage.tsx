import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, Award, BookOpen, Lock, CheckCircle2, X, Calendar, GraduationCap } from 'lucide-react';
import { KNOBZ, KNOBZ_CERTIFICATES, CAREER_PATHS, MELSOFT, MELSOFT_PROGRAMMES } from '../constants';
import { cn } from '../lib/utils';

function getRecommendedPathId(): string {
  try {
    const raw = localStorage.getItem('saved_recommendations');
    const saved: string[] = raw ? JSON.parse(raw) : [];
    return saved.find(id => CAREER_PATHS.some(p => p.id === id)) || '';
  } catch {
    return '';
  }
}

export default function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathParam = searchParams.get('path') || '';
  const activePath = CAREER_PATHS.find(p => p.id === (pathParam || getRecommendedPathId()));
  const targetCert = activePath?.certificate;
  const matchesPath = (careerPaths: string[]) => !!activePath && careerPaths.includes(activePath.id);
  // Programmes that suit the user's path come first; the rest keep their original order.
  const melsoftProgrammes = [...MELSOFT_PROGRAMMES].sort(
    (a, b) => Number(matchesPath(b.careerPaths)) - Number(matchesPath(a.careerPaths))
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Learning & Certificates</h1>
        <p className="text-gray-600 max-w-2xl">
          Build your skills and earn a verified certificate on {KNOBZ.name}, then go further with an accredited programme from {MELSOFT.name}.
        </p>
      </div>

      {/* Active path banner */}
      {activePath && (
        <div className="flex items-center justify-between gap-4 px-5 py-3 bg-purple-50 border border-purple-100 rounded-2xl">
          <p className="text-sm font-bold text-purple-700">
            Your path: <span className="text-purple-900">{activePath.title}</span>. Target: Certificate {activePath.certificate}
          </p>
          {pathParam && (
            <button
              onClick={() => setSearchParams({})}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-500 hover:text-purple-700 transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Partner CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 text-white relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4 md:space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            Learning Partner
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Earn your certificate on {KNOBZ.name}
          </h2>
          <p className="text-purple-100 text-sm md:text-lg leading-relaxed">
            Sign up, work through the lessons and quizzes at your own pace, and get a certificate employers can verify when you finish.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <a
              href={KNOBZ.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-purple-800 rounded-2xl font-bold text-sm md:text-base hover:bg-purple-50 transition-all flex items-center gap-2 shadow-xl"
            >
              Sign Up Now
              <ExternalLink size={16} />
            </a>
            <a
              href={KNOBZ.coursesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-8 py-3 md:py-4 bg-purple-600/30 border border-white/20 text-white rounded-2xl font-bold text-sm md:text-base hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Browse Courses
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </motion.div>

      {/* Certificate pathway */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">The Certificate Pathway</h2>
          <p className="text-gray-500 text-sm">
            Each certificate builds on the last and unlocks in order, from Beginner to Advanced.
          </p>
        </div>

        <div className="space-y-4">
          {KNOBZ_CERTIFICATES.map((cert, i) => {
            const isTarget = cert.number === targetCert;
            const isOnTheWay = targetCert !== undefined && cert.number < targetCert;
            return (
              <motion.div
                key={cert.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'bg-white rounded-3xl p-6 border shadow-sm flex flex-col sm:flex-row gap-5 sm:items-center',
                  isTarget ? 'border-purple-400 ring-2 ring-purple-100' : 'border-purple-50'
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-xl font-black shrink-0">
                  {cert.number}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{cert.title}</h3>
                    {isTarget && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award size={12} /> Your target
                      </span>
                    )}
                    {isOnTheWay && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12} /> On your way
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-purple-600 font-medium">{cert.subtitle}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{cert.description}</p>
                </div>
                <div className="flex sm:flex-col gap-3 sm:items-end text-xs text-gray-400 shrink-0">
                  <span className="flex items-center gap-1"><BookOpen size={14} /> {cert.modules} modules</span>
                  <span className="flex items-center gap-1">
                    {cert.number === 1 ? <CheckCircle2 size={14} /> : <Lock size={14} />}
                    {cert.level}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <a
          href={KNOBZ.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
        >
          Start Certificate 1 on {KNOBZ.name}
          <ExternalLink size={16} />
        </a>
      </section>

      {/* Melsoft Academy */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Accredited Programmes from {MELSOFT.name}</h2>
            <p className="text-gray-500 text-sm">
              Full qualifications and bootcamps for when you're ready to go further.
            </p>
          </div>
          <a
            href={MELSOFT.fundingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            Funding options <ExternalLink size={14} />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {melsoftProgrammes.map((prog, i) => {
            const isMatch = matchesPath(prog.careerPaths);
            return (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'bg-white rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col',
                  isMatch ? 'border-purple-400 ring-2 ring-purple-100' : 'border-purple-50'
                )}
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      prog.track === 'Accredited' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    )}>
                      {prog.track}
                    </span>
                    {isMatch && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award size={12} /> Matches your path
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{prog.title}</h3>
                    <p className="text-sm text-purple-600 font-medium">{MELSOFT.name}</p>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{prog.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-purple-50 space-y-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {prog.duration}</span>
                    {prog.accreditation && (
                      <span className="flex items-center gap-1"><GraduationCap size={14} /> {prog.accreditation}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{prog.cost}</span>
                    <a
                      href={MELSOFT.programmeUrl(prog.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View Programme
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
