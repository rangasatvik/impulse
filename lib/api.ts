import { copilotSuggest, rankFeed, runMatch } from './ai';
import { Mood } from './types';
import { useStore } from '../stores/appStore';

export async function callAgentChat(agentId: string, userMessage: string, userId: string) {
  const store = useStore.getState();
  const agent = store.agents[agentId];
  if (!agent || agent.userId !== userId) {
    throw new Error('Agent not found for this user.');
  }

  const before = store.trainingMessages[agentId]?.length ?? 0;
  store.addTrainingTurn(userMessage);
  const nextStore = useStore.getState();
  const messages = nextStore.trainingMessages[agentId] ?? [];
  const reply = messages.slice(before).find((message) => message.role === 'assistant');
  const updatedAgent = nextStore.agents[agentId];

  return {
    reply: reply?.content ?? '',
    trainingTurns: updatedAgent?.trainingTurns ?? agent.trainingTurns,
  };
}

export async function runAgentMatch(agentAId: string, agentBId: string) {
  const { agents } = useStore.getState();
  const agentA = agents[agentAId];
  const agentB = agents[agentBId];
  if (!agentA || !agentB) {
    throw new Error('Both agents are required to run a match.');
  }

  return runMatch(agentA, agentB);
}

export async function getCopilotSuggestions(
  matchId: string,
  userId: string,
  recentMessages: { content: string; isMe: boolean }[]
) {
  const { agents, matches, profiles } = useStore.getState();
  const match = matches[matchId];
  const myAgent = Object.values(agents).find((agent) => agent.userId === userId);
  if (!match || !myAgent) {
    throw new Error('Match and agent are required for Co-Pilot suggestions.');
  }

  const partnerId = match.userAId === userId ? match.userBId : match.userAId;
  const partnerName = profiles[partnerId]?.displayName ?? 'them';
  return copilotSuggest(myAgent, recentMessages, partnerName);
}

export async function getMoodFeed(userId: string, mood: Mood) {
  const { agents, posts } = useStore.getState();
  const myAgent = Object.values(agents).find((agent) => agent.userId === userId);
  const candidatePosts = posts.filter((post) => post.userId !== userId);
  return {
    posts: rankFeed(candidatePosts, mood, myAgent?.interests ?? []),
  };
}
