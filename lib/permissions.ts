import { useCurrentProfile, useStore } from '../stores/appStore';

export const FREE_LIMITS = {
  discoveryCardsPerDay: 5,
  copilotUsesPerDay: 3,
  compatibilityFactors: 3,
  agentConversationLogs: 1,
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function usePermissions() {
  const profile = useCurrentProfile();
  const copilotUsage = useStore((st) => st.copilotUsage);
  const isPremium = Boolean(profile?.isPremium);
  const usage = profile ? copilotUsage[profile.id] : undefined;
  const copilotUsedToday = usage?.date === today() ? usage.count : 0;
  const copilotRemaining = isPremium
    ? Number.POSITIVE_INFINITY
    : Math.max(0, FREE_LIMITS.copilotUsesPerDay - copilotUsedToday);

  return {
    isPremium,
    discoveryCardsVisible: isPremium
      ? Number.POSITIVE_INFINITY
      : FREE_LIMITS.discoveryCardsPerDay,
    copilotRemaining,
    copilotUsedToday,
    canUseCopilot: isPremium || copilotRemaining > 0,
    compatibilityFactorsVisible: isPremium
      ? Number.POSITIVE_INFINITY
      : FREE_LIMITS.compatibilityFactors,
    agentConversationLogsVisible: isPremium
      ? Number.POSITIVE_INFINITY
      : FREE_LIMITS.agentConversationLogs,
    canViewDiscoveryCard: (index: number) =>
      isPremium || index < FREE_LIMITS.discoveryCardsPerDay,
  };
}
