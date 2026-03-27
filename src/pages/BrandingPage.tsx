import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Linkedin, 
  Download, 
  Copy, 
  RefreshCw, 
  Check, 
  Sparkles,
  Edit3,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function BrandingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'cv' | 'linkedin'>('cv');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cvContent = `
# NOMPUMELELO DLAMINI
Software Developer | Cape Town, South Africa

## SUMMARY
Highly motivated and analytical problem-solver with a strong interest in building impactful technology solutions. Recently identified as a top candidate for Software Development through PathHer AI, with a focus on React, TypeScript, and user-centric design. Committed to continuous learning and contributing to South Africa's digital economy.

## SKILLS
- Programming: JavaScript, TypeScript, React, HTML5, CSS3
- Tools: Git, Figma, VS Code
- Soft Skills: Analytical Thinking, Collaborative Problem Solving, Agile Mindset

## EDUCATION
- WeThinkCode_ Software Engineering Program (In Progress)
- National Senior Certificate, Zisukhanyo Secondary School

## PROJECTS
- Community Health Tracker: A web app built to help local clinics track patient visits.
- PathHer AI Profile: Verified career path and skill assessment.
  `;

  const linkedinBio = `
🚀 Aspiring Software Developer | Passionate about building tech solutions for South Africa 🇿🇦

Recently discovered my path through PathHer AI and currently honing my skills in React and TypeScript. I love solving complex problems and creating user-friendly interfaces that make a difference.

Currently learning at WeThinkCode_ and looking for opportunities to grow in the tech ecosystem. Let's connect!

#WomenInTech #SouthAfricaTech #SoftwareDevelopment #PathHerAI
  `;

  return (
    <div className="space-y-10 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Personal Branding</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stand out to South African recruiters with an AI-optimized CV and LinkedIn bio tailored to your recommended career path.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/nompu/200/200" 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors">
                  <Edit3 size={16} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nompumelelo Dlamini</h2>
                <p className="text-purple-600 font-medium">Software Developer Path</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified Profile</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">85% Ready</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-purple-50">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Next Steps</h3>
              <div className="space-y-3">
                {[
                  { label: "Add profile photo", done: true },
                  { label: "Generate CV summary", done: true },
                  { label: "Connect LinkedIn", done: false },
                  { label: "Join Talent Network", done: false }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      step.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-300"
                    )}>
                      <Check size={12} />
                    </div>
                    <span className={cn("text-sm", step.done ? "text-gray-900" : "text-gray-400")}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all"
            >
              <RefreshCw size={20} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Generating..." : "Regenerate Branding"}
            </button>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden">
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
                  "flex-1 py-6 font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  activeTab === 'cv' ? "text-purple-700 bg-purple-50 border-b-2 border-purple-700" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <FileText size={18} />
                Professional CV
              </button>
              <button 
                onClick={() => setActiveTab('linkedin')}
                className={cn(
                  "flex-1 py-6 font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  activeTab === 'linkedin' ? "text-purple-700 bg-purple-50 border-b-2 border-purple-700" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Linkedin size={18} />
                LinkedIn Bio
              </button>
            </div>

            <div className="p-8 flex-1 relative">
              <div className="absolute top-8 right-8 flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-white border border-purple-100 rounded-lg text-gray-500 hover:text-purple-600 transition-all shadow-sm"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button className="p-2 bg-white border border-purple-100 rounded-lg text-gray-500 hover:text-purple-600 transition-all shadow-sm" title="Download PDF">
                  <Download size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="prose prose-purple max-w-none"
                >
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-6 rounded-2xl border border-gray-100 leading-relaxed">
                    {activeTab === 'cv' ? cvContent : linkedinBio}
                  </pre>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-8 bg-purple-50 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm text-purple-900 font-medium">AI-optimized for South African applicant tracking systems (ATS).</p>
              </div>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all whitespace-nowrap">
                Export to Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
