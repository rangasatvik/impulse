import { colors } from './theme';

export interface Community {
  id: string;
  title: string;
  description: string;
  members: number;
  compatibility: number;
  nextEvent: string;
  icon: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  compatiblePeople: number;
  vibe: string;
}

export interface AgentMemory {
  id: string;
  title: string;
  detail: string;
  category: 'Interests' | 'Social Preferences' | 'Recent Life Updates' | 'Boundaries' | 'Conversation Wins';
  private: boolean;
  matching: boolean;
}

export const COMMUNITIES: Community[] = [
  {
    id: 'ai-builders',
    title: 'AI Builders Circle',
    description: 'Low-pressure group for side projects, demos, and finding technical collaborators.',
    members: 128,
    compatibility: 91,
    nextEvent: 'Prototype night · Thu',
    icon: 'sparkles',
  },
  {
    id: 'study-circle',
    title: 'Pre-Test Study Circle',
    description: 'Quiet study blocks with optional walk-and-talk breaks afterward.',
    members: 64,
    compatibility: 84,
    nextEvent: 'Study jam · Tomorrow',
    icon: 'book',
  },
  {
    id: 'founders',
    title: 'Young Founders',
    description: 'Campus builders sharing pitches, feedback, and practical startup help.',
    members: 93,
    compatibility: 88,
    nextEvent: 'Founder night · Fri',
    icon: 'rocket',
  },
];

export const EVENTS: CampusEvent[] = [
  {
    id: 'coffee',
    title: 'Low-key coffee meetup',
    time: 'Today · 4:30 PM',
    location: 'Student center patio',
    compatiblePeople: 3,
    vibe: 'warm intros',
  },
  {
    id: 'study',
    title: 'AI + business study jam',
    time: 'Tomorrow · 6:00 PM',
    location: 'Library room 204',
    compatiblePeople: 5,
    vibe: 'focused',
  },
  {
    id: 'walk',
    title: 'Campus walk & talk',
    time: 'Sat · 10:00 AM',
    location: 'North quad',
    compatiblePeople: 4,
    vibe: 'low pressure',
  },
];

export const DEFAULT_MEMORIES: AgentMemory[] = [
  {
    id: 'warm-openers',
    title: 'Prefers funny warm openers',
    detail: 'Your agent should start light, then invite a real answer.',
    category: 'Social Preferences',
    private: true,
    matching: true,
  },
  {
    id: 'builders',
    title: 'Interested in AI, startups, and product demos',
    detail: 'Good shared context for study groups, founder events, and project-based intros.',
    category: 'Interests',
    private: false,
    matching: true,
  },
  {
    id: 'pace',
    title: 'Likes low-pressure conversations',
    detail: 'Avoid intense first messages and prioritize easy reply prompts.',
    category: 'Boundaries',
    private: true,
    matching: true,
  },
  {
    id: 'wins',
    title: 'Study-based intros work well',
    detail: 'Your best conversations start around a shared task or event.',
    category: 'Conversation Wins',
    private: true,
    matching: true,
  },
];

export const SOCIAL_MOVES = [
  'React to one story with a real sentence.',
  'Ask one person about a project they mentioned.',
  'Save one spark for later instead of forcing a chat.',
  'Join one small event where your agent sees overlap.',
];

export const SAFETY_COPY = [
  'AI suggestions are optional. You approve every outgoing message.',
  'Private memories stay private and are never shown to matches.',
  'You can report, block, hide, or tune recommendations at any time.',
];

export const SPARK_FACTORS = [
  { label: 'Humor fit', color: colors.accent },
  { label: 'Social pace', color: colors.ai },
  { label: 'Shared values', color: colors.safety },
  { label: 'Conversation ease', color: colors.primaryLight },
];
