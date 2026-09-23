export interface UserProfile {
  name: string;
  interests: string[];
  strengths: string[];
  goals: string[];
  workStyle: string[];
}

export interface KnobzCertificate {
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: number;
}

export interface CareerPath {
  id: string;
  title: string;
  whyItFits: string;
  skillsNeeded: string[];
  certificate: KnobzCertificate['number']; // KnobzToLearn certificate that qualifies you for this path
  icon: string;
}
