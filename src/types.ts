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

export interface MelsoftProgramme {
  id: string; // slug used in https://www.melsoftacademy.com/programme/<id>
  title: string;
  track: 'Accredited' | 'Bootcamp';
  description: string;
  duration: string;
  cost: string;
  accreditation?: string;
  careerPaths: string[]; // CareerPath ids this programme suits
}
