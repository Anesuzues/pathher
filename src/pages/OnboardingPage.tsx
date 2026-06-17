import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Brain,
  Heart,
  Target,
  Briefcase,
  Sparkles,
  User,
  Mail,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateUserContent } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

type StepId = 'personal' | 'education' | 'interests' | 'strengths' | 'goals' | 'workStyle';

interface OnboardingData {
  fullName: string;
  email: string;
  education: string;
  interests: string[];
  strengths: string[];
  goals: string[];
  workStyle: string[];
}

const EDUCATION_LEVELS = [
  'High School Student',
  'High School Graduate',
  'Undergraduate Student',
  'University Graduate',
  'Postgraduate Student',
  'Working Professional',
  'Career Changer'
];

const STEPS: { id: StepId; title: string; subtitle: string; icon: any }[] = [
  {
    id: 'personal',
    title: 'Personal Info',
    subtitle: 'Let\'s get to know you',
    icon: User
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Where are you currently?',
    icon: GraduationCap
  },
  {
    id: 'interests',
    title: 'Interests',
    subtitle: 'What gets you excited?',
    icon: Heart
  },
  {
    id: 'strengths',
    title: 'Strengths',
    subtitle: 'What are you naturally good at?',
    icon: Brain
  },
  {
    id: 'goals',
    title: 'Career Goals',
    subtitle: 'What do you want to achieve?',
    icon: Target
  },
  {
    id: 'workStyle',
    title: 'Work Style',
    subtitle: 'How do you prefer to work?',
    icon: Briefcase
  }
];

