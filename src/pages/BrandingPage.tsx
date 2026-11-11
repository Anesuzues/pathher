import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Linkedin, Download, Copy, RefreshCw, Check, Sparkles, Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn, readJSON, readStringList } from '../lib/utils';
import { getPrimaryPath } from '../lib/recommend';
import { CAREER_PATHS, KNOBZ, getCertificate } from '../constants';
import { findCertificate, loadKnobzCertificates } from '../lib/knobzCatalogue';
import { AiLimitError, buildAiInput, getAiResult, type BrandingResult } from '../lib/ai';
import type { KnobzCertificate } from '../types';
import { useReadiness } from '../lib/useReadiness';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Built-in CV and LinkedIn text, shown until the AI version loads or when the AI
// is unavailable. Like the AI prompts, it only states what the person told us and
// treats the path's skills as things they are learning.

const joinList = (items: string[], fallback: string) =>
  items.length <= 1 ? items[0] || fallback : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

function generateCV(profile: any, path: any, variation: number): string {
  const name = (profile.fullName || 'Your Name').toUpperCase();
  const email = profile.email || '';
  const cert = getCertificate(path.certificate);
  const strengths = joinList((profile.strengths || []).slice(0, 2).map((s: string) => s.toLowerCase()), 'a willingness to learn');
  const interests = joinList((profile.interests || []).slice(0, 2), 'technology');
  const summaries = [
    `Early-career candidate with strengths in ${strengths} and an interest in ${interests}. Building skills in ${joinList(path.skillsNeeded.slice(0, 2).map((s: string) => s.toLowerCase()), 'technology')} and working towards ${KNOBZ.name} Certificate ${cert.number}: ${cert.title}. Looking for a first role as a ${path.title} in South Africa.`,
    `Working towards ${KNOBZ.name} Certificate ${cert.number}: ${cert.title}, with a focus on ${joinList(path.skillsNeeded.map((s: string) => s.toLowerCase()), 'technology')}. Brings ${strengths}, and an interest in ${interests}. Keen to start a career as a ${path.title}.`,
  ];
  return `${name}
${path.title} | South Africa${email ? '\n' + email : ''}

SUMMARY
${summaries[variation % summaries.length]}

STRENGTHS
${(profile.strengths || []).map((s: string) => `• ${s}`).join('\n') || '• Not provided yet'}

SKILLS IN PROGRESS
${(path.skillsNeeded as string[]).map(s => `• ${s}`).join('\n')}

EDUCATION
• ${profile.education || 'Details not provided'}

LEARNING & CERTIFICATION
• ${KNOBZ.name}: Certificate ${cert.number}, ${cert.title} (in progress)

CAREER INTERESTS
${(profile.interests || []).map((i: string) => `• ${i}`).join('\n') || '• Not provided yet'}`;
}

interface LinkedInText { headline: string; about: string }

// No hashtags or emojis: the person pastes this straight into their LinkedIn profile.
function generateLinkedInBio(profile: any, path: any, variation: number): LinkedInText {
  const cert = getCertificate(path.certificate);
  const interests = joinList((profile.interests || []).slice(0, 2), 'technology');
  const strengths = joinList((profile.strengths || []).slice(0, 2).map((s: string) => s.toLowerCase()), 'a willingness to learn');
  const skills = joinList(path.skillsNeeded.slice(0, 2).map((s: string) => s.toLowerCase()), 'new skills');
  const goals = (profile.goals || []).slice(0, 2).map((g: string) => g.toLowerCase());

  const headline = `Aspiring ${path.title} | Working towards ${KNOBZ.name} Certificate ${cert.number}`;
  const abouts = [
    `I'm interested in ${interests}, and I'm working towards ${KNOBZ.name} Certificate ${cert.number}: ${cert.title}, where I'm learning ${skills}. People who know me would point to my ${strengths}.${goals.length ? ` I'm looking for work that offers ${joinList(goals, '')}.` : ''}

I'm open to connecting with people working as a ${path.title} in South Africa, and to hearing about entry-level opportunities.`,
    `I'm building a career as a ${path.title}. Right now I'm studying for ${KNOBZ.name} Certificate ${cert.number}: ${cert.title}, with a focus on ${skills}.

My strengths are ${strengths}, and I'm especially interested in ${interests}.${goals.length ? ` In my next role I'm looking for ${joinList(goals, '')}.` : ''}

If you work in this field in South Africa, I'd love to connect.`,
  ];
  return { headline, about: abouts[variation % abouts.length] };
}

// LinkedIn has no way for another site to fill in a profile, so we copy the text
// and open the right place for the person to paste it.
// /in/me/ always resolves to the signed-in member's own profile.
const LINKEDIN_HEADLINE_URL = 'https://www.linkedin.com/in/me/edit/intro/';
const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/me/';

