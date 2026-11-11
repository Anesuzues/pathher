import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code, Briefcase, FileCheck, Bot,
  ArrowRight, CheckCircle2, Bookmark, Share2, Sparkles, Award, ExternalLink, Users, Lightbulb, RefreshCw
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { saveUserField } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { CAREER_PATHS, KNOBZ } from '../constants';
import { findCertificate, loadKnobzCertificates, useKnobzCertificates } from '../lib/knobzCatalogue';
import { AiLimitError, buildAiInput, getAiResult, type AiInput, type CareerResult } from '../lib/ai';
import { CareerPath } from '../types';
import { rankCareerPaths } from '../lib/recommend';
import { markReadinessStep } from '../lib/useReadiness';
import { cn, readJSON, readStringList } from '../lib/utils';

const iconMap: Record<string, any> = { Code, Briefcase, FileCheck, Bot };

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<CareerPath[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [shareToast, setShareToast] = useState('');
  // AI-written text for all recommended paths; the built-in text shows until it arrives.
  const [aiCareer, setAiCareer] = useState<CareerResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState<AiInput | null>(null);
  const [aiNotice, setAiNotice] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCertificate } = useKnobzCertificates();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Try Firestore first, fall back to localStorage
      let userDoc: Record<string, any> | null = null;
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) userDoc = snap.data();
        } catch (e) {
          console.error('Failed to load profile from Firestore:', e);
        }
      }
      if (cancelled) return;

      let profile = userDoc?.profile ?? null;
      if (profile) localStorage.setItem('pathher_profile', JSON.stringify(profile));
      else profile = readJSON<any>('pathher_profile', null);

      if (!profile) {
        navigate('/onboarding', { replace: true });
        return;
      }

      setProfileName(typeof profile.fullName === 'string' ? profile.fullName.split(' ')[0] || 'there' : 'there');
      setInterests(Array.isArray(profile.interests) ? profile.interests : []);

      // Saved recommendations — Firestore preferred, localStorage fallback
      const fromFirestore: string[] = Array.isArray(userDoc?.savedRecommendations) ? userDoc.savedRecommendations : [];
      if (fromFirestore.length > 0) {
        setSaved(fromFirestore);
        localStorage.setItem('saved_recommendations', JSON.stringify(fromFirestore));
      } else {
        setSaved(readStringList('saved_recommendations'));
      }

      const ranked = rankCareerPaths(profile).slice(0, 3);
      setRecommendations(ranked);
      setIsLoading(false);

      // Personalise the recommendations. The rules above already chose the paths and
      // certificate; the AI only writes the text, so a failure changes nothing else.
      if (user && ranked[0]) {
        setAiLoading(true);
        try {
          const certs = await loadKnobzCertificates();
          const cert = findCertificate(certs, ranked[0].certificate);
          if (cert) {
            const input = buildAiInput(profile, ranked[0], cert, { otherPaths: ranked.slice(1) });
            if (!cancelled) setAiInput(input);
            const result = await getAiResult('career', input);
            if (!cancelled) setAiCareer(result);
          }
        } catch (e) {
          console.warn('AI personalisation unavailable, showing built-in text:', e);
          if (!cancelled && e instanceof AiLimitError) setAiNotice(e.message);
        } finally {
          if (!cancelled) setAiLoading(false);
        }
      }
    };

    load();

    return () => { cancelled = true; };
  }, [user, navigate]);

  const regenerateCareer = async () => {
    if (!aiInput || aiLoading) return;
    setAiLoading(true);
    setAiNotice('');
    try {
      setAiCareer(await getAiResult('career', aiInput, { regenerate: true }));
    } catch (e) {
      setAiNotice(e instanceof AiLimitError ? e.message : 'The AI writer is unavailable right now. Try again in a minute.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSave = (id: string) => {
    const updated = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id];
    setSaved(updated);
    localStorage.setItem('saved_recommendations', JSON.stringify(updated));
    if (user) saveUserField(user.uid, 'savedRecommendations', updated);
  };

  const handleShare = async (path: CareerPath) => {
    // The "why it fits" text speaks to the user as "you", so it doesn't belong in a post written as them.
    const cert = getCertificate(path.certificate);
    const text = `I'm exploring the ${path.title} career path on PathHer AI, working towards Certificate ${cert.number}: ${cert.title} on ${KNOBZ.name}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `PathHer AI — ${path.title}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareToast('Copied to clipboard!');
        setTimeout(() => setShareToast(''), 2500);
      }
    } catch { /* share sheet dismissed or clipboard blocked */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-purple-600 animate-pulse" size={24} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Analyzing Your Profile...</h2>
          <p className="text-gray-500">Matching you to a career path and certificate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl z-50">
          {shareToast}
        </div>
      )}

      <div className="text-center space-y-3 md:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Your Career Recommendations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          {interests.length > 0
            ? `Based on your interests in ${interests.slice(0, 2).join(' and ')}, ${profileName}, here are ${recommendations.length} paths matched to you. Each one comes with a certificate you can earn on ${KNOBZ.name}.`
            : `Here are ${recommendations.length} paths matched to your profile. Each one comes with a certificate you can earn on ${KNOBZ.name}.`}
        </p>
      </div>

      <div className="grid gap-8">
        {recommendations.map((path, index) => {
          const Icon = iconMap[path.icon] || Code;
          const isSaved = saved.includes(path.id);
          const cert = getCertificate(path.certificate);
          // AI text for this card: the best match has its own fields, the others come from otherFits.
          const aiFit = aiCareer ? (index === 0 ? aiCareer.whyItFits : aiCareer.otherFits?.[index - 1]) : undefined;
          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 lg:p-10 shadow-sm border border-purple-50 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-100">
                    <Icon size={40} />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-xl md:text-2xl font-bold group-hover:text-purple-700 transition-colors">{path.title}</h2>
                      <p className="text-purple-600 font-medium text-xs md:text-sm">
                        {index === 0 ? 'Your best match' : 'Also a strong match'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSave(path.id)}
                        title={isSaved ? 'Unsave' : 'Save'}
                        className={cn('p-2 transition-colors', isSaved ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600')}
                      >
                        <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleShare(path)}
                        title="Share"
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Why it fits you
                        {aiFit && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={10} /> Personalised
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {aiFit || path.whyItFits}
                      </p>
                      {index === 0 && aiCareer && (
                        <p className="text-purple-700 font-medium leading-relaxed">{aiCareer.encouragement}</p>
                      )}
                      {aiLoading && !aiFit && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Sparkles size={12} className="animate-pulse" /> Personalising this for you…
                        </p>
                      )}
                    </div>

                    {index === 0 && aiCareer && (
                      <div className="space-y-4 rounded-2xl bg-purple-50/60 border border-purple-100 p-5">
                        <div className="space-y-2">
                          <h3 className="font-bold text-gray-900">Your next steps</h3>
                          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                            {/* KnobzToLearn always comes first, and is written here rather than by the AI. */}
                            <li>
                              <span className="font-semibold">
                                Sign up on {KNOBZ.name} and start Certificate 1: {getCertificate(1).title}
                              </span>
                              {cert.number > 1 && `, then work up to Certificate ${cert.number}: ${cert.title}`}.
                            </li>
                            {aiCareer.nextSteps.map(step => <li key={step}>{step}</li>)}
                          </ol>
                        </div>
                        {aiCareer.networkingTip && (
                          <div className="space-y-1">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                              <Users size={16} className="text-purple-600" /> Networking tip
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{aiCareer.networkingTip}</p>
                          </div>
                        )}
                        {aiCareer.careerInsight && (
                          <div className="space-y-1">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                              <Lightbulb size={16} className="text-pink-500" /> Your edge
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{aiCareer.careerInsight}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] text-gray-400">Written by AI from your answers. Check anything before you rely on it.</p>
                          <button
                            onClick={regenerateCareer}
                            disabled={aiLoading}
                            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                          >
                            <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                            {aiLoading ? 'Rewriting…' : 'Rewrite this'}
                          </button>
                        </div>
                      </div>
                    )}
                    {index === 0 && aiNotice && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{aiNotice}</p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-900">Skills to build</h3>
                        <div className="flex flex-wrap gap-2">
                          {path.skillsNeeded.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Award size={18} className="text-pink-500" />
                          Your certificate
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-800">
                            Certificate {cert.number}: {cert.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {cert.level} · {cert.modules} modules on {KNOBZ.name}
                          </p>
                          {cert.number > 1 && (
                            <p className="text-xs text-gray-500 leading-relaxed">
                              Certificates unlock in order, so you'll start with Certificate 1 and work up to this one.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4">
                    <a
                      href={KNOBZ.signupUrl}
                      onClick={() => markReadinessStep('knobz')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                      Sign up on {KNOBZ.name}
                      <ExternalLink size={16} />
                    </a>
                    <Link
                      to={`/opportunities?path=${path.id}`}
                      className="px-6 py-3 bg-white text-purple-600 border border-purple-100 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all flex items-center gap-2"
                    >
                      View Learning Path
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      onClick={() => toggleSave(path.id)}
                      className={cn(
                        'px-6 py-3 border rounded-xl font-bold text-sm transition-all',
                        isSaved
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-white text-purple-600 border-purple-100 hover:bg-purple-50'
                      )}
                    >
                      {isSaved ? 'Saved ✓' : 'Save Recommendation'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Explore all paths */}
      {(() => {
        const recommendedIds = recommendations.map(r => r.id);
        const otherPaths = CAREER_PATHS.filter(p => !recommendedIds.includes(p.id));
        if (otherPaths.length === 0) return null;
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-bold">Explore Other Paths</h2>
              <p className="text-gray-500 text-sm">These paths weren't your top match, but they might still interest you.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherPaths.map(path => {
                const Icon = iconMap[path.icon] || Code;
                return (
                  <div key={path.id} className="bg-white border border-purple-50 rounded-3xl p-6 space-y-4 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">{path.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{path.whyItFits}</p>
                    </div>
                    <Link
                      to={`/opportunities?path=${path.id}`}
                      className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      See certificate <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to take the next step?</h2>
          <p className="text-indigo-100 opacity-90 max-w-md text-sm md:text-base">
            Generate your professional CV and LinkedIn bio based on these recommendations to start applying.
          </p>
        </div>
        <Link
          to="/branding"
          className="px-6 md:px-8 py-3 md:py-4 bg-white text-indigo-600 rounded-2xl font-bold text-base md:text-lg hover:bg-indigo-50 transition-all shadow-xl whitespace-nowrap"
        >
          Generate My CV & Bio
        </Link>
      </div>
    </div>
  );
}