const OPTIONS = {
  interests: ['Technology', 'Healthcare', 'Business', 'Arts & Design', 'Education', 'Environment', 'Social Work', 'Finance', 'Engineering', 'Law', 'Marketing', 'Science'],
  strengths: ['Problem Solving', 'Communication', 'Creativity', 'Leadership', 'Organization', 'Empathy', 'Analytical Thinking', 'Teamwork', 'Public Speaking', 'Writing', 'Technical Skills', 'Adaptability'],
  goals: ['High Salary', 'Social Impact', 'Work-Life Balance', 'Travel', 'Stability', 'Innovation', 'Helping Others', 'Entrepreneurship', 'Skill Mastery', 'Networking', 'Management', 'Creativity'],
  workStyle: ['Remote/Flexible', 'Office-based', 'Outdoor/Active', 'Collaborative', 'Independent', 'Fast-paced', 'Structured', 'Creative', 'Hybrid', 'Travel-heavy']
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, setHasProfile } = useAuth();
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    education: '',
    interests: [],
    strengths: [],
    goals: [],
    workStyle: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      let saved: any = null;

      // Firestore first — source of truth across devices
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists() && snap.data()?.profile) {
            saved = snap.data().profile;
            localStorage.setItem('pathher_profile', JSON.stringify(saved));
          }
        } catch { /* fall through */ }
      }

      // Fallback to localStorage
      if (!saved) {
        try {
          const raw = localStorage.getItem('pathher_profile');
          if (raw) saved = JSON.parse(raw);
        } catch { /* ignore */ }
      }

      setData(d => {
        if (saved?.fullName) {
          setIsEditing(true);
          return {
            fullName: saved.fullName || user?.displayName || '',
            email: saved.email || user?.email || '',
            education: saved.education || '',
            interests: saved.interests?.length > 0 ? saved.interests : [],
            strengths: saved.strengths?.length > 0 ? saved.strengths : [],
            goals: saved.goals?.length > 0 ? saved.goals : [],
            workStyle: saved.workStyle?.length > 0 ? saved.workStyle : [],
          };
        }
        return {
          ...d,
          fullName: d.fullName || user?.displayName || '',
          email: d.email || user?.email || '',
        };
      });
    };
    load();
  }, [user]);

  const step = STEPS[currentStep];

  const toggleSelection = (field: keyof OnboardingData, option: string) => {
    const current = data[field] as string[];
    if (current.includes(option)) {
      setData({ ...data, [field]: current.filter(o => o !== option) });
    } else {
      if (current.length < 3) {
        setData({ ...data, [field]: [...current, option] });
      }
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSaving(true);
      localStorage.setItem('pathher_profile', JSON.stringify(data));
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), { profile: data }, { merge: true });
          setHasProfile(true);
        } catch (e) {
          console.error('Failed to save profile to Firestore:', e);
        }
      }
      setIsSaving(false);

      // Always regenerate AI content — refreshes recommendations when profile is updated
      if (user) {
        setIsGenerating(true);
        try {
          const aiData = await generateUserContent(data);
          await setDoc(doc(db, 'users', user.uid), { aiData }, { merge: true });
        } catch (e) {
          console.error('AI generation failed — continuing without it:', e);
        }
        setIsGenerating(false);
      }

      navigate('/recommendations');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (step.id) {
      case 'personal':
        return data.fullName.length > 2 && data.email.includes('@');
      case 'education':
        return data.education !== '';
      case 'interests':
        return data.interests.length > 0;
      case 'strengths':
        return data.strengths.length > 0;
      case 'goals':
        return data.goals.length > 0;
      case 'workStyle':
        return data.workStyle.length > 0;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-purple-600 animate-pulse" size={24} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Building Your AI Profile...</h2>
          <p className="text-gray-500">PathHer AI is personalising your career recommendations, courses, and networking tips.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {isEditing && (
        <div className="flex items-center gap-3 px-5 py-3 bg-purple-50 border border-purple-100 rounded-2xl">
          <RefreshCw size={16} className="text-purple-600 shrink-0" />
          <p className="text-sm text-purple-700 font-medium">
            Updating your existing profile — previous answers are pre-filled.
          </p>
        </div>
      )}

      {/* Progress Tracker */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">Step {currentStep + 1} of {STEPS.length}</p>
            <h2 className="text-2xl font-bold">{step.title}</h2>
          </div>
          <p className="text-sm font-medium text-gray-400">{Math.round(progress)}% Complete</p>
        </div>
        <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 shadow-sm border border-purple-50 min-h-[480px] flex flex-col">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <step.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{step.subtitle}</h3>
              {step.id !== 'personal' && step.id !== 'education' && (
                <p className="text-gray-500 text-sm">Select up to 3 options</p>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step.id === 'personal' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text"
                        value={data.fullName}
                        onChange={(e) => setData({ ...data, fullName: e.target.value })}
                        placeholder="e.g. Thandiwe Molefe"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        placeholder="e.g. thandiwe@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step.id === 'education' && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 ml-1">Current Education Level</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    <select 
                      value={data.education}
                      onChange={(e) => setData({ ...data, education: e.target.value })}
                      className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-medium appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select your level</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight size={20} className="rotate-90" />
                    </div>
                  </div>
                  
                  {/* Visual cards for quick selection as well */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    {EDUCATION_LEVELS.slice(0, 4).map((level) => (
                      <button
                        key={level}
                        onClick={() => setData({ ...data, education: level })}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center group",
                          data.education === level 
                            ? "border-purple-600 bg-purple-50 text-purple-700" 
                            : "border-gray-100 hover:border-purple-200 text-gray-600"
                        )}
                      >
                        <span className="font-bold text-sm">{level}</span>
                        {data.education === level && <Check size={14} className="text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(step.id === 'interests' || step.id === 'strengths' || step.id === 'goals' || step.id === 'workStyle') && (
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {OPTIONS[step.id].map((option) => {
                    const isSelected = (data[step.id] as string[]).includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => toggleSelection(step.id as any, option)}
                        className={cn(
                          "px-4 md:px-6 py-2 md:py-3 rounded-full border-2 font-bold transition-all flex items-center gap-2 text-sm md:text-base",
                          isSelected
                            ? "border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-200"
                            : "border-gray-100 bg-gray-50 text-gray-600 hover:border-purple-200"
                        )}
                      >
                        {option}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-8 md:pt-12 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all",
              currentStep === 0 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-purple-600 hover:bg-purple-50"
            )}
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepValid() || isSaving || isGenerating}
            className={cn(
              "flex items-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg",
              !isStepValid() || isSaving
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-200 hover:shadow-purple-300"
            )}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                {currentStep === STEPS.length - 1 ? 'See Results' : 'Next'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
          <Sparkles size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900">Pro Tip</h4>
          <p className="text-indigo-700 text-sm leading-relaxed">
            Be as honest as possible! Our AI uses these answers to find the best South African career opportunities tailored specifically for you.
          </p>
        </div>
      </div>
    </div>
  );
}
