export type ChatMode = 'developer' | 'hackathon';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: ChatMode;
  model?: string;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: ChatMode;
  pinned?: boolean;
  isReadOnly?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  hackathonTeam?: string;
  isGuest?: boolean;
}

export interface AppSettings {
  aiModel: string;
  systemPromptCustom: string;
  streamResponses: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isSupabaseConnected: boolean;
  enableSoundFx: boolean;
  defaultMode: ChatMode;
}

export type ToolType = 
  | 'architecture' 
  | 'prompt_opt' 
  | 'debugger' 
  | 'rag_planner' 
  | 'deploy_checklist';

export type HackathonToolType = 
  | 'ideate' 
  | 'roadmap' 
  | 'starter_kit' 
  | 'pitch';

export interface ToolPreset {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  iconName: string;
  badge: string;
  defaultParams: Record<string, string>;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface HackathonProjectInputs {
  projectIdea: string;
  problemStatement: string;
  targetUsers: string;
  preferredTechnologies: string[];
  experienceLevel: ExperienceLevel;
}

export interface HackathonGeneratedProject {
  id: string;
  createdAt: number;
  inputs: HackathonProjectInputs;
  fullMarkdown: string;
  model: string;
}
