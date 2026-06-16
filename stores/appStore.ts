import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

import {
  agentReply,
  composeTraits,
  copilotSuggest,
  detectInterests,
  generateSummary,
  rankFeed,
  runMatch,
} from '../lib/ai';
import { AnswerEffect } from '../lib/constants';
import { calculateMeaningfulConnectionsScore } from '../lib/connectionScore';
import { SEED_POSTS, SEED_USERS } from '../lib/seed';
import {
  Agent,
  AgentConversation,
  AppNotification,
  EnergyLevel,
  FeedPost,
  Match,
  Message,
  Mood,
  MoodCheckin,
  Profile,
  TrainingMessage,
} from '../lib/types';

// ----- helpers -----
let _counter = 0;
function uid(prefix = 'id'): string {
  _counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}-${_counter}`;
}
function now(): string {
  return new Date().toISOString();
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface OnboardingDraft {
  displayName: string;
  username: string;
  age: string;
  bio: string;
  agentName: string;
  answers: AnswerEffect[];
  interests: string[];
}

const emptyDraft: OnboardingDraft = {
  displayName: '',
  username: '',
  age: '',
  bio: '',
  agentName: '',
  answers: [],
  interests: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function arrayOrEmpty<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function recordOrEmpty<T>(value: unknown): Record<string, T> {
  return isRecord(value) ? (value as Record<string, T>) : {};
}

function arrayRecordOrEmpty<T>(value: unknown): Record<string, T[]> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, list]) => [key, arrayOrEmpty<T>(list)])
  );
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function sanitizeDraft(value: unknown): OnboardingDraft {
  const draft = isRecord(value) ? value : {};
  return {
    displayName: typeof draft.displayName === 'string' ? draft.displayName : '',
    username: typeof draft.username === 'string' ? draft.username : '',
    age: typeof draft.age === 'string' ? draft.age : '',
    bio: typeof draft.bio === 'string' ? draft.bio : '',
    agentName: typeof draft.agentName === 'string' ? draft.agentName : '',
    answers: arrayOrEmpty<AnswerEffect>(draft.answers),
    interests: arrayOrEmpty<string>(draft.interests),
  };
}

interface AppState {
  hydrated: boolean;
  currentUserId: string | null;

  profiles: Record<string, Profile>;
  agents: Record<string, Agent>; // keyed by agent id
  trainingMessages: Record<string, TrainingMessage[]>; // by agent id
  conversations: Record<string, AgentConversation>; // by conversation id
  matches: Record<string, Match>; // by match id
  messages: Record<string, Message[]>; // by match id
  matchReads: Record<string, string>; // `${userId}:${matchId}` -> last read ISO

  posts: FeedPost[];
  likedPosts: Record<string, true>; // `${userId}:${postId}`
  moodCheckins: MoodCheckin[];
  currentMood: Record<string, Mood>; // by user id
  notifications: AppNotification[];
  copilotUsage: Record<string, { date: string; count: number }>; // by user id

  draft: OnboardingDraft;
  pendingChatText: string | null; // co-pilot suggestion handed back to a chat input

  // setup
  setHydrated: (v: boolean) => void;
  setPendingChatText: (text: string | null) => void;
  ensureSeeded: () => void;

  // auth
  signUp: (email: string, password: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;

  // onboarding
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  createAgentFromDraft: () => void; // builds profile + agent (no matching yet)
  finishOnboarding: () => void; // marks complete + runs first matching wave

  // agent training
  addTrainingTurn: (text: string) => void;

  // matching
  runMatchingForCurrentUser: () => string[]; // returns new match ids
  startAgentChatWith: (seedUserId: string) => { matchId?: string; conversationId: string };

  // chat
  sendMessage: (matchId: string, content: string) => void;
  markMatchRead: (matchId: string) => void;

  // copilot
  consumeCopilot: () => boolean; // false if blocked by free limit
  getCopilot: (matchId: string) => { suggestions: string[]; tip: string };

  // feed / social
  setMood: (mood: Mood, note?: string) => void;
  toggleLike: (postId: string) => void;
  createPost: (content: string, moodTag: Mood | undefined, interestTags: string[]) => void;

  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // misc
  upgradePremium: () => void;
  recomputeConnectionScore: () => void;
}

type PersistedAppState = Pick<
  AppState,
  | 'currentUserId'
  | 'profiles'
  | 'agents'
  | 'trainingMessages'
  | 'conversations'
  | 'matches'
  | 'messages'
  | 'matchReads'
  | 'posts'
  | 'likedPosts'
  | 'moodCheckins'
  | 'currentMood'
  | 'notifications'
  | 'copilotUsage'
  | 'draft'
  | 'pendingChatText'
>;

const safeAsyncStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const value = await AsyncStorage.getItem(name);
      if (value == null) return null;
      JSON.parse(value);
      return value;
    } catch {
      await AsyncStorage.removeItem(name).catch(() => undefined);
      return null;
    }
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

function partializeState(state: AppState): PersistedAppState {
  return {
    currentUserId: state.currentUserId,
    profiles: state.profiles,
    agents: state.agents,
    trainingMessages: state.trainingMessages,
    conversations: state.conversations,
    matches: state.matches,
    messages: state.messages,
    matchReads: state.matchReads,
    posts: state.posts,
    likedPosts: state.likedPosts,
    moodCheckins: state.moodCheckins,
    currentMood: state.currentMood,
    notifications: state.notifications,
    copilotUsage: state.copilotUsage,
    draft: state.draft,
    pendingChatText: state.pendingChatText,
  };
}

function mergePersistedState(persistedState: unknown, currentState: AppState): AppState {
  const persisted = isRecord(persistedState) ? persistedState : {};
  const profiles = recordOrEmpty<Profile>(persisted.profiles);
  const currentUserId =
    typeof persisted.currentUserId === 'string' && profiles[persisted.currentUserId]
      ? persisted.currentUserId
      : null;

  return {
    ...currentState,
    hydrated: false,
    currentUserId,
    profiles,
    agents: recordOrEmpty<Agent>(persisted.agents),
    trainingMessages: arrayRecordOrEmpty<TrainingMessage>(persisted.trainingMessages),
    conversations: recordOrEmpty<AgentConversation>(persisted.conversations),
    matches: recordOrEmpty<Match>(persisted.matches),
    messages: arrayRecordOrEmpty<Message>(persisted.messages),
    matchReads: recordOrEmpty<string>(persisted.matchReads),
    posts: arrayOrEmpty<FeedPost>(persisted.posts),
    likedPosts: recordOrEmpty<true>(persisted.likedPosts),
    moodCheckins: arrayOrEmpty<MoodCheckin>(persisted.moodCheckins),
    currentMood: recordOrEmpty<Mood>(persisted.currentMood),
    notifications: arrayOrEmpty<AppNotification>(persisted.notifications),
    copilotUsage: recordOrEmpty<{ date: string; count: number }>(persisted.copilotUsage),
    draft: sanitizeDraft(persisted.draft),
    pendingChatText: stringOrNull(persisted.pendingChatText),
  };
}

export const useStore = create<AppState>()(
  persist<AppState, [], [], PersistedAppState>(
    (set, get) => ({
      hydrated: false,
      currentUserId: null,
      profiles: {},
      agents: {},
      trainingMessages: {},
      conversations: {},
      matches: {},
      messages: {},
      matchReads: {},
      posts: [],
      likedPosts: {},
      moodCheckins: [],
      currentMood: {},
      notifications: [],
      copilotUsage: {},
      draft: { ...emptyDraft },
      pendingChatText: null,

      setHydrated: (v) => set({ hydrated: v }),
      setPendingChatText: (text) => set({ pendingChatText: text }),

      ensureSeeded: () => {
        const state = get();
        const profiles = { ...state.profiles };
        const agents = { ...state.agents };
        let changed = false;
        for (const def of SEED_USERS) {
          if (!profiles[def.profile.id]) {
            profiles[def.profile.id] = { ...def.profile, password: 'seed' } as Profile;
            agents[def.agent.id] = def.agent;
            changed = true;
          }
        }
        let posts = state.posts;
        if (state.posts.length === 0) {
          posts = [...SEED_POSTS];
          changed = true;
        }
        if (changed) set({ profiles, agents, posts });
      },

      signUp: (email, password) => {
        const state = get();
        const exists = Object.values(state.profiles).some(
          (p) => p.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) return { ok: false, error: 'An account with that email already exists.' };
        const id = uid('user');
        const profile: Profile = {
          id,
          email,
          password,
          username: '',
          displayName: '',
          age: null,
          bio: '',
          avatarColorIndex: Math.floor(Math.random() * 8),
          isPremium: false,
          meaningfulConnectionsScore: 0,
          onboardingComplete: false,
          createdAt: now(),
        };
        set({
          profiles: { ...state.profiles, [id]: profile },
          currentUserId: id,
          draft: { ...emptyDraft },
        });
        return { ok: true };
      },

      login: (email, password) => {
        const state = get();
        const profile = Object.values(state.profiles).find(
          (p) => p.email.toLowerCase() === email.toLowerCase()
        );
        if (!profile) return { ok: false, error: 'No account found with that email.' };
        if (profile.password !== password) return { ok: false, error: 'Incorrect password.' };
        set({ currentUserId: profile.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      setDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),
      resetDraft: () => set({ draft: { ...emptyDraft } }),

      createAgentFromDraft: () => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const d = state.draft;
        const traits = composeTraits(d.answers, d.interests);

        // reuse an existing agent if the user steps back and forward
        const existing = Object.values(state.agents).find((a) => a.userId === userId);
        const agentId = existing?.id ?? uid('agent');
        const baseAgent: Agent = {
          id: agentId,
          userId,
          name: d.agentName || `${(d.displayName || 'Your').split(' ')[0]}'s Agent`,
          personalitySummary: '',
          agentBio: '',
          humorStyle: traits.humorStyle,
          communicationStyle: traits.communicationStyle,
          energyLevel: traits.energyLevel as EnergyLevel,
          values: traits.values,
          interests: d.interests,
          emotionalState: 'neutral',
          vector: traits.vector,
          trainingTurns: existing?.trainingTurns ?? 0,
          isActive: true,
        };
        const gen = generateSummary(baseAgent, '');
        baseAgent.personalitySummary = gen.summary;
        baseAgent.agentBio = gen.bio;

        const profile: Profile = {
          ...state.profiles[userId],
          displayName: d.displayName,
          username: d.username || d.displayName.toLowerCase().replace(/\s+/g, '_'),
          age: d.age ? parseInt(d.age, 10) : null,
          bio: d.bio,
        };

        set({
          profiles: { ...state.profiles, [userId]: profile },
          agents: { ...state.agents, [agentId]: baseAgent },
          trainingMessages: {
            ...state.trainingMessages,
            [agentId]: state.trainingMessages[agentId] ?? [],
          },
        });
      },

      finishOnboarding: () => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        set({
          profiles: {
            ...state.profiles,
            [userId]: { ...state.profiles[userId], onboardingComplete: true },
          },
          draft: { ...emptyDraft },
        });
        // first wave of matches so the new user lands in an active app
        get().runMatchingForCurrentUser();
        get().recomputeConnectionScore();
      },

      addTrainingTurn: (text) => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const agent = Object.values(state.agents).find((a) => a.userId === userId);
        if (!agent) return;
        const history = state.trainingMessages[agent.id] ?? [];
        const turnIndex = agent.trainingTurns;

        const userMsg: TrainingMessage = {
          id: uid('tm'),
          agentId: agent.id,
          role: 'user',
          content: text,
          createdAt: now(),
        };
        const replyText = agentReply(agent, text, turnIndex);
        const botMsg: TrainingMessage = {
          id: uid('tm'),
          agentId: agent.id,
          role: 'assistant',
          content: replyText,
          createdAt: now(),
        };

        // learn interests mentioned in the message
        const detected = detectInterests(text);
        const mergedInterests = [...agent.interests];
        detected.forEach((i) => {
          if (!mergedInterests.some((x) => x.toLowerCase() === i.toLowerCase())) mergedInterests.push(i);
        });

        const newTurns = turnIndex + 1;
        let updatedAgent: Agent = { ...agent, interests: mergedInterests, trainingTurns: newTurns };
        // refresh the generated summary every 5 turns, like the spec's edge function
        if (newTurns % 5 === 0) {
          const gen = generateSummary(updatedAgent, text);
          updatedAgent = { ...updatedAgent, personalitySummary: gen.summary, agentBio: gen.bio };
        }

        set({
          agents: { ...state.agents, [agent.id]: updatedAgent },
          trainingMessages: {
            ...state.trainingMessages,
            [agent.id]: [...history, userMsg, botMsg],
          },
        });
      },

      runMatchingForCurrentUser: () => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return [];
        const myAgent = Object.values(state.agents).find((a) => a.userId === userId);
        if (!myAgent) return [];

        const conversations = { ...state.conversations };
        const matches = { ...state.matches };
        const notifications = [...state.notifications];
        const newMatchIds: string[] = [];

        for (const def of SEED_USERS) {
          const seedAgent = state.agents[def.agent.id];
          if (!seedAgent) continue;
          // skip if we already evaluated this pair
          const already = Object.values(conversations).some(
            (c) =>
              (c.agentAId === myAgent.id && c.agentBId === seedAgent.id) ||
              (c.agentAId === seedAgent.id && c.agentBId === myAgent.id)
          );
          if (already) continue;

          const result = runMatch(myAgent, seedAgent);
          const convId = uid('conv');
          const conversation: AgentConversation = { ...result, id: convId, completedAt: now() };
          conversations[convId] = conversation;

          if (result.status === 'matched') {
            const matchId = uid('match');
            matches[matchId] = {
              id: matchId,
              userAId: userId,
              userBId: def.profile.id,
              agentConversationId: convId,
              compatibilityScore: result.compatibilityScore,
              matchReason: result.summary,
              icebreaker: result.icebreaker,
              createdAt: now(),
            };
            newMatchIds.push(matchId);
            notifications.unshift({
              id: uid('notif'),
              userId,
              type: 'new_match',
              title: `${myAgent.name} found you a match! 🎉`,
              body: `${result.compatibilityScore}% with ${def.profile.displayName}. ${result.summary}`,
              data: { matchId, icebreaker: result.icebreaker },
              isRead: false,
              createdAt: now(),
            });
          }
        }

        set({ conversations, matches, notifications });
        get().recomputeConnectionScore();
        return newMatchIds;
      },

      startAgentChatWith: (seedUserId) => {
        const state = get();
        const userId = state.currentUserId!;
        const myAgent = Object.values(state.agents).find((a) => a.userId === userId)!;
        const seedAgent = Object.values(state.agents).find((a) => a.userId === seedUserId)!;

        // reuse an existing evaluation if present
        const existing = Object.values(state.conversations).find(
          (c) =>
            (c.agentAId === myAgent.id && c.agentBId === seedAgent.id) ||
            (c.agentAId === seedAgent.id && c.agentBId === myAgent.id)
        );
        let conversation = existing;
        const conversations = { ...state.conversations };
        const matches = { ...state.matches };
        const notifications = [...state.notifications];

        if (!conversation) {
          const result = runMatch(myAgent, seedAgent);
          const convId = uid('conv');
          conversation = { ...result, id: convId, completedAt: now() };
          conversations[convId] = conversation;
        }

        let matchId: string | undefined;
        const existingMatch = Object.values(matches).find(
          (m) =>
            (m.userAId === userId && m.userBId === seedUserId) ||
            (m.userAId === seedUserId && m.userBId === userId)
        );
        if (existingMatch) {
          matchId = existingMatch.id;
        } else if (conversation.status === 'matched') {
          matchId = uid('match');
          matches[matchId] = {
            id: matchId,
            userAId: userId,
            userBId: seedUserId,
            agentConversationId: conversation.id,
            compatibilityScore: conversation.compatibilityScore,
            matchReason: conversation.summary,
            icebreaker: conversation.icebreaker,
            createdAt: now(),
          };
          notifications.unshift({
            id: uid('notif'),
            userId,
            type: 'new_match',
            title: `It's a match! 🎉`,
            body: `${conversation.compatibilityScore}% compatible. ${conversation.summary}`,
            data: { matchId },
            isRead: false,
            createdAt: now(),
          });
        }

        set({ conversations, matches, notifications });
        get().recomputeConnectionScore();
        return { matchId, conversationId: conversation.id };
      },

      sendMessage: (matchId, content) => {
        const state = get();
        const userId = state.currentUserId!;
        const match = state.matches[matchId];
        if (!match) return;
        const list = state.messages[matchId] ?? [];
        const mine: Message = {
          id: uid('msg'),
          matchId,
          senderId: userId,
          content,
          createdAt: now(),
        };
        const updated = [...list, mine];
        set({ messages: { ...state.messages, [matchId]: updated } });
        get().recomputeConnectionScore();

        // partner (seed) auto-replies shortly after, to keep the chat alive
        const partnerId = match.userAId === userId ? match.userBId : match.userAId;
        const partnerProfile = state.profiles[partnerId];
        if (partnerProfile?.isSeed) {
          const partnerAgent = Object.values(state.agents).find((a) => a.userId === partnerId);
          const reply = partnerAutoReply(content, partnerProfile.displayName, partnerAgent);
          setTimeout(() => {
            const st = get();
            const cur = st.messages[matchId] ?? [];
            const botMsg: Message = {
              id: uid('msg'),
              matchId,
              senderId: partnerId,
              content: reply,
              createdAt: now(),
            };
            st.notifications.unshift?.({
              id: uid('notif'),
              userId,
              type: 'new_message',
              title: `${partnerProfile.displayName} replied`,
              body: reply,
              data: { matchId },
              isRead: false,
              createdAt: now(),
            });
            set({
              messages: { ...st.messages, [matchId]: [...cur, botMsg] },
              notifications: [...st.notifications],
            });
          }, 1400);
        }
      },

      markMatchRead: (matchId) => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        set({ matchReads: { ...state.matchReads, [`${userId}:${matchId}`]: now() } });
      },

      consumeCopilot: () => {
        const state = get();
        const userId = state.currentUserId!;
        const profile = state.profiles[userId];
        if (profile.isPremium) return true;
        const usage = state.copilotUsage[userId];
        const count = usage && usage.date === today() ? usage.count : 0;
        if (count >= 3) return false;
        set({
          copilotUsage: { ...state.copilotUsage, [userId]: { date: today(), count: count + 1 } },
        });
        return true;
      },

      getCopilot: (matchId) => {
        const state = get();
        const userId = state.currentUserId!;
        const myAgent = Object.values(state.agents).find((a) => a.userId === userId)!;
        const match = state.matches[matchId];
        const list = state.messages[matchId] ?? [];
        const recent = list.slice(-6).map((m) => ({ content: m.content, isMe: m.senderId === userId }));
        const partnerId = match.userAId === userId ? match.userBId : match.userAId;
        const partnerName = state.profiles[partnerId]?.displayName ?? 'them';
        return copilotSuggest(myAgent, recent, partnerName);
      },

      setMood: (mood, note) => {
        const state = get();
        const userId = state.currentUserId!;
        const checkin: MoodCheckin = {
          id: uid('mood'),
          userId,
          mood,
          note,
          createdAt: now(),
        };
        set({
          moodCheckins: [checkin, ...state.moodCheckins],
          currentMood: { ...state.currentMood, [userId]: mood },
        });
      },

      toggleLike: (postId) => {
        const state = get();
        const userId = state.currentUserId!;
        const key = `${userId}:${postId}`;
        const liked = { ...state.likedPosts };
        const posts = state.posts.map((p) => {
          if (p.id !== postId) return p;
          if (liked[key]) {
            delete liked[key];
            return { ...p, likeCount: Math.max(0, p.likeCount - 1) };
          }
          liked[key] = true;
          return { ...p, likeCount: p.likeCount + 1 };
        });
        set({ posts, likedPosts: liked });
      },

      createPost: (content, moodTag, interestTags) => {
        const state = get();
        const userId = state.currentUserId!;
        const post: FeedPost = {
          id: uid('post'),
          userId,
          content,
          moodTag,
          interestTags,
          likeCount: 0,
          createdAt: now(),
        };
        set({ posts: [post, ...state.posts] });
      },

      markNotificationRead: (id) => {
        const state = get();
        set({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        });
      },

      markAllNotificationsRead: () => {
        const state = get();
        const userId = state.currentUserId;
        set({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, isRead: true } : n
          ),
        });
      },

      upgradePremium: () => {
        const state = get();
        const userId = state.currentUserId!;
        set({
          profiles: {
            ...state.profiles,
            [userId]: { ...state.profiles[userId], isPremium: true },
          },
        });
      },

      recomputeConnectionScore: () => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const myMatches = Object.values(state.matches).filter(
          (m) => m.userAId === userId || m.userBId === userId
        );
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let totalMessages = 0;
        let activeConversations = 0;
        let longestDays = 0;
        for (const m of myMatches) {
          const msgs = state.messages[m.id] ?? [];
          totalMessages += msgs.length;
          const recent = msgs.some((x) => new Date(x.createdAt).getTime() > weekAgo);
          if (recent) activeConversations++;
          if (msgs.length) {
            const first = new Date(msgs[0].createdAt).getTime();
            const last = new Date(msgs[msgs.length - 1].createdAt).getTime();
            longestDays = Math.max(longestDays, (last - first) / (1000 * 60 * 60 * 24));
          }
        }
        const avg =
          myMatches.length > 0
            ? myMatches.reduce((a, m) => a + m.compatibilityScore, 0) / myMatches.length
            : 0;
        const breakdown = calculateMeaningfulConnectionsScore({
          totalMatches: myMatches.length,
          activeConversations,
          avgCompatibilityScore: avg,
          longestConversationDays: longestDays,
          totalMessages,
        });
        set({
          profiles: {
            ...state.profiles,
            [userId]: { ...state.profiles[userId], meaningfulConnectionsScore: breakdown.total },
          },
        });
      },
    }),
    {
      name: 'impulse-store-v2',
      version: 2,
      storage: createJSONStorage<PersistedAppState>(() => safeAsyncStorage),
      partialize: partializeState,
      migrate: (persistedState) => persistedState as PersistedAppState,
      merge: mergePersistedState,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHydrated(true);
        state.ensureSeeded();
      },
    }
  )
);

function partnerAutoReply(userText: string, partnerName: string, agent?: Agent): string {
  const interests = detectInterests(userText);
  const lower = userText.toLowerCase();
  if (lower.includes('?')) {
    return agent?.communicationStyle === 'minimal'
      ? 'good question. honestly depends on the day lol'
      : `ooh good question. honestly? probably yes. but tell me yours first 😄`;
  }
  if (interests.length) {
    return `wait you're into ${interests[0]} too?? okay we're going to get along.`;
  }
  if (lower.length < 8) {
    return 'haha okay say more, you can\'t leave me hanging like that';
  }
  const generic = [
    'okay that\'s actually really relatable',
    'see this is why our agents matched lol',
    'i feel that. what are you up to this weekend?',
    'honestly same energy. tell me more',
  ];
  return generic[userText.length % generic.length];
}

// ----- selector hooks -----
export function useCurrentProfile(): Profile | null {
  return useStore((s) => (s.currentUserId ? s.profiles[s.currentUserId] ?? null : null));
}
export function useMyAgent(): Agent | null {
  return useStore((s) => {
    if (!s.currentUserId) return null;
    return Object.values(s.agents).find((a) => a.userId === s.currentUserId) ?? null;
  });
}
