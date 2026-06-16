import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AgentConversationViewer } from '../../../components/AgentConversationViewer';
import { CompatibilityRing } from '../../../components/CompatibilityRing';
import { GradientButton } from '../../../components/ui';
import { colors, compatibilityColor, radius, s, spacing } from '../../../lib/theme';
import { useCurrentProfile, useStore } from '../../../stores/appStore';

export default function ConversationView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useCurrentProfile();

  const conversation = useStore((st) => (id ? st.conversations[id] : undefined));
  const agents = useStore((st) => st.agents);
  const profiles = useStore((st) => st.profiles);
  const matches = useStore((st) => st.matches);

  const matchId = useMemo(() => {
    if (!conversation) return undefined;
    return Object.values(matches).find((m) => m.agentConversationId === conversation.id)?.id;
  }, [matches, conversation]);

  if (!conversation) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.body}>Conversation not found.</Text>
      </View>
    );
  }

  const agentA = agents[conversation.agentAId];
  const agentB = agents[conversation.agentBId];
  const nameFor = (aid: string) => {
    const a = agents[aid];
    return a?.name ?? 'Agent';
  };

  const factors = [
    { label: 'Emotional alignment', value: conversation.breakdown.emotionalAlignment },
    { label: 'Humor compatibility', value: conversation.breakdown.humorCompatibility },
    { label: 'Values overlap', value: conversation.breakdown.valuesOverlap },
    { label: 'Communication fit', value: conversation.breakdown.communicationFit },
    { label: 'Interest overlap', value: conversation.breakdown.interestOverlap },
  ].sort((a, b) => b.value - a.value);

  const visibleFactors = profile?.isPremium ? factors : factors.slice(0, 3);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm }}>
        <CompatibilityRing score={conversation.compatibilityScore} size={96} strokeWidth={8} label="match" />
        <Text style={[s.h2, { marginTop: spacing.md }]}>
          {nameFor(conversation.agentAId)} × {nameFor(conversation.agentBId)}
        </Text>
        <View style={{ marginTop: 6, paddingVertical: 5, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: compatibilityColor(conversation.compatibilityScore) + '22' }}>
          <Text style={{ color: compatibilityColor(conversation.compatibilityScore), fontWeight: '800', fontSize: 13 }}>
            {conversation.status === 'matched' ? '🔥 STRONG MATCH' : 'NOT QUITE A MATCH'}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <View style={[s.card, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '40' }]}>
          <Text style={[s.label, { marginBottom: 6 }]}>THE VERDICT</Text>
          <Text style={[s.agentText, { color: colors.textPrimary }]}>{conversation.summary}</Text>
        </View>
      </View>

      {/* Breakdown */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <Text style={[s.label, { marginBottom: spacing.md }]}>
          COMPATIBILITY BREAKDOWN {!profile?.isPremium && '(TOP 3)'}
        </Text>
        <View style={[s.card, { gap: 12 }]}>
          {visibleFactors.map((f) => (
            <View key={f.label}>
              <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{f.label}</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>{f.value}%</Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View style={{ width: `${f.value}%`, height: 6, backgroundColor: compatibilityColor(f.value) }} />
              </View>
            </View>
          ))}
          {!profile?.isPremium && (
            <Pressable onPress={() => router.push('/premium')} style={{ marginTop: 4 }}>
              <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
                🔒 See the full breakdown with Premium
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Transcript */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <Text style={[s.label, { marginBottom: spacing.md }]}>HOW THE AGENTS TALKED IT OUT</Text>
        <View style={s.card}>
          <AgentConversationViewer
            conversation={conversation}
            agentAName={nameFor(conversation.agentAId)}
            agentBName={nameFor(conversation.agentBId)}
          />
        </View>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        {conversation.status === 'matched' && matchId ? (
          <>
            <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }}>
              <Text style={[s.label, { marginBottom: 4 }]}>SUGGESTED ICEBREAKER</Text>
              <Text style={{ color: colors.textPrimary, fontStyle: 'italic' }}>"{conversation.icebreaker}"</Text>
            </View>
            <GradientButton title="Open chat" icon="chatbubbles" onPress={() => router.replace(`/match/${matchId}`)} />
          </>
        ) : (
          <View style={{ alignItems: 'center', padding: spacing.lg }}>
            <Text style={[s.body, { textAlign: 'center' }]}>
              Your agents didn't find quite enough common ground this time. Keep training {agentA?.name ?? 'your agent'} and try others!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
