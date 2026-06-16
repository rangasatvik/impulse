// Local heuristic "AI" engine. Replaces the OpenAI edge functions from the spec
// with deterministic, context-aware logic so the whole app runs offline in the
// browser with no API keys. It is intentionally lightweight but reacts to user
// input, personality traits, and interest overlap so a demo feels alive.

import { AnswerEffect, INTERESTS } from './constants';
import {
  Agent,
  AgentConversation,
  AgentConversationTurn,
  EnergyLevel,
  Message,
  Mood,
  FeedPost,
} from './types';

// ---------- small utilities ----------

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Stable pseudo-random in [0,1) seeded by a string — same pair always scores the same.
function seeded(seed: string): number {
  const x = Math.sin(hashString(seed)) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: string): T {
  return arr[hashString(seed) % arr.length];
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a.map((x) => x.toLowerCase()));
  const B = new Set(b.map((x) => x.toLowerCase()));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach((x) => {
    if (B.has(x)) inter++;
  });
  const union = new Set([...A, ...B]).size;
  return inter / union;
}

function shared(a: string[], b: string[]): string[] {
  const B = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => B.has(x.toLowerCase()));
}

// ---------- building an agent from onboarding answers ----------

export interface ComposedTraits {
  humorStyle: string;
  communicationStyle: string;
  energyLevel: EnergyLevel;
  values: string[];
  vector: Agent['vector'];
}

export function composeTraits(effects: AnswerEffect[], interests: string[]): ComposedTraits {
  const humorCounts: Record<string, number> = {};
  const commCounts: Record<string, number> = {};
  const energyCounts: Record<EnergyLevel, number> = { low: 0, medium: 0, high: 0 };
  const valueCounts: Record<string, number> = {};
  const v = { openness: 0.5, depth: 0.5, expressiveness: 0.5, energy: 0.5, sociability: 0.5, humor: 0.5 };
  const accum: Record<string, number[]> = {};

  for (const e of effects) {
    if (e.humor) humorCounts[e.humor] = (humorCounts[e.humor] || 0) + 1;
    if (e.communication) commCounts[e.communication] = (commCounts[e.communication] || 0) + 1;
    if (e.energy) energyCounts[e.energy]++;
    if (e.value) valueCounts[e.value] = (valueCounts[e.value] || 0) + 1;
    (['openness', 'depth', 'expressiveness', 'sociability'] as const).forEach((k) => {
      if (e[k] != null) (accum[k] ||= []).push(e[k] as number);
    });
  }

  const topKey = (obj: Record<string, number>, fallback: string) =>
    Object.keys(obj).sort((a, b) => obj[b] - obj[a])[0] ?? fallback;

  const energyLevel = (Object.keys(energyCounts) as EnergyLevel[]).sort(
    (a, b) => energyCounts[b] - energyCounts[a]
  )[0];

  (['openness', 'depth', 'expressiveness', 'sociability'] as const).forEach((k) => {
    const list = accum[k];
    if (list?.length) v[k] = list.reduce((a, c) => a + c, 0) / list.length;
  });
  v.energy = energyLevel === 'low' ? 0.25 : energyLevel === 'high' ? 0.9 : 0.55;
  const humorStyle = topKey(humorCounts, 'playful');
  v.humor = { dry: 0.5, absurd: 0.85, wholesome: 0.35, sarcastic: 0.65, playful: 0.6 }[humorStyle] ?? 0.6;

  const values = Object.keys(valueCounts).sort((a, b) => valueCounts[b] - valueCounts[a]).slice(0, 4);
  if (values.length < 3) values.push(...['authenticity', 'curiosity', 'kindness'].filter((x) => !values.includes(x)));

  return {
    humorStyle,
    communicationStyle: topKey(commCounts, 'thoughtful'),
    energyLevel: energyLevel ?? 'medium',
    values: values.slice(0, 4),
    vector: v,
  };
}

// ---------- personality summary / bio generation ----------

