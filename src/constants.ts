import { CareerPath, KnobzCertificate, MelsoftProgramme } from './types';

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

// Programmes listed on https://www.melsoftacademy.com (accredited qualifications and bootcamps).
export const MELSOFT = {
  name: 'Melsoft Academy',
  url: 'https://www.melsoftacademy.com/',
  fundingUrl: 'https://www.melsoftacademy.com/funding',
  programmeUrl: (id: string) => `https://www.melsoftacademy.com/programme/${id}`,
};

export const MELSOFT_PROGRAMMES: MelsoftProgramme[] = [
  {
    id: 'software-developer',
    title: 'Software Developer',
    track: 'Accredited',
    description: 'Covers the full software development lifecycle, from requirements analysis to deployment.',
    duration: '12 months',
    cost: 'R 74 999',
    accreditation: 'NQF Level 5 · QCTO',
    careerPaths: ['junior-software-developer'],
  },
  {
    id: 'software-engineering',
    title: 'Software Developer Bootcamp',
    track: 'Bootcamp',
    description: 'Intensive, hands-on programme that takes beginners to job-ready full-stack developers.',
    duration: '6 months',
    cost: 'R 49 999',
    careerPaths: ['junior-software-developer'],
  },
  {
    id: 'ai-software-developer',
    title: 'AI Software Developer',
    track: 'Accredited',
    description: 'AI from basics to deployment: Python, machine learning, deep learning and ethical AI.',
    duration: '12 months',
    cost: 'R 74 999',
    accreditation: 'NQF Level 5 · QCTO',
    careerPaths: ['ai-application-developer'],
  },
  {
    id: 'ai-software-engineering',
    title: 'AI Software Developer Bootcamp',
    track: 'Bootcamp',
    description: 'Intensive programme for dedicated developers building AI software.',
    duration: '6–12 months',
    cost: 'R 49 999',
    careerPaths: ['ai-application-developer'],
  },
  {
    id: 'data-science-practitioner',
    title: 'Data Science Practitioner',
    track: 'Accredited',
    description: 'Turn raw data into insights, and present findings through visualisations and reports.',
    duration: '12 months',
    cost: 'R 74 999',
    accreditation: 'NQF Level 5 · QCTO',
    careerPaths: ['ai-enhanced-developer'],
  },
  {
    id: 'data-science',
    title: 'Data Science Bootcamp',
    track: 'Bootcamp',
    description: 'Practical programme covering the full data science lifecycle for beginners.',
    duration: '6 months',
    cost: 'R 49 999',
    careerPaths: ['ai-enhanced-developer'],
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    track: 'Accredited',
    description: 'Learn to protect networks, systems and data from cyber threats.',
    duration: '12 months',
    cost: 'R 74 999',
    accreditation: 'NQF Level 5 · QCTO',
    careerPaths: [],
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security Bootcamp',
    track: 'Bootcamp',
    description: 'Prepares you for roles like Cybersecurity Analyst, Ethical Hacker or Information Security Consultant.',
    duration: '6 months',
    cost: 'R 49 999',
    careerPaths: [],
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    track: 'Bootcamp',
    description: '12-week Creator Academy: find your voice, build your content engine and launch monetised content.',
    duration: '12 weeks',
    cost: 'R 19 999',
    careerPaths: ['ai-digital-professional'],
  },
];
