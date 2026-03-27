import { CareerPath, Opportunity } from './types';

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'software-dev',
    title: 'Software Developer',
    whyItFits: 'Perfect for problem-solvers who enjoy building things and have a logical mindset.',
    skillsNeeded: ['JavaScript/TypeScript', 'React', 'Problem Solving', 'Data Structures'],
    learningResources: [
      { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }
    ],
    saExamples: ['Entelect Graduate Program', 'OfferZen', 'Standard Bank Tech Internships'],
    icon: 'Code'
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    whyItFits: 'Ideal for those who love numbers, patterns, and helping businesses make informed decisions.',
    skillsNeeded: ['SQL', 'Python', 'Excel', 'Data Visualization'],
    learningResources: [
      { title: 'Google Data Analytics Certificate', url: 'https://grow.google/certificates/data-analytics/' },
      { title: 'Kaggle', url: 'https://www.kaggle.com' }
    ],
    saExamples: ['Discovery Data Science Academy', 'Absa Data Internships', 'FNB Analytics Graduate Program'],
    icon: 'BarChart'
  },
  {
    id: 'ux-designer',
    title: 'UX/UI Designer',
    whyItFits: 'Great for creative thinkers who are empathetic and want to improve how people interact with technology.',
    skillsNeeded: ['Figma', 'User Research', 'Wireframing', 'Visual Design'],
    learningResources: [
      { title: 'Google UX Design Certificate', url: 'https://grow.google/certificates/ux-design/' },
      { title: 'Interaction Design Foundation', url: 'https://www.interaction-design.org' }
    ],
    saExamples: ['Old Mutual Design Internships', 'Takealot UX Team', 'Capitec Design Graduate Program'],
    icon: 'Layout'
  },
  {
    id: 'digital-marketer',
    title: 'Digital Marketing Specialist',
    whyItFits: 'Suits those who are creative, analytical, and enjoy social media and communication.',
    skillsNeeded: ['SEO', 'Content Strategy', 'Social Media Management', 'Google Ads'],
    learningResources: [
      { title: 'HubSpot Academy', url: 'https://academy.hubspot.com' },
      { title: 'Google Digital Garage', url: 'https://learndigital.withgoogle.com/digitalgarage' }
    ],
    saExamples: ['Red & Yellow Creative School of Business', 'Ogilvy SA Internships', 'Multichoice Marketing Program'],
    icon: 'Megaphone'
  }
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'nsfas',
    title: 'NSFAS Funding',
    provider: 'National Student Financial Aid Scheme',
    type: 'Bursary',
    description: 'Government funding for South African students from poor and working-class backgrounds.',
    link: 'https://www.nsfas.org.za'
  },
  {
    id: 'we-think-code',
    title: 'Software Engineering Program',
    provider: 'WeThinkCode_',
    type: 'Learnership',
    description: 'Tuition-free software engineering training for youth in South Africa.',
    link: 'https://www.wethinkcode.co.za'
  },
  {
    id: 'girlcode',
    title: 'GirlCode Learnerships',
    provider: 'GirlCode',
    type: 'Learnership',
    description: 'Empowering young women through tech skills and job placement.',
    link: 'https://girlcode.co.za'
  }
];