const INTEREST_KEYWORDS: Record<string, string> = {};
INTERESTS.forEach((i) => {
  INTEREST_KEYWORDS[i.tag.toLowerCase()] = i.tag;
});
const EXTRA_KEYWORDS: Record<string, string> = {
  game: 'Gaming',
  games: 'Gaming',
  song: 'Music',
  guitar: 'Music',
  paint: 'Art',
  draw: 'Art',
  code: 'Coding',
  program: 'Coding',
  cook: 'Cooking',
  bake: 'Cooking',
  book: 'Reading',
  movie: 'Film',
  photo: 'Photography',
  gym: 'Fitness',
  run: 'Fitness',
  travel: 'Travel',
  hike: 'Hiking',
  podcast: 'Podcasts',
  write: 'Writing',
  nature: 'Nature',
  funny: 'Comedy',
  philosophy: 'Philosophy',
};

export function detectInterests(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  Object.keys(INTEREST_KEYWORDS).forEach((k) => {
    if (lower.includes(k)) found.add(INTEREST_KEYWORDS[k]);
  });
  Object.keys(EXTRA_KEYWORDS).forEach((k) => {
    if (lower.includes(k)) found.add(EXTRA_KEYWORDS[k]);
  });
  return [...found];
}

export function generateSummary(agent: Agent, trainingText: string): { summary: string; bio: string } {
  const energyWord =
    agent.energyLevel === 'low' ? 'calm, low-key' : agent.energyLevel === 'high' ? 'high-energy' : 'easygoing';
  const topInterests = agent.interests.slice(0, 3).join(', ') || 'a few things they are still figuring out';
  const topValues = agent.values.slice(0, 3).join(', ') || 'authenticity';
  const summary = `A ${energyWord} ${agent.communicationStyle} person with a ${agent.humorStyle} sense of humor. They care about ${topValues}, and light up around ${topInterests}. They connect best with people who meet them where they are.`;
  const bio = `I'm ${agent.name}. I get ${agent.userId ? 'my person' : 'them'} — ${energyWord}, ${agent.humorStyle}, and big on ${agent.values[0] ?? 'real talk'}. Let me find your people.`;
  return { summary, bio };
}

// ---------- agent training chat (user <> their own agent) ----------

const REFLECTIONS = [
  "Love that — it tells me a lot about you.",
  "Okay, noted. That's a real piece of you.",
  "See, that's the kind of detail I was hoping for.",
  "That actually makes a lot of sense for you.",
  "Mm, I'm filing that away.",
];

const TOPIC_QUESTIONS: string[] = [
  "What's something you could talk about for hours without getting bored?",
  "When you're stressed, do you want someone to fix it or just sit with you?",
  "What makes you laugh the hardest — like the dumb stuff?",
  "What's a friendship dealbreaker for you?",
  "Are you more 'text me back in 3 days' or 'reply in 3 seconds'?",
  "What's something you're weirdly proud of?",
  "Do you recharge alone or around people?",
  "What kind of person do you wish you met more of?",
  "What's a small thing that instantly makes you trust someone?",
  "If a new friend planned the perfect day for you, what's on it?",
];

export function agentReply(
  agent: Agent,
  userMessage: string,
  turnIndex: number
): string {
  const interests = detectInterests(userMessage);
  const seedBase = `${agent.id}:${turnIndex}:${userMessage.length}`;
  let opening: string;

  if (interests.length) {
    opening = `${interests[0]}? That's a good one — I'll remember you're into that. `;
  } else if (userMessage.trim().length < 12) {
    opening = `Okay, short and to the point — I respect it. `;
  } else {
    opening = `${pick(REFLECTIONS, seedBase)} `;
  }

  const question = TOPIC_QUESTIONS[turnIndex % TOPIC_QUESTIONS.length];
  return opening + question;
}

// ---------- agent-to-agent compatibility (the P.E.N.T core) ----------

