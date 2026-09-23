import { CareerPath, KnobzCertificate } from './types';

// Learning partner: KnobzToLearn (NobzLearn) AI Developer Certificate Programme.
export const KNOBZ = {
  name: 'KnobzToLearn',
  url: 'https://knobztolearn.nobztech.co.za/',
  signupUrl: 'https://knobztolearn.nobztech.co.za/login',
  coursesUrl: 'https://knobztolearn.nobztech.co.za/courses',
};

// Certificates are sequential on KnobzToLearn: each one unlocks after the previous is completed.
export const KNOBZ_CERTIFICATES: KnobzCertificate[] = [
  {
    number: 1,
    title: 'AI Digital Professional',
    subtitle: 'Workplace Readiness & AI Productivity',
    description: 'Master workplace foundations, AI tools, and digital productivity to launch your professional career.',
    level: 'Beginner',
    modules: 3,
  },
  {
    number: 2,
    title: 'Junior Software Developer',
    subtitle: 'Programming, Web Dev & Real Applications',
    description: 'Go from zero to job-ready: learn programming, web development, and how to build real applications.',
    level: 'Intermediate',
    modules: 6,
  },
  {
    number: 3,
    title: 'AI-Enhanced Developer',
    subtitle: 'Prompt Engineering, Testing & Docs',
    description: 'Level up with prompt engineering, professional testing, and technical documentation skills.',
    level: 'Intermediate',
    modules: 3,
  },
  {
    number: 4,
    title: 'AI Application Developer',
    subtitle: 'Agents, RAG Systems & Production Apps',
    description: 'Build production-ready AI applications, autonomous agents, and RAG systems.',
    level: 'Advanced',
    modules: 5,
  },
];

export function getCertificate(number: KnobzCertificate['number']): KnobzCertificate {
  return KNOBZ_CERTIFICATES.find(c => c.number === number)!;
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'ai-digital-professional',
    title: 'AI Digital Professional',
    whyItFits: 'Suits people who are organised, communicate well and want to thrive in any modern workplace by using AI tools to work smarter.',
    skillsNeeded: ['Workplace Readiness', 'AI Productivity Tools', 'Digital Literacy'],
    certificate: 1,
    icon: 'Briefcase',
  },
  {
    id: 'junior-software-developer',
    title: 'Junior Software Developer',
    whyItFits: 'Perfect for problem-solvers who enjoy building things and have a logical mindset.',
    skillsNeeded: ['Programming', 'Web Development', 'Building Real Applications'],
    certificate: 2,
    icon: 'Code',
  },
  {
    id: 'ai-enhanced-developer',
    title: 'AI-Enhanced Developer',
    whyItFits: 'Great for detail-oriented thinkers who write clearly and like making sure software works properly.',
    skillsNeeded: ['Prompt Engineering', 'Software Testing', 'Technical Documentation'],
    certificate: 3,
    icon: 'FileCheck',
  },
  {
    id: 'ai-application-developer',
    title: 'AI Application Developer',
    whyItFits: 'Ideal for ambitious builders who want to create AI-powered products, agents and systems.',
    skillsNeeded: ['AI Agents', 'RAG Systems', 'Production AI Apps'],
    certificate: 4,
    icon: 'Bot',
  },
];
