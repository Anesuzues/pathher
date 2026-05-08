import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Linkedin, Download, Copy, RefreshCw, Check, Sparkles, Edit3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CAREER_PATHS } from '../constants';

function generateCV(profile: any, path: any, variation: number): string {
  const name = (profile.fullName || 'Your Name').toUpperCase();
  const email = profile.email || '';
  const summaries = [
    `Highly motivated ${profile.strengths?.[0] || 'professional'} with a passion for ${profile.interests?.[0] || 'technology'} and ${profile.interests?.[1] || 'innovation'}. Identified as a strong fit for ${path.title} through PathHer AI, with career goals including ${profile.goals?.[0] || 'excellence'}. Committed to continuous learning and contributing to South Africa's digital economy.`,
    `Results-driven individual with strengths in ${(profile.strengths || []).join(', ') || 'multiple areas'}. Passionate about ${profile.interests?.[0] || 'making an impact'} and committed to ${profile.goals?.[0] || 'professional growth'}. Seeking to grow as a ${path.title} in South Africa's dynamic job market.`,
  ];
  return `${name}
${path.title} | South Africa${email ? '\n' + email : ''}

SUMMARY
${summaries[variation % summaries.length]}

SKILLS
${(path.skillsNeeded as string[]).map(s => `• ${s}`).join('\n')}
${(profile.strengths || []).map((s: string) => `• ${s}`).join('\n')}

EDUCATION
• ${profile.education || 'Details not provided'}

CAREER INTERESTS
${(profile.interests || []).map((i: string) => `• ${i}`).join('\n')}

CAREER GOALS
${(profile.goals || []).map((g: string) => `• ${g}`).join('\n')}

PREFERRED WORK STYLE
${(profile.workStyle || []).map((w: string) => `• ${w}`).join('\n')}

---
Profile verified by PathHer AI`;
}

function generateLinkedInBio(profile: any, path: any, variation: number): string {
  const hasImpact = (profile.goals || []).includes('Social Impact');
  const hasEntrepreneurship = (profile.goals || []).includes('Entrepreneurship');
  const interests = (profile.interests || []).slice(0, 2).join(' & ') || 'Tech';
  const strengths = (profile.strengths || []).slice(0, 2).join(' and ') || 'driven';
  const skills = (path.skillsNeeded as string[]).slice(0, 2).join(' and ');
  const workStyle = profile.workStyle?.[0] || 'collaborative';

  const bios = [
    `Aspiring ${path.title} | ${interests} enthusiast 🚀\n\n${strengths} are my superpowers. Recently mapped my career path through PathHer AI and actively building skills in ${skills}.\n\n${hasImpact ? 'Passionate about using my skills to drive social change in SA. ' : ''}${hasEntrepreneurship ? 'Entrepreneurial mindset, building for impact. ' : ''}Open to ${workStyle} opportunities in South Africa.\n\n#WomenInTech #SouthAfricaTech #${path.title.replace(/[\s/]+/g, '')} #PathHerAI`,
    `🌟 Future ${path.title} from South Africa\n\nI believe in the power of ${profile.interests?.[0] || 'technology'} to transform lives. My strengths in ${(profile.strengths || []).slice(0, 3).join(', ') || 'various areas'} drive me to pursue excellence every day.\n\nCurrently on my PathHer AI journey — exploring ${path.title} and connecting with trailblazers in SA's ecosystem.\n\n${hasImpact ? '💡 Goal: Use skills for meaningful social impact.\n\n' : ''}Preferred work: ${(profile.workStyle || []).join(', ') || 'flexible environments'}\n\nLet's connect and grow together! 🤝\n\n#YoungWomenInTech #SACareer #PathHerAI`,
  ];
  return bios[variation % bios.length];
}

