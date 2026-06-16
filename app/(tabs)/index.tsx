import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AgentStatusCard,
  EventCard,
  IconButton,
  MoodChip,
  SafetyNotice,
  ScreenContainer,
  SectionHeader,
  SparkCard,
  TraitChip,
} from '../../components/aurora';
import { useToast } from '../../components/Toast';
import { Avatar, EmptyState, GradientButton } from '../../components/ui';
import { runMatch } from '../../lib/ai';
import { calculateMeaningfulConnectionsScore } from '../../lib/connectionScore';
import { moodMeta } from '../../lib/constants';
import { EVENTS, SOCIAL_MOVES, SPARK_FACTORS } from '../../lib/productData';
import { colors, gradients, radius, s, shadow, spacing } from '../../lib/theme';
import { Match } from '../../lib/types';
import { useCurrentProfile, useMyAgent, useStore } from '../../stores/appStore';

export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const profile = useCurrentProfile();
  const agent = useMyAgent();
  const profiles = useStore((st) => st.profiles);
  const agents = useStore((st) => st.agents);
  const matches = useStore((st) => st.matches);
  const messages = useStore((st) => st.messages);
  const currentMood = useStore((st) => (st.currentUserId ? st.currentMood[st.currentUserId] : undefined));
  const notifications = useStore((st) => st.notifications);
  const runMatchingForCurrentUser = useStore((st) => st.runMatchingForCurrentUser);
  const startAgentChatWith = useStore((st) => st.startAgentChatWith);

  const mood = moodMeta(currentMood);
  const myMatches = useMemo(
    () =>
      Object.values(matches)
        .filter((match) => match.userAId === profile?.id || match.userBId === profile?.id)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore),
    [matches, profile?.id]
  );

  const connection = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let totalMessages = 0;
    let activeConversations = 0;
    let longestConversationDays = 0;

    for (const match of myMatches) {
      const list = messages[match.id] ?? [];
      totalMessages += list.length;
      if (list.some((message) => new Date(message.createdAt).getTime() > weekAgo)) activeConversations++;
      if (list.length) {
        const first = new Date(list[0].createdAt).getTime();
        const last = new Date(list[list.length - 1].createdAt).getTime();
        longestConversationDays = Math.max(longestConversationDays, (last - first) / 86400000);
      }
    }

    const avgCompatibility = myMatches.length
      ? myMatches.reduce((sum, match) => sum + match.compatibilityScore, 0) / myMatches.length
      : 0;

    return calculateMeaningfulConnectionsScore({
      totalMatches: myMatches.length,
      activeConversations,
      avgCompatibilityScore: avgCompatibility,
      longestConversationDays,
      totalMessages,
    });
  }, [messages, myMatches]);

  const candidateQueue = useMemo(() => {
    if (!agent) return [];
    return Object.values(profiles)
      .filter((profileItem) => profileItem.isSeed)
      .map((candidate) => {
        const candidateAgent = Object.values(agents).find((item) => item.userId === candidate.id);
        if (!candidateAgent) return null;
        const preview = runMatch(agent, candidateAgent);
        const reasons = [
          'Humor fit',
          preview.breakdown.communicationFit > 70 ? 'Easy conversation' : 'Shared pace',
          preview.breakdown.valuesOverlap > 70 ? 'Shared values' : 'Interest overlap',
          candidateAgent.energyLevel === agent.energyLevel ? 'Same energy' : 'Balanced energy',
        ];
        return { candidate, candidateAgent, preview, reasons };
      })
      .filter(Boolean)
      .sort((a, b) => b!.preview.compatibilityScore - a!.preview.compatibilityScore)
      .slice(0, 3);
  }, [agent, agents, profiles]);

  const unreadNotifications = notifications.filter((item) => item.userId === profile?.id && !item.isRead).length;
  const topMatch = myMatches[0];
  const topPartner = topMatch ? getPartner(topMatch, profile?.id, profiles) : undefined;
  const topPartnerAgent = topPartner ? Object.values(agents).find((item) => item.userId === topPartner.id) : undefined;
  const topCandidate = candidateQueue[0];

  const runSweep = () => {
    const ids = runMatchingForCurrentUser();
    toast(ids.length ? `${ids.length} strong spark${ids.length === 1 ? '' : 's'} added.` : `${agent?.name ?? 'Your agent'} is already caught up.`, 'info');
  };

  const openTopSpark = () => {
    if (topMatch) {
      router.push(`/match/${topMatch.id}`);
      return;
    }
    if (topCandidate) {
      const { conversationId } = startAgentChatWith(topCandidate.candidate.id);
      router.push(`/agent/conversation/${conversationId}`);
      return;
    }
    router.push('/(tabs)/discover');
  };

  const displaySpark = topMatch && topPartner && topPartnerAgent
    ? {
        profile: topPartner,
        agent: topPartnerAgent,
        score: topMatch.compatibilityScore,
        reasons: ['Shared interests', 'Warm intro', 'Low pressure', 'Agent-approved'],
      }
    : topCandidate
      ? {
          profile: topCandidate.candidate,
          agent: topCandidate.candidateAgent,
          score: topCandidate.preview.compatibilityScore,
          reasons: topCandidate.reasons,
        }
      : null;

  return (
    <ScreenContainer>
      <View style={[s.row, { justifyContent: 'space-between', marginBottom: spacing.lg }]}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={s.label}>TODAY'S IMPULSE</Text>
          <Text style={s.h1}>Hey, {profile?.displayName?.split(' ')[0] || 'there'}</Text>
          <Text style={[s.body, { marginTop: 4 }]}>AI that understands you. Connections that matter.</Text>
        </View>
        <View style={s.row}>
          <IconButton
            icon="notifications-outline"
            label={`${unreadNotifications} notifications`}
            onPress={() => router.push('/(tabs)/notifications')}
            color={unreadNotifications ? colors.primary : colors.textPrimary}
          />
          <View style={{ marginLeft: spacing.sm }}>
            <Avatar name={profile?.displayName || 'You'} colorIndex={profile?.avatarColorIndex ?? 0} size={48} active />
          </View>
        </View>
      </View>

      <LinearGradient colors={gradients.hero} style={{ borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.floating }}>
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>YOUR SOCIAL PULSE</Text>
            <Text style={{ color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 8 }}>
              {agent?.name ?? 'Your agent'} found {candidateQueue.length || myMatches.length || 1} meaningful spark{candidateQueue.length === 1 ? '' : 's'} today.
            </Text>
            <Text style={{ color: colors.blush, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }}>
              Current mood: {currentMood ? `${mood.emoji} ${mood.label}` : 'not checked in yet'}. Private memories stay private.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <PulseMetric label="Connection Health" value={`${connection.total}`} />
          <PulseMetric label="Training Turns" value={`${agent?.trainingTurns ?? 0}`} />
          <PulseMetric label="Matches" value={`${myMatches.length}`} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={runSweep}
          style={{
            minHeight: 46,
            marginTop: spacing.lg,
            borderRadius: radius.pill,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Ionicons name="scan-circle" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '900' }}>Review today’s sparks</Text>
        </Pressable>
      </LinearGradient>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
        <MoodChip emoji={currentMood ? mood.emoji : '✨'} label={currentMood ? mood.label : 'Check in'} active={!!currentMood} onPress={() => router.push('/modal/mood-check')} />
        {SPARK_FACTORS.map((factor) => (
          <TraitChip key={factor.label} label={factor.label} color={factor.color} />
        ))}
      </View>

      <SectionHeader eyebrow="TOP SPARK" title="A person worth starting with" subtitle="Curated, not endless. Your agent explains every recommendation." />
      {displaySpark ? (
        <SparkCard
          profile={displaySpark.profile}
          agent={displaySpark.agent}
          score={displaySpark.score}
          reasons={displaySpark.reasons}
          onPress={openTopSpark}
          onWarmIntro={openTopSpark}
          onPass={() => toast('Got it. Your agent will tune future sparks.', 'info')}
        />
      ) : (
        <EmptyState
          emoji="✨"
          title="Your agent is still learning"
          subtitle="Train it a little more and it will surface better sparks."
          action={<GradientButton title="Train my agent" icon="sparkles" onPress={() => router.push('/agent/training')} />}
        />
      )}

      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <AgentStatusCard
          agent={agent}
          title={`${agent?.name ?? 'Your agent'} learned today`}
          detail="You prefer funny, low-pressure openers over formal intros. This is used for recommendations, not shown to matches."
          action="Edit"
          onPress={() => router.push('/(tabs)/agent')}
        />
      </View>

      <SectionHeader eyebrow="LOW-PRESSURE MOVE" title="One small social action" />
      <View style={[s.cardElevated, { marginBottom: spacing.lg }]}>
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.accent + '18', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
            <Ionicons name="leaf" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h3}>{SOCIAL_MOVES[(agent?.trainingTurns ?? 0) % SOCIAL_MOVES.length]}</Text>
            <Text style={[s.body, { marginTop: 5 }]}>A tiny move counts. Impulse is built for natural momentum, not pressure.</Text>
          </View>
        </View>
      </View>

      <SectionHeader eyebrow="CAMPUS OPPORTUNITY" title="Join with your agent" subtitle="Your agent can help you walk in with context." />
      <EventCard event={EVENTS[0]} onPress={() => toast('Your agent saved this event as a warm intro opportunity.', 'success')} />

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <SafetyNotice />
      </View>
    </ScreenContainer>
  );
}

function PulseMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderRadius: radius.lg, padding: spacing.md, backgroundColor: '#FFFFFF24', borderWidth: 1, borderColor: '#FFFFFF30' }}>
      <Text style={{ color: '#fff', fontSize: 25, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: colors.blush, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{label}</Text>
    </View>
  );
}

function getPartner(match: Match, currentUserId: string | undefined, profiles: ReturnType<typeof useStore.getState>['profiles']) {
  const partnerId = match.userAId === currentUserId ? match.userBId : match.userAId;
  return profiles[partnerId];
}