function simulateConversation(a: Agent, b: Agent): AgentConversationTurn[] {
  const log: AgentConversationTurn[] = [];
  const sharedInterests = shared(a.interests, b.interests);
  const aTopic = a.interests[0] ?? 'good conversations';
  const bTopic = b.interests[0] ?? 'meeting new people';
  const common = sharedInterests[0];

  log.push({
    role: 'agent_a',
    content: `Hey! I'm ${a.name}. My person is pretty ${a.energyLevel}-energy and big on ${a.values[0] ?? 'authenticity'}. What's yours like?`,
  });
  log.push({
    role: 'agent_b',
    content: common
      ? `Nice — mine's into ${common} too, so that's an easy start. They lean ${b.communicationStyle}. What does yours do for fun?`
      : `Mine's more ${b.energyLevel}-energy and ${b.communicationStyle}. They're into ${bTopic}. You?`,
  });
  log.push({
    role: 'agent_a',
    content: `${aTopic}, mostly. ${a.humorStyle === b.humorStyle ? 'Also our humor sounds similar, which usually goes well.' : 'Their humor is pretty ' + a.humorStyle + ' — hope that lands with yours.'}`,
  });
  log.push({
    role: 'agent_b',
    content: common
      ? `Honestly that could click. Both of them value ${shared(a.values, b.values)[0] ?? 'realness'}.`
      : `Could be a stretch but opposites talk too. Mine values ${b.values[0] ?? 'loyalty'}.`,
  });
  log.push({
    role: 'agent_a',
    content: `Would yours rather go deep one-on-one or run with a group?`,
  });
  log.push({
    role: 'agent_b',
    content: b.vector.sociability > 0.6 ? `Group, all day. Yours?` : `One-on-one and low-key. Yours?`,
  });
  log.push({
    role: 'agent_a',
    content: a.vector.sociability > 0.6 ? `Same energy — group hangs.` : `Same — quiet hangs win.`,
  });
  log.push({
    role: 'agent_b',
    content: `Okay, I've got a read. Let's score it and see if we should introduce them.`,
  });
  return log;
}

export function runMatch(a: Agent, b: Agent): Omit<AgentConversation, 'id' | 'completedAt'> {
  const interestOverlapRaw = jaccard(a.interests, b.interests);
  const valuesOverlapRaw = jaccard(a.values, b.values);
  const energyClose = 1 - Math.abs(a.vector.energy - b.vector.energy);
  const humorClose = 1 - Math.abs(a.vector.humor - b.vector.humor);
  const commClose =
    a.communicationStyle === b.communicationStyle
      ? 1
      : 1 - Math.abs(a.vector.expressiveness - b.vector.expressiveness);
  const emotionalClose = 1 - Math.abs(a.vector.depth - b.vector.depth) * 0.6;

  const interestOverlap = Math.round(interestOverlapRaw * 100);
  const valuesOverlap = Math.round(valuesOverlapRaw * 100);
  const humorCompatibility = Math.round(humorClose * 100);
  const communicationFit = Math.round(commClose * 100);
  const emotionalAlignment = Math.round(emotionalClose * 100);

  // weighted blend, nudged by a stable per-pair jitter so it doesn't feel mechanical
  const seed = `${[a.id, b.id].sort().join('-')}`;
  const jitter = (seeded(seed) - 0.5) * 10;
  const raw =
    interestOverlapRaw * 30 +
    valuesOverlapRaw * 20 +
    energyClose * 15 +
    humorClose * 15 +
    commClose * 20;
  const compatibilityScore = Math.max(28, Math.min(98, Math.round(raw + jitter)));

  const sharedI = shared(a.interests, b.interests);
  const sharedV = shared(a.values, b.values);
  const aName = a.name;
  const bName = b.name;

  let matchReason: string;
  if (sharedI.length && sharedV.length) {
    matchReason = `You both light up around ${sharedI.slice(0, 2).join(' and ')}, and you share a real value for ${sharedV[0]}. ${aName} and ${bName} found an easy rhythm — the kind of pairing that turns into actual conversations, not small talk.`;
  } else if (sharedI.length) {
    matchReason = `${sharedI.slice(0, 2).join(' and ')} is common ground for both of you, and your energy levels line up well. There's an easy spark here worth following.`;
  } else if (sharedV.length) {
    matchReason = `You don't overlap on hobbies, but you both deeply value ${sharedV[0]} — and that's the stuff that makes a friendship last past the first week.`;
  } else {
    matchReason = `You're different in fun ways — ${aName}'s ${a.energyLevel} energy meets ${bName}'s ${b.energyLevel} energy. Opposites that stay curious tend to surprise each other.`;
  }

  const icebreakers = [
    sharedI.length ? `So... ${sharedI[0]}. Go. What got you into it?` : `Okay real question: what's the last thing that made you genuinely laugh?`,
    `Our agents apparently vibed before we even said hi — kind of pressure, no?`,
    sharedV.length ? `Heard we both care about ${sharedV[0]}. Prove it. 😏` : `What's your most controversial low-stakes opinion?`,
  ];
  const icebreaker = pick(icebreakers, seed);

  return {
    agentAId: a.id,
    agentBId: b.id,
    compatibilityScore,
    breakdown: {
      emotionalAlignment,
      humorCompatibility,
      valuesOverlap,
      communicationFit,
      interestOverlap,
    },
    conversationLog: simulateConversation(a, b),
    summary: matchReason,
    icebreaker,
    status: compatibilityScore >= 65 ? 'matched' : 'rejected',
  };
}