function calcProfileCompletion(profile: any): number {
  const fields = [
    profile.fullName?.length > 0,
    profile.email?.length > 0,
    profile.education?.length > 0,
    (profile.interests || []).length > 0,
    (profile.strengths || []).length > 0,
    (profile.goals || []).length > 0,
    (profile.workStyle || []).length > 0,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default function BrandingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'cv' | 'linkedin'>('cv');
  const [copied, setCopied] = useState(false);
  const [variation, setVariation] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [primaryPath, setPrimaryPath] = useState(CAREER_PATHS[0]);
  const [cvContent, setCvContent] = useState('');
  const [linkedinBio, setLinkedinBio] = useState('');
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('pathher_profile');
    const savedRaw = localStorage.getItem('saved_recommendations');

    const prof = raw ? JSON.parse(raw) : {
      fullName: '', email: '', education: '',
      interests: [], strengths: [], goals: [], workStyle: [],
    };

    const savedIds = savedRaw ? JSON.parse(savedRaw) : [];
    const path = CAREER_PATHS.find(p => p.id === savedIds[0]) || CAREER_PATHS[0];

    setProfile(prof);
    setPrimaryPath(path);
    setCvContent(generateCV(prof, path, 0));
    setLinkedinBio(generateLinkedInBio(prof, path, 0));
    setCompletion(calcProfileCompletion(prof));
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    const next = variation + 1;
    setTimeout(() => {
      setVariation(next);
      setCvContent(generateCV(profile, primaryPath, next));
      setLinkedinBio(generateLinkedInBio(profile, primaryPath, next));
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    const content = activeTab === 'cv' ? cvContent : linkedinBio;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    const content = activeTab === 'cv' ? cvContent : linkedinBio;
    const html = `<html><body><pre style="font-family:Arial,sans-serif;white-space:pre-wrap;font-size:13px;line-height:1.6">${content}</pre></body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathher-${activeTab === 'cv' ? 'cv' : 'linkedin-bio'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasProfile = profile && profile.fullName;
  const displayName = profile?.fullName || 'Your Profile';
  const nextSteps = [
    { label: 'Complete onboarding', done: hasProfile },
    { label: 'Generate CV summary', done: cvContent.length > 0 },
    { label: 'Connect LinkedIn', done: false },
    { label: 'Join Talent Network', done: !!localStorage.getItem('joined_network') },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Personal Branding</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stand out to South African recruiters with an AI-optimized CV and LinkedIn bio tailored to your recommended career path.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-purple-50 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-purple-100 shadow-lg bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white text-4xl font-black">
                  {displayName.charAt(0).toUpperCase() || 'P'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors">
                  <Edit3 size={16} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{displayName || 'Complete Onboarding'}</h2>
                <p className="text-purple-600 font-medium">{primaryPath.title} Path</p>
              </div>
              <div className="flex gap-2">
                {hasProfile && <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified Profile</span>}
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{completion}% Ready</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-purple-50">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Next Steps</h3>
              <div className="space-y-3">
                {nextSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center',
                      step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'
                    )}>
                      <Check size={12} />
                    </div>
                    <span className={cn('text-sm', step.done ? 'text-gray-900' : 'text-gray-400')}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all disabled:opacity-70"
            >
              <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Generating...' : 'Regenerate Branding'}
            </button>
          </div>

          <div className="bg-indigo-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white space-y-4 relative overflow-hidden">
            <h3 className="text-xl font-bold relative z-10">Recruiter Visibility</h3>
            <p className="text-indigo-200 text-sm relative z-10">
              Your profile is currently visible to 12 top tech companies in South Africa.
            </p>
            <button className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all relative z-10">
              Manage Visibility
            </button>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-purple-50 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-purple-50">
              <button
                onClick={() => setActiveTab('cv')}
                className={cn(
                  'flex-1 py-6 font-bold text-sm flex items-center justify-center gap-2 transition-all',
                  activeTab === 'cv' ? 'text-purple-700 bg-purple-50 border-b-2 border-purple-700' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <FileText size={18} />
                Professional CV
              </button>
              <button
                onClick={() => setActiveTab('linkedin')}
                className={cn(
                  'flex-1 py-6 font-bold text-sm flex items-center justify-center gap-2 transition-all',
                  activeTab === 'linkedin' ? 'text-purple-700 bg-purple-50 border-b-2 border-purple-700' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Linkedin size={18} />
                LinkedIn Bio
              </button>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col gap-4">
              {/* Toolbar row — inline, no absolute positioning */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {activeTab === 'cv' ? 'Professional CV' : 'LinkedIn Bio'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white border border-purple-100 rounded-lg text-gray-500 hover:text-purple-600 transition-all shadow-sm"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 bg-white border border-purple-100 rounded-lg text-gray-500 hover:text-purple-600 transition-all shadow-sm"
                    title="Download PDF (print dialog)"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${variation}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="prose prose-purple max-w-none flex-1"
                >
                  <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-700 bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 leading-relaxed overflow-x-auto">
                    {activeTab === 'cv' ? cvContent : linkedinBio}
                  </pre>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-6 md:px-8 py-5 md:py-6 bg-purple-50 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm text-purple-900 font-medium">AI-optimized for South African applicant tracking systems (ATS).</p>
              </div>
              <button
                onClick={handleExportWord}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all whitespace-nowrap"
              >
                Export to Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
