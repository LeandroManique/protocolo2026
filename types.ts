export enum ViewState {
  HOME = 'HOME',
  CHAT = 'CHAT',
  SCRIPT_GENERATOR = 'SCRIPT_GENERATOR',
  STRATEGIES = 'STRATEGIES',
  NEWS = 'NEWS',
  PROFILE_AUDITOR = 'PROFILE_AUDITOR',
  SEO_OPTIMIZER = 'SEO_OPTIMIZER',
  USER_PROFILE = 'USER_PROFILE',
  LEGAL_TERMS = 'LEGAL_TERMS',
  LEGAL_PRIVACY = 'LEGAL_PRIVACY'
}

export interface UserProfile {
  handle: string;
  niche: string;
  followers: string;
  goal: string; // e.g., 'Monetization', 'Viral Growth', 'Sales'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface ScriptQuestion {
  id: string;
  text: string;
  type: 'text' | 'select';
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface ScriptAnswers {
  [key: string]: string;
}

export interface StrategyDoc {
  id: string;
  title: string;
  date: string;
  content: string;
}

export interface ProfileAuditResult {
  score: number;
  summary: string;
  roast: string;
  fixes: {
    name: string;
    bio: string;
    explanation: string;
  };
  checklist: {
    seo: boolean;
    cta: boolean;
    clarity: boolean;
  };
}

export interface SEOResult {
  thumbnailText: string;
  caption: string;
  hashtags: {
    broad: string[];
    niche: string[];
    specific: string[];
  };
  searchTerms: string[];
}
