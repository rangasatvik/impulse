export interface ConnectionScoreInput {
  totalMatches: number;
  activeConversations: number; // matches with messages in the last 7 days
  avgCompatibilityScore: number;
  longestConversationDays: number;
  totalMessages: number;
}

export interface ConnectionScoreBreakdown {
  matchDepth: number;
  activityScore: number;
  qualityScore: number;
  longevityScore: number;
  engagementScore: number;
  total: number;
}

export function calculateMeaningfulConnectionsScore(
  data: ConnectionScoreInput
): ConnectionScoreBreakdown {
  const matchDepth = Math.min(data.totalMatches * 5, 30);
  const activityScore = Math.min(data.activeConversations * 10, 30);
  const qualityScore = (data.avgCompatibilityScore / 100) * 20;
  const longevityScore = Math.min(data.longestConversationDays * 2, 15);
  const engagementScore = Math.min(Math.log(data.totalMessages + 1) * 3, 5);
  return {
    matchDepth: Math.round(matchDepth),
    activityScore: Math.round(activityScore),
    qualityScore: Math.round(qualityScore),
    longevityScore: Math.round(longevityScore),
    engagementScore: Math.round(engagementScore),
    total: Math.round(
      matchDepth + activityScore + qualityScore + longevityScore + engagementScore
    ),
  };
}
