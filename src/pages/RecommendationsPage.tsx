import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code, BarChart, Layout, Megaphone,
  ArrowRight, CheckCircle2, Bookmark, Share2, Sparkles
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { loadUserField, saveUserField } from '../lib/userdata';
import { useAuth } from '../contexts/AuthContext';
import { CAREER_PATHS } from '../constants';
import { AiData } from '../lib/gemini';
import { CareerPath } from '../types';
import { cn } from '../lib/utils';

const iconMap: Record<string, any> = { Code, BarChart, Layout, Megaphone };

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<CareerPath[]>([]);
  const [aiWhyItFits, setAiWhyItFits] = useState<Record<string, string>>({});
  const [aiEncouragement, setAiEncouragement] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [shareToast, setShareToast] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      let profile: any = null;

      // Try Firestore first, fall back to localStorage
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists() && snap.data()?.profile) {
            profile = snap.data().profile;
            localStorage.setItem('pathher_profile', JSON.stringify(profile));
          }
        } catch (e) {
          console.error('Failed to load profile from Firestore:', e);
        }
      }

      if (!profile) {
        const raw = localStorage.getItem('pathher_profile');
        if (raw) profile = JSON.parse(raw);
      }

      if (!profile) {
        navigate('/onboarding');
        return;
      }

      setProfileName(profile.fullName?.split(' ')[0] || 'there');
      setInterests(profile.interests || []);

      // Load saved recommendations — Firestore preferred, localStorage fallback
      if (user) {
        const fromFirestore = await loadUserField<string[]>(user.uid, 'savedRecommendations', []);
        if (fromFirestore.length > 0) {
          setSaved(fromFirestore);
          localStorage.setItem('saved_recommendations', JSON.stringify(fromFirestore));
        } else {
          const raw = localStorage.getItem('saved_recommendations');
          if (raw) setSaved(JSON.parse(raw));
        }
      } else {
        const raw = localStorage.getItem('saved_recommendations');
        if (raw) setSaved(JSON.parse(raw));
      }

      // Load AI-generated data from Firestore
      let aiData: AiData | null = null;
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists() && snap.data()?.aiData) {
            aiData = snap.data().aiData as AiData;
          }
        } catch { /* non-fatal */ }
      }

      timer = setTimeout(() => {
        if (aiData?.careerPaths?.length) {
          // Use AI ranking and personalised whyItFits
          const whyMap: Record<string, string> = {};
          const encourageMap: Record<string, string> = {};
          aiData.careerPaths.forEach(ap => {
            whyMap[ap.id] = ap.whyItFits;
            encourageMap[ap.id] = ap.encouragement;
          });
          setAiWhyItFits(whyMap);
          setAiEncouragement(encourageMap);

          const ranked = aiData.careerPaths
            .slice(0, 3)
            .map(ap => CAREER_PATHS.find(cp => cp.id === ap.id))
            .filter(Boolean) as CareerPath[];
          setRecommendations(ranked);
        } else {
          // Fallback: keyword scoring
          const scored = CAREER_PATHS
            .map(path => {
              const keywords: Record<string, string[]> = {
                'software-dev': ['Technology', 'Engineering', 'Problem Solving', 'Technical Skills', 'Analytical Thinking', 'Creativity', 'Innovation', 'Skill Mastery'],
                'data-analyst': ['Technology', 'Science', 'Business', 'Finance', 'Analytical Thinking', 'Problem Solving', 'Organization', 'High Salary'],
                'ux-designer': ['Technology', 'Arts & Design', 'Creativity', 'Empathy', 'Communication', 'Innovation', 'Helping Others'],
                'digital-marketer': ['Marketing', 'Business', 'Communication', 'Creativity', 'Leadership', 'Social Work', 'Networking', 'Entrepreneurship'],
              };
              const kw = keywords[path.id] || [];
              let score = 0;
              (profile.interests || []).forEach((i: string) => { if (kw.includes(i)) score += 3; });
              (profile.strengths || []).forEach((s: string) => { if (kw.includes(s)) score += 2; });
              (profile.goals || []).forEach((g: string) => { if (kw.includes(g)) score += 1; });
              return { path, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(x => x.path);
          setRecommendations(scored);
        }
        setIsLoading(false);
      }, 1200);
    };

    load();

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const toggleSave = (id: string) => {
    const updated = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id];
    setSaved(updated);
    localStorage.setItem('saved_recommendations', JSON.stringify(updated));
    if (user) saveUserField(user.uid, 'savedRecommendations', updated);
  };

  const handleShare = (path: CareerPath) => {
    const text = `I'm exploring the ${path.title} career path on PathHer AI! ${path.whyItFits}`;
    if (navigator.share) {
      navigator.share({ title: `PathHer AI — ${path.title}`, text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShareToast('Link copied to clipboard!');
        setTimeout(() => setShareToast(''), 2500);
      });
    }
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
          <p className="text-gray-500">Finding the best South African career paths for you.</p>
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
            ? `Based on your interests in ${interests.slice(0, 2).join(' and ')}, ${profileName}, here are ${recommendations.length} high-growth paths matched for you in South Africa.`
            : `We've identified ${recommendations.length} high-growth paths in South Africa tailored to your profile.`}
        </p>
      </div>

      <div className="grid gap-8">
        {recommendations.map((path, index) => {
          const Icon = iconMap[path.icon] || Code;
          const isSaved = saved.includes(path.id);
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
                      <p className="text-purple-600 font-medium text-xs md:text-sm">High Demand in SA</p>
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
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {aiWhyItFits[path.id] || path.whyItFits}
                      </p>
                      {aiEncouragement[path.id] && (
                        <p className="text-sm text-purple-600 font-medium italic mt-1">
                          ✦ {aiEncouragement[path.id]}
                        </p>
                      )}
                    </div>

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
                        <h3 className="font-bold text-gray-900">SA Opportunities</h3>
                        <ul className="space-y-1">
                          {path.saExamples.map(ex => (
                            <li key={ex} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4">
                    <Link
                      to={`/opportunities?path=${path.id}`}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center gap-2"
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
                      Explore resources <ArrowRight size={14} />
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