// CV built around AI-written text. Name, contact and education come straight from
// the profile so the AI can't change facts; it only writes the summary and skills.
function cvFromAi(profile: any, path: any, cert: KnobzCertificate, ai: BrandingResult): string {
  const name = (profile.fullName || 'Your Name').toUpperCase();
  const email = profile.email || '';
  return `${name}
${path.title} | South Africa${email ? '\n' + email : ''}

SUMMARY
${ai.cvSummary}

KEY SKILLS
${ai.cvSkills.map(s => `• ${s}`).join('\n')}

EDUCATION
• ${profile.education || 'Details not provided'}

LEARNING & CERTIFICATION
• ${KNOBZ.name}: Certificate ${cert.number}, ${cert.title} (in progress)

CAREER INTERESTS
${(profile.interests || []).map((i: string) => `• ${i}`).join('\n')}`;
}

function linkedinFromAi(ai: BrandingResult): LinkedInText {
  return { headline: ai.linkedinHeadline, about: ai.linkedinAbout };
}

export default function BrandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'cv' | 'linkedin'>('cv');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [variation, setVariation] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [primaryPath, setPrimaryPath] = useState(CAREER_PATHS[0]);
  const [cvContent, setCvContent] = useState('');
  const [linkedin, setLinkedinBio] = useState<LinkedInText>({ headline: '', about: '' });
  // Shown on screen, copied and exported as one block; the LinkedIn buttons copy each part on its own.
  const linkedinBio = linkedin.headline ? `HEADLINE\n${linkedin.headline}\n\nABOUT\n${linkedin.about}` : '';
  const [linkedinNotice, setLinkedinNotice] = useState('');
  const readiness = useReadiness();
  const [profileVisible, setProfileVisible] = useState(true);
  const [cert, setCert] = useState<KnobzCertificate | null>(null);
  // 'ai' = AI-written text is showing; 'template' = built-in text (AI unavailable or not yet loaded)
  const [source, setSource] = useState<'ai' | 'template'>('template');
  const [aiNotice, setAiNotice] = useState('');

  const showAi = (prof: any, path: any, c: KnobzCertificate, ai: BrandingResult) => {
    setCvContent(cvFromAi(prof, path, c, ai));
    setLinkedinBio(linkedinFromAi(ai));
    setSource('ai');
    setAiNotice('');
    readiness.mark('cv');
  };

  useEffect(() => {
    const load = async () => {
      let prof: any = null;
      let savedIds: string[] = [];

      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data?.profile) prof = data.profile;
            if (Array.isArray(data?.savedRecommendations)) savedIds = data.savedRecommendations;
            if (typeof data?.profileVisible === 'boolean') setProfileVisible(data.profileVisible);
          }
        } catch { /* fallback to localStorage */ }
      }

      if (!prof) {
        prof = readJSON<any>('pathher_profile', null) || {
          fullName: '', email: '', education: '',
          interests: [], strengths: [], goals: [], workStyle: [],
        };
      }
      if (!savedIds.length) savedIds = readStringList('saved_recommendations');

      // Brand around the first path the user saved; otherwise their best match
      const path = getPrimaryPath(prof, savedIds) || CAREER_PATHS[0];
      setProfile(prof);
      setPrimaryPath(path);
      setCvContent(generateCV(prof, path, 0));
      setLinkedinBio(generateLinkedInBio(prof, path, 0));

      // Swap in AI-written text (saved copy if the answers haven't changed).
      if (!user || !prof.fullName) return;
      const c = findCertificate(await loadKnobzCertificates(), path.certificate);
      if (!c || cancelled) return;
      setCert(c);
      setIsGenerating(true);
      try {
        const ai = await getAiResult('branding', buildAiInput(prof, path, c));
        if (!cancelled) showAi(prof, path, c, ai);
      } catch (e) {
        console.warn('AI branding unavailable, showing built-in text:', e);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };
    let cancelled = false;
    load();
    return () => { cancelled = true; };
  }, [user]);

  const handleGenerate = async () => {
    if (!profile?.fullName || profile.fullName.trim().length < 2) {
      setValidationError('Please complete your profile (at least name and interests) before generating branding materials.');
      return;
    }
    setValidationError('');
    setIsGenerating(true);
    const next = variation + 1;
    setVariation(next);
    if (user && cert) {
      try {
        const ai = await getAiResult('branding', buildAiInput(profile, primaryPath, cert), { regenerate: true });
        showAi(profile, primaryPath, cert, ai);
        setIsGenerating(false);
        return;
      } catch (e) {
        console.warn('AI branding unavailable, using built-in text:', e);
        if (e instanceof AiLimitError) {
          // Keep the AI version they already have rather than swapping in the template.
          setAiNotice(e.message);
          setIsGenerating(false);
          return;
        }
        setAiNotice('The AI writer is unavailable right now, so this is the standard version. Try again in a minute.');
      }
    }
    setCvContent(generateCV(profile, primaryPath, next));
    setLinkedinBio(generateLinkedInBio(profile, primaryPath, next));
    setSource('template');
    setIsGenerating(false);
  };

  const handleCopy = () => {
    const content = activeTab === 'cv' ? cvContent : linkedinBio;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard blocked */ });
  };

  const handleDownloadPDF = () => {
    window.print(); // triggers browser Print → Save as PDF
  };

  const handleExportWord = () => {
    const content = activeTab === 'cv' ? cvContent : linkedinBio;
    const html = `<html><head><meta charset="utf-8"></head><body><pre style="font-family:Arial,sans-serif;white-space:pre-wrap;font-size:13px;line-height:1.6">${escapeHtml(content)}</pre></body></html>`;
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

  // Copies one part of the LinkedIn text and opens LinkedIn where it goes.
  const copyAndOpenLinkedIn = (part: 'headline' | 'about') => {
    const text = linkedin[part];
    if (!text) return;
    // Start the copy before opening the tab: browsers only allow it while this page has focus.
    const copiedOk = navigator.clipboard
      ? navigator.clipboard.writeText(text).then(() => true, () => false)
      : Promise.resolve(false);
    window.open(part === 'headline' ? LINKEDIN_HEADLINE_URL : LINKEDIN_PROFILE_URL, '_blank', 'noopener,noreferrer');
    copiedOk.then(ok => setLinkedinNotice(!ok
      ? "Your browser blocked copying. Select the text above, copy it, then paste it into LinkedIn."
      : part === 'headline'
        ? 'Headline copied. In LinkedIn, select the Headline box, paste (Ctrl+V, or long-press on a phone) and save.'
        : 'About copied. On your LinkedIn profile, press the pencil next to About (or "Add profile section", then About), paste and save.'));
    readiness.mark('linkedin');
  };

  const handleConnectLinkedIn = () => {
    setActiveTab('linkedin');
    // Wait for the tab to render, then bring the LinkedIn steps into view.
    setTimeout(() => document.getElementById('linkedin-steps')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const handleToggleVisibility = async () => {
    const next = !profileVisible;
    setProfileVisible(next);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { profileVisible: next }, { merge: true });
      } catch { /* non-fatal */ }
    }
  };

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
                <button
                  onClick={() => navigate('/profile')}
                  title="Edit profile"
                  className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{displayName || 'Complete Onboarding'}</h2>
                <p className="text-purple-600 font-medium">{primaryPath.title} Path</p>
              </div>
              <div className="flex gap-2">
                {hasProfile && user?.emailVerified && <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified Profile</span>}
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{readiness.done} of {readiness.total} steps</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-purple-50">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Next Steps</h3>
              <div className="space-y-3">
                {readiness.steps.map(step => (
                  <div key={step.id} className="flex items-center gap-3">
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

            {validationError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{validationError}</p>
            )}
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
              {profileVisible
                ? 'Your profile is visible to top tech companies in South Africa.'
                : 'Your profile is currently hidden from recruiters.'}
            </p>
            <button
              onClick={handleToggleVisibility}
              className={cn(
                'w-full py-3 backdrop-blur-md border border-white/20 rounded-xl font-bold text-sm transition-all relative z-10',
                profileVisible
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50'
              )}
            >
              {profileVisible ? 'Hide from Recruiters' : 'Make Visible'}
            </button>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
          </div>

          <button
            onClick={handleConnectLinkedIn}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
          >
            <Linkedin size={20} />
            Update LinkedIn Profile
          </button>
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
                    title="Print to PDF"
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

              {activeTab === 'linkedin' && linkedin.headline && (
                <div id="linkedin-steps" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">Add this to your LinkedIn profile</p>
                    <p className="text-xs text-gray-500">
                      Each button copies that part and opens LinkedIn. Paste it in and save. Sign in to LinkedIn first if it asks.
                    </p>
                  </div>
                  {([
                    { part: 'headline', step: '1', title: 'Headline', hint: 'Opens the edit box for your name and headline.' },
                    { part: 'about', step: '2', title: 'About', hint: 'Opens your profile. Press the pencil next to About.' },
                  ] as const).map(({ part, step, title, hint }) => (
                    <div key={part} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{title}</p>
                          <p className="text-xs text-gray-500">{hint}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyAndOpenLinkedIn(part)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shrink-0"
                      >
                        <Copy size={14} />
                        Copy {title} & open LinkedIn
                      </button>
                    </div>
                  ))}
                  {linkedinNotice && (
                    <p className="text-xs text-blue-800 bg-white border border-blue-100 rounded-xl px-3 py-2">{linkedinNotice}</p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 py-5 md:py-6 bg-purple-50 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm text-purple-900 font-medium">
                  {aiNotice || (source === 'ai'
                    ? 'Written by AI from your answers. Read it through and correct anything before you use it.'
                    : isGenerating
                      ? 'Personalising with AI…'
                      : 'Standard version based on your answers. Press Regenerate Branding for an AI-written one.')}
                </p>
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
