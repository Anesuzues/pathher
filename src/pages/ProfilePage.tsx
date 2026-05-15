import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, GraduationCap, Check, ArrowLeft, Save, Sparkles,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface ProfileData {
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
  'Career Changer',
];

const OPTIONS = {
  interests: ['Technology', 'Healthcare', 'Business', 'Arts & Design', 'Education', 'Environment', 'Social Work', 'Finance', 'Engineering', 'Law', 'Marketing', 'Science'],
  strengths: ['Problem Solving', 'Communication', 'Creativity', 'Leadership', 'Organization', 'Empathy', 'Analytical Thinking', 'Teamwork', 'Public Speaking', 'Writing', 'Technical Skills', 'Adaptability'],
  goals: ['High Salary', 'Social Impact', 'Work-Life Balance', 'Travel', 'Stability', 'Innovation', 'Helping Others', 'Entrepreneurship', 'Skill Mastery', 'Networking', 'Management', 'Creativity'],
  workStyle: ['Remote/Flexible', 'Office-based', 'Outdoor/Active', 'Collaborative', 'Independent', 'Fast-paced', 'Structured', 'Creative', 'Hybrid', 'Travel-heavy'],
};

const SECTIONS: { key: keyof typeof OPTIONS; label: string }[] = [
  { key: 'interests', label: 'Interests' },
  { key: 'strengths', label: 'Strengths' },
  { key: 'goals', label: 'Career Goals' },
  { key: 'workStyle', label: 'Work Style' },
];

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>({
    fullName: '',
    email: '',
    education: '',
    interests: [],
    strengths: [],
    goals: [],
    workStyle: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedDone, setSavedDone] = useState(false);
  const { user, setHasProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('pathher_profile');
    if (raw) {
      try {
        const profile = JSON.parse(raw);
        setData({
          fullName: profile.fullName || user?.displayName || '',
          email: profile.email || user?.email || '',
          education: profile.education || '',
          interests: profile.interests || [],
          strengths: profile.strengths || [],
          goals: profile.goals || [],
          workStyle: profile.workStyle || [],
        });
        return;
      } catch { /* ignore */ }
    }
    if (user) {
      setData(d => ({
        ...d,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const toggleOption = (field: keyof typeof OPTIONS, option: string) => {
    const current = data[field] as string[];
    if (current.includes(option)) {
      setData({ ...data, [field]: current.filter(o => o !== option) });
    } else if (current.length < 3) {
      setData({ ...data, [field]: [...current, option] });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('pathher_profile', JSON.stringify(data));
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { profile: data }, { merge: true });
        setHasProfile(true);
      } catch (e) {
        console.error('Failed to save profile:', e);
      }
    }
    setIsSaving(false);
    setSavedDone(true);
    setTimeout(() => setSavedDone(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Profile</h1>
          <p className="text-gray-500 text-sm">Changes update your career recommendations and generated CV.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-purple-50 space-y-10"
      >
        {/* Personal Info */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <User size={18} className="text-purple-600" />
            Personal Info
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={data.fullName}
                  onChange={e => setData({ ...data, fullName: e.target.value })}
                  placeholder="e.g. Thandiwe Molefe"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-medium text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={data.email}
                  onChange={e => setData({ ...data, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-medium text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <GraduationCap size={18} className="text-purple-600" />
            Education
          </h2>
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={data.education}
              onChange={e => setData({ ...data, education: e.target.value })}
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-medium text-sm appearance-none cursor-pointer"
            >
              <option value="" disabled>Select your level</option>
              {EDUCATION_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-select sections */}
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{label}</h2>
              <span className="text-xs text-gray-400 font-medium">
                {(data[key] as string[]).length}/3 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {OPTIONS[key].map(option => {
                const isSelected = (data[key] as string[]).includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(key, option)}
                    className={cn(
                      'px-4 py-2 rounded-full border-2 font-bold text-sm transition-all flex items-center gap-1.5',
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-200'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-purple-200'
                    )}
                  >
                    {option}
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          Saving updates your career recommendations and CV instantly.
        </p>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all',
            savedDone
              ? 'bg-green-500 text-white shadow-green-100'
              : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-100 hover:shadow-purple-200 disabled:opacity-70'
          )}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : savedDone ? (
            <><Check size={20} /> Saved!</>
          ) : (
            <><Save size={20} /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}
