export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'es' | 'fr' | 'de' | 'zh' | 'ar';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  pincode: string;
  language: Language;
}

export interface SymptomAnalysis {
  condition: string;
  description: string;
  traditionalRemedies: string[];
  recommendations: string;
}

export interface ImageAnalysis {
  findings: string;
  isMedical: boolean;
  details: string;
}

export interface RoutineAnalysis {
  status: 'healthy' | 'unhealthy';
  feedback: string;
  tips: string[];
}

export interface Hospital {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  distance?: string;
  specialty?: string;
}

export interface Alarm {
  id: string;
  type: 'medication' | 'meal' | 'exercise' | 'other';
  time: string;
  label: string;
  active: boolean;
}
