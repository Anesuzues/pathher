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
    description: 'Government funding for South African students from poor and working-class backgrounds. Covers tuition, accommodation, and a living allowance.',
    link: 'https://www.nsfas.org.za',
    careerPaths: ['software-dev', 'data-analyst', 'ux-designer', 'digital-marketer'],
  },
  {
    id: 'we-think-code',
    title: 'Software Engineering Program',
    provider: 'WeThinkCode_',
    type: 'Learnership',
    description: 'Tuition-free, two-year software engineering training for youth in South Africa. No prior coding experience required.',
    link: 'https://www.wethinkcode.co.za',
    careerPaths: ['software-dev'],
  },
  {
    id: 'girlcode',
    title: 'GirlCode Learnerships',
    provider: 'GirlCode',
    type: 'Learnership',
    description: 'Empowering young women through tech skills, mentorship, and job placement in South Africa\'s growing tech sector.',
    link: 'https://girlcode.co.za',
    careerPaths: ['software-dev', 'ux-designer'],
  },
  {
    id: 'sasol-bursary',
    title: 'Sasol Bursary Programme',
    provider: 'Sasol',
    type: 'Bursary',
    description: 'Full bursaries for BSc, BCom, and Engineering students. Includes vacation work and mentorship from industry professionals.',
    link: 'https://www.sasol.com/careers/bursaries',
    careerPaths: ['data-analyst', 'software-dev'],
  },
  {
    id: 'standard-bank-it-internship',
    title: 'IT & Technology Internship',
    provider: 'Standard Bank',
    type: 'Internship',
    description: 'Gain hands-on experience in software development, data, and digital banking technology at one of Africa\'s largest banks.',
    link: 'https://www.standardbank.com/sbg/standard-bank-group/careers',
    careerPaths: ['software-dev', 'data-analyst'],
  },
  {
    id: 'capitec-grad',
    title: 'Capitec Graduate Programme',
    provider: 'Capitec Bank',
    type: 'Graduate Program',
    description: 'A structured graduate programme placing top talent in data, technology, and design teams across Capitec\'s operations.',
    link: 'https://www.capitecbank.co.za/careers',
    careerPaths: ['data-analyst', 'ux-designer', 'software-dev'],
  },
  {
    id: 'fnb-grad',
    title: 'FNB Graduate Programme',
    provider: 'First National Bank',
    type: 'Graduate Program',
    description: 'FNB\'s graduate programme offers rotations across tech, data analytics, and digital innovation departments.',
    link: 'https://www.fnb.co.za/careers',
    careerPaths: ['data-analyst', 'software-dev'],
  },
  {
    id: 'vodacom-grad',
    title: 'Vodacom Graduate Accelerator',
    provider: 'Vodacom',
    type: 'Graduate Program',
    description: 'A 12-month accelerator for graduates in technology, digital marketing, and data science. Includes mentorship and real project exposure.',
    link: 'https://www.vodacom.co.za/careers',
    careerPaths: ['software-dev', 'data-analyst', 'digital-marketer'],
  },
  {
    id: 'mtn-bursary',
    title: 'MTN SA Bursary',
    provider: 'MTN South Africa',
    type: 'Bursary',
    description: 'Bursaries for students pursuing degrees in IT, Computer Science, and Commerce. Includes guaranteed vacation work.',
    link: 'https://www.mtn.com/careers',
    careerPaths: ['software-dev', 'data-analyst', 'digital-marketer'],
  },
  {
    id: 'entelect-grad',
    title: 'Entelect Graduate Programme',
    provider: 'Entelect',
    type: 'Graduate Program',
    description: 'One of SA\'s top software engineering graduate programmes. Structured training, mentorship, and placement on real client projects.',
    link: 'https://entelect.co.za/careers',
    careerPaths: ['software-dev'],
  },
  {
    id: 'discovery-data',
    title: 'Discovery Data Science Academy',
    provider: 'Discovery',
    type: 'Graduate Program',
    description: 'Intensive data science training and graduate placement within Discovery\'s analytics and actuarial teams.',
    link: 'https://www.discovery.co.za/careers',
    careerPaths: ['data-analyst'],
  },
  {
    id: 'ogilvy-internship',
    title: 'Ogilvy SA Creative Internship',
    provider: 'Ogilvy South Africa',
    type: 'Internship',
    description: 'An immersive internship in digital marketing, content strategy, and brand communications at one of SA\'s leading agencies.',
    link: 'https://www.ogilvy.com/sa/careers',
    careerPaths: ['digital-marketer'],
  },
  {
    id: 'red-yellow',
    title: 'Red & Yellow Learnership',
    provider: 'Red & Yellow Creative School',
    type: 'Learnership',
    description: 'SETA-accredited digital marketing learnerships covering SEO, social media, Google Ads, and content strategy.',
    link: 'https://www.redandyellow.co.za',
    careerPaths: ['digital-marketer'],
  },
  {
    id: 'takealot-ux',
    title: 'UX Design Internship',
    provider: 'Takealot',
    type: 'Internship',
    description: 'Work alongside Takealot\'s in-house UX team designing and testing user experiences for one of Africa\'s largest e-commerce platforms.',
    link: 'https://www.takealot.com/careers',
    careerPaths: ['ux-designer'],
  },
  {
    id: 'absa-data',
    title: 'Absa Data & Analytics Internship',
    provider: 'Absa Group',
    type: 'Internship',
    description: 'Internship in data analytics, business intelligence, and reporting within Absa\'s enterprise data division.',
    link: 'https://www.absa.africa/careers',
    careerPaths: ['data-analyst'],
  },
  {
    id: 'anglo-bursary',
    title: 'Anglo American Bursary',
    provider: 'Anglo American',
    type: 'Bursary',
    description: 'Full bursaries covering tuition, accommodation, and meals for students in STEM, data science, and engineering fields.',
    link: 'https://www.angloamerican.com/careers/students-and-graduates',
    careerPaths: ['data-analyst', 'software-dev'],
  },
];
