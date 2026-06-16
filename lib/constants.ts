import { EnergyLevel, Mood } from './types';

// Avatar gradient palette — index stored on each profile.
export const AVATAR_GRADIENTS: readonly [string, string][] = [
  ['#9A1E15', '#C82234'],
  ['#C82234', '#FF9445'],
  ['#FF9445', '#DD4729'],
  ['#BD4F42', '#9A1E15'],
  ['#DD4729', '#100904'],
  ['#FFB15C', '#C82234'],
  ['#C05040', '#FF9445'],
  ['#9A1E15', '#FF9445'],
];

export const MOODS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: 'energized', emoji: '⚡', label: 'Energized' },
  { mood: 'happy', emoji: '😄', label: 'Happy' },
  { mood: 'neutral', emoji: '😌', label: 'Neutral' },
  { mood: 'reflective', emoji: '🌙', label: 'Reflective' },
  { mood: 'anxious', emoji: '😰', label: 'Anxious' },
  { mood: 'lonely', emoji: '🥺', label: 'Lonely' },
  { mood: 'tired', emoji: '😴', label: 'Tired' },
];

export function moodMeta(mood?: Mood) {
  return MOODS.find((m) => m.mood === mood) ?? MOODS[2];
}

export const MOOD_PREFERENCES: Record<Mood, string> = {
  energized: 'high-energy, exciting, adventurous content',
  happy: 'fun, light-hearted, celebratory posts',
  neutral: 'a balanced mix of interesting topics',
  reflective: 'thoughtful, deep, philosophical content',
  anxious: 'calming, supportive, relatable content',
  lonely: 'warm, community-focused, welcoming posts',
  tired: 'low-effort, cozy, feel-good content',
};

export const INTERESTS: { tag: string; emoji: string }[] = [
  { tag: 'Gaming', emoji: '🎮' },
  { tag: 'Music', emoji: '🎵' },
  { tag: 'Art', emoji: '🎨' },
  { tag: 'Sports', emoji: '⚽' },
  { tag: 'Coding', emoji: '💻' },
  { tag: 'Cooking', emoji: '🍳' },
  { tag: 'Reading', emoji: '📚' },
  { tag: 'Film', emoji: '🎬' },
  { tag: 'Photography', emoji: '📸' },
  { tag: 'Fitness', emoji: '💪' },
  { tag: 'Travel', emoji: '✈️' },
  { tag: 'Fashion', emoji: '👗' },
  { tag: 'Dance', emoji: '💃' },
  { tag: 'Anime', emoji: '🌸' },
  { tag: 'Hiking', emoji: '🥾' },
  { tag: 'Podcasts', emoji: '🎙️' },
  { tag: 'Astrology', emoji: '⭐' },
  { tag: 'Entrepreneurship', emoji: '💡' },
  { tag: 'Writing', emoji: '✍️' },
  { tag: 'Mental Health', emoji: '🧠' },
  { tag: 'Nature', emoji: '🌿' },
  { tag: 'Comedy', emoji: '😂' },
  { tag: 'Philosophy', emoji: '🤔' },
  { tag: 'Food', emoji: '🍜' },
  { tag: 'Music Production', emoji: '🎹' },
];

export function interestEmoji(tag: string): string {
  return INTERESTS.find((i) => i.tag.toLowerCase() === tag.toLowerCase())?.emoji ?? '✨';
}

// Personality attributes an answer can contribute.
export interface AnswerEffect {
  energy?: EnergyLevel;
  humor?: string;
  communication?: string;
  value?: string;
  openness?: number;
  depth?: number;
  expressiveness?: number;
  sociability?: number;
}

export interface PersonalityQuestion {
  id: string;
  prompt: string;
  options: { label: string; effect: AnswerEffect }[];
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 'friday',
    prompt: 'Your ideal Friday night?',
    options: [
      { label: 'Chill at home', effect: { energy: 'low', sociability: 0.2, value: 'comfort' } },
      { label: 'Small hangout', effect: { energy: 'medium', sociability: 0.5, value: 'loyalty' } },
      { label: 'Big party', effect: { energy: 'high', sociability: 0.95, expressiveness: 0.8 } },
      { label: 'Adventure', effect: { energy: 'high', value: 'adventure', openness: 0.9 } },
    ],
  },
  {
    id: 'group',
    prompt: "In a group, you're usually the...",
    options: [
      { label: 'Listener', effect: { communication: 'empathetic', depth: 0.8, sociability: 0.3 } },
      { label: 'Storyteller', effect: { communication: 'expressive', expressiveness: 0.9 } },
      { label: 'Organizer', effect: { communication: 'direct', value: 'reliability' } },
      { label: 'Wildcard', effect: { humor: 'absurd', openness: 0.9, expressiveness: 0.7 } },
    ],
  },
  {
    id: 'humor',
    prompt: 'Your humor vibe?',
    options: [
      { label: 'Dry / witty', effect: { humor: 'dry', depth: 0.6 } },
      { label: 'Absurd / random', effect: { humor: 'absurd', openness: 0.7 } },
      { label: 'Wholesome', effect: { humor: 'wholesome', value: 'kindness' } },
      { label: 'Sarcastic', effect: { humor: 'sarcastic', expressiveness: 0.6 } },
    ],
  },
  {
    id: 'conflict',
    prompt: 'When something goes wrong, you...',
    options: [
      { label: 'Talk it out', effect: { communication: 'empathetic', expressiveness: 0.7, value: 'honesty' } },
      { label: 'Process alone', effect: { communication: 'thoughtful', depth: 0.9, sociability: 0.2 } },
      { label: 'Make a joke', effect: { humor: 'dry', expressiveness: 0.6 } },
      { label: 'Problem-solve', effect: { communication: 'direct', value: 'growth' } },
    ],
  },
  {
    id: 'comm',
    prompt: 'Your communication style?',
    options: [
      { label: 'Direct', effect: { communication: 'direct', expressiveness: 0.5 } },
      { label: 'Thoughtful / slow', effect: { communication: 'thoughtful', depth: 0.85 } },
      { label: 'Expressive', effect: { communication: 'expressive', expressiveness: 0.95 } },
      { label: 'Minimal', effect: { communication: 'minimal', expressiveness: 0.2 } },
    ],
  },
  {
    id: 'energy',
    prompt: 'Your energy level?',
    options: [
      { label: 'Low & cozy', effect: { energy: 'low', sociability: 0.3 } },
      { label: 'Medium', effect: { energy: 'medium', sociability: 0.55 } },
      { label: 'High & buzzing', effect: { energy: 'high', sociability: 0.9, expressiveness: 0.8 } },
    ],
  },
  {
    id: 'friend',
    prompt: 'Most important in a friend?',
    options: [
      { label: 'Loyalty', effect: { value: 'loyalty', depth: 0.6 } },
      { label: 'Humor', effect: { value: 'humor', expressiveness: 0.6 } },
      { label: 'Depth', effect: { value: 'depth', depth: 0.95 } },
      { label: 'Adventurousness', effect: { value: 'adventure', openness: 0.9 } },
    ],
  },
  {
    id: 'social',
    prompt: 'You tend to be...',
    options: [
      { label: 'Introverted', effect: { sociability: 0.2, depth: 0.7 } },
      { label: 'Ambivert', effect: { sociability: 0.55 } },
      { label: 'Extroverted', effect: { sociability: 0.95, expressiveness: 0.8 } },
    ],
  },
];

export const AGENT_OPENER =
  "Hey! I'm here to learn everything about you so I can find you the people you'd actually click with. Let's start simple — what's something most people don't know about you?";
