import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  CommunityCard,
  EventCard,
  SafetyNotice,
  ScreenContainer,
  SectionHeader,
  SparkCard,
  TraitChip,
} from '../../components/aurora';
import { CompatibilityRing } from '../../components/CompatibilityRing';
import { useToast } from '../../components/Toast';
import { EmptyState, GradientButton } from '../../components/ui';
import { runMatch } from '../../lib/ai';
import { COMMUNITIES, EVENTS } from '../../lib/productData';
import { usePermissions } from '../../lib/permissions';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useMyAgent, useStore } from '../../stores/appStore';

const FILTERS = ['Friends', 'Study', 'Events', 'Mentors', 'Nearby', 'High compatibility', 'New to campus'];

export default function Discover() {
  const router = useRouter();
  const toast = useToast();
  const myAgent = useMyAgent();
  const permissions = usePermissions();
  const profiles = useStore((st) => st.profiles);
  const agents = useStore((st) => st.agents);
  const conversations = useStore((st) => st.conversations);
  const startAgentChatWith = useStore((st) => st.startAgentChatWith);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTERS[0]);

  const candidates = useMemo(() => {
    if (!myAgent) return [];
    const normalized = query.trim().toLowerCase();
    return Object.values(profiles)
      .filter((profile) => profile.isSeed)
      .map((profile) => {
        const agent = Object.values(agents).find((item) => item.userId === profile.id);
        if (!agent) return null;
        const preview = runMatch(myAgent, agent);
        const sharedInterests = agent.interests.filter((interest) =>
          myAgent.interests.some((mine) => mine.toLowerCase() === interest.toLowerCase())
        );
        const haystack = `${profile.displayName} ${profile.bio} ${agent.interests.join(' ')} ${agent.values.join(' ')}`.toLowerCase();
        if (normalized && !haystack.includes(normalized)) return null;
        return {
          profile,
          agent,
          preview,
          reasons: [
            sharedInterests[0] ? `${sharedInterests[0]} overlap` : 'Shared curiosity',
            preview.breakdown.humorCompatibility > 75 ? 'Humor fit' : 'Conversation fit',
            preview.breakdown.emotionalAlignment > 75 ? 'Same social pace' : 'Balanced energy',
            preview.breakdown.valuesOverlap > 70 ? 'Values alignment' : 'Low-pressure intro',
          ],
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.preview.compatibilityScore - a!.preview.compatibilityScore);
  }, [agents, myAgent, profiles, query]);

  const activity = useMemo(() => {
    if (!myAgent) return [];
    return Object.values(conversations)
      .filter((conversation) => conversation.agentAId === myAgent.id || conversation.agentBId === myAgent.id)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 3);
  }, [conversations, myAgent]);

  const startConversation = (seedUserId: string) => {
    const { conversationId } = startAgentChatWith(seedUserId);
    router.push(`/agent/conversation/${conversationId}`);
  };

  const openPremium = () => {
    toast('Premium preview: more detailed spark explanations and unlimited discovery.', 'info');
    router.push('/premium');
  };

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="DISCOVER"
        title="Curated sparks, communities, and events"
        subtitle={`${myAgent?.name ?? 'Your agent'} explains why each suggestion could start naturally.`}
      />

      <View style={[s.card, { padding: spacing.md, marginBottom: spacing.lg }]}>
        <View style={[s.row, { minHeight: 48 }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Find people, communities, events"
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, color: colors.textPrimary, fontSize: 15, minHeight: 44 }}
          />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm }}>
          {FILTERS.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              onPress={() => setFilter(item)}
              style={{
                minHeight: 36,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: filter === item ? colors.primary : colors.surfaceElevated,
                borderWidth: 1,
                borderColor: filter === item ? colors.primary : colors.border,
              }}
            >
              <Text style={{ color: filter === item ? '#fff' : colors.textPrimary, fontSize: 12, fontWeight: '900' }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SectionHeader eyebrow="TODAY'S SPARKS" title="3-5 high-quality starts" />
      {candidates.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="No strong sparks yet"
          subtitle={`${myAgent?.name ?? 'Your agent'} is still learning your vibe. Train it a bit more to improve recommendations.`}
          action={<GradientButton title="Train my agent" icon="sparkles" onPress={() => router.push('/agent/training')} />}
        />
      ) : (
        candidates.slice(0, 5).map((candidate, index) => {
          if (!candidate) return null;
          const locked = !permissions.canViewDiscoveryCard(index);
          if (locked) {
            return <LockedSpark key={candidate.profile.id} score={candidate.preview.compatibilityScore} onPress={openPremium} />;
          }
          return (
            <SparkCard
              key={candidate.profile.id}
              profile={candidate.profile}
              agent={candidate.agent}
              score={candidate.preview.compatibilityScore}
              reasons={candidate.reasons}
              onPress={() => startConversation(candidate.profile.id)}
              onWarmIntro={() => startConversation(candidate.profile.id)}
              onPass={() => toast('Noted. Your agent will look for a different energy.', 'info')}
            />
          );
        })
      )}

      <SectionHeader
        eyebrow="COMMUNITIES"
        title="Low-pressure groups"
        subtitle="Join around shared context, not cold introductions."
      />
      {COMMUNITIES.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          onPress={() => toast(`${myAgent?.name ?? 'Your agent'} saved ${community.title} as a community lead.`, 'success')}
        />
      ))}

      <SectionHeader
        eyebrow="EVENTS"
        title="Social opportunities"
        subtitle="Your agent can help you walk in with an opener."
      />
      {EVENTS.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onPress={() => toast('Event saved. Your agent will suggest a warm intro.', 'success')}
        />
      ))}

      <SectionHeader eyebrow="AGENT ACTIVITY" title="Compatibility checks" />
      {activity.length === 0 ? (
        <View style={[s.card, { marginBottom: spacing.lg }]}>
          <Text style={s.h3}>No agent conversations yet</Text>
          <Text style={[s.body, { marginTop: 6 }]}>
            Start a spark above to see the agent-to-agent conversation and compatibility breakdown.
          </Text>
        </View>
      ) : (
        activity.map((conversation) => (
          <Pressable
            key={conversation.id}
            accessibilityRole="button"
            onPress={() => router.push(`/agent/conversation/${conversation.id}`)}
            style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }]}
          >
            <CompatibilityRing score={conversation.compatibilityScore} size={52} strokeWidth={5} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={s.bodyStrong}>{conversation.status === 'matched' ? 'Strong spark found' : 'Compatibility check'}</Text>
              <Text style={[s.label, { marginTop: 3 }]} numberOfLines={2}>{conversation.summary}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <View style={{ marginTop: spacing.lg }}>
        <SafetyNotice />
      </View>
    </ScreenContainer>
  );
}

function LockedSpark({ score, onPress }: { score: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.cardElevated, { marginBottom: spacing.md, minHeight: 150 }]}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <TraitChip label="Premium preview" icon="lock-closed" color={colors.premium} />
          <Text style={[s.h3, { marginTop: spacing.md }]}>A strong spark is waiting</Text>
          <Text style={[s.body, { marginTop: 5 }]}>Unlock deeper agent explanations and unlimited discovery when you are ready.</Text>
        </View>
        <CompatibilityRing score={score} size={58} strokeWidth={6} />
      </View>
    </Pressable>
  );
}
