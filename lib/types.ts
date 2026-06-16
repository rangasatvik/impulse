export type EnergyLevel = 'low' | 'medium' | 'high';

export type Mood =
  | 'energized'
  | 'happy'
  | 'neutral'
  | 'reflective'
  | 'anxious'
  | 'lonely'
  | 'tired';

export interface Profile {
  id: string;
  email: string;
  password: string; // local-only demo auth, never leaves the device
  username: string;
  displayName: string;
  age: number | null;
  bio: string;
  avatarColorIndex: number;
  isPremium: boolean;
  meaningfulConnectionsScore: number;
  onboardingComplete: boolean;
  createdAt: string;
  isSeed?: boolean;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  personalitySummary: string;
  agentBio: string;
  humorStyle: string;
  communicationStyle: string;
  energyLevel: EnergyLevel;
  values: string[];
  interests: string[];
  emotionalState: string;
  // numeric traits used by the matching engine (0..1)
  vector: {
    openness: number;
    depth: number;
    expressiveness: number;
    energy: number;
    humor: number;
    sociability: number;
  };
  trainingTurns: number;
  isActive: boolean;
}

export interface TrainingMessage {
  id: string;
  agentId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AgentConversationTurn {
  role: 'agent_a' | 'agent_b';
  content: string;
}

export interface AgentConversation {
  id: string;
  agentAId: string;
  agentBId: string;
  compatibilityScore: number;
  breakdown: {
    emotionalAlignment: number;
    humorCompatibility: number;
    valuesOverlap: number;
    communicationFit: number;
    interestOverlap: number;
  };
  conversationLog: AgentConversationTurn[];
  summary: string;
  icebreaker: string;
  status: 'matched' | 'rejected';
  completedAt: string;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  agentConversationId: string;
  compatibilityScore: number;
  matchReason: string;
  icebreaker: string;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  content: string;
  moodTag?: Mood;
  interestTags: string[];
  likeCount: number;
  createdAt: string;
}

export interface MoodCheckin {
  id: string;
  userId: string;
  mood: Mood;
  note?: string;
  createdAt: string;
}

export type NotificationType =
  | 'new_match'
  | 'new_message'
  | 'agent_match_found'
  | 'co_pilot_tip'
  | 'milestone';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}
