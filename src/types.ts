export interface UserProfile {
  name: string;
  interests: string[];
  strengths: string[];
  goals: string[];
  workStyle: string;
}

export interface CareerPath {
  id: string;
  title: string;
  whyItFits: string;
  skillsNeeded: string[];
  learningResources: { title: string; url: string }[];
  saExamples: string[];
  icon: string;
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  type: 'Bursary' | 'Internship' | 'Learnership' | 'Graduate Program';
  description: string;
  link: string;
}