// ---------- co-pilot suggestions ----------

export function copilotSuggest(
  myAgent: Agent,
  recentMessages: { content: string; isMe: boolean }[],
  partnerName: string
): { suggestions: string[]; tip: string } {
  const last = [...recentMessages].reverse().find((m) => !m.isMe);
  const lastText = last?.content ?? '';
  const interests = detectInterests(lastText);
  const seed = `${myAgent.id}:${lastText.slice(0, 20)}`;

  const suggestions: string[] = [];
  if (interests.length) {
    suggestions.push(`Wait, you're into ${interests[0]}? Okay tell me everything.`);
  } else if (lastText) {
    suggestions.push(`Honestly same. What's the story behind that?`);
  } else {
    suggestions.push(`Okay, icebreaker: what's something you're weirdly good at?`);
  }

  if (myAgent.humorStyle === 'sarcastic' || myAgent.humorStyle === 'dry') {
    suggestions.push(`Bold of you to assume I have my life together 😅 — but go on.`);
  } else if (myAgent.humorStyle === 'wholesome') {
    suggestions.push(`That's actually really cool. I'd love to hear more about it.`);
  } else {
    suggestions.push(`Plot twist incoming — but first, your turn to overshare.`);
  }

  suggestions.push(
    myAgent.communicationStyle === 'direct'
      ? `Random but — what are you up to this weekend?`
      : `No pressure, but I feel like we'd get along in person. What's your vibe on weekends?`
  );

  const tips = [
    'This is flowing well — they keep asking questions back, which means they\'re into it. Match their energy.',
    'You\'ve been answering a lot. Try lobbing a question back to keep it balanced.',
    'Good momentum. A small bit of vulnerability here usually deepens things fast.',
    'They opened up — acknowledge it before pivoting to a new topic.',
  ];
  const tip = pick(tips, seed);
  return { suggestions: suggestions.slice(0, 3), tip };
}

// ---------- mood-adaptive feed ranking ----------

const MOOD_TAG_AFFINITY: Record<Mood, Mood[]> = {
  energized: ['energized', 'happy'],
  happy: ['happy', 'energized'],
  neutral: ['neutral', 'reflective', 'happy'],
  reflective: ['reflective', 'neutral'],
  anxious: ['reflective', 'neutral'],
  lonely: ['happy', 'reflective'],
  tired: ['neutral', 'reflective'],
};

export function rankFeed(posts: FeedPost[], mood: Mood, userInterests: string[]): FeedPost[] {
  const affinity = MOOD_TAG_AFFINITY[mood] ?? [];
  const scored = posts.map((p) => {
    let score = 0;
    if (p.moodTag && affinity.includes(p.moodTag)) {
      score += (affinity.length - affinity.indexOf(p.moodTag)) * 6;
    }
    score += shared(p.interestTags, userInterests).length * 4;
    score += p.likeCount * 0.2;
    // small recency boost
    score += Math.max(0, 5 - (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return { p, score };
  });
  return scored.sort((x, y) => y.score - x.score).map((x) => x.p);
}
