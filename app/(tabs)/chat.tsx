import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SafetyNotice, ScreenContainer, SectionHeader, TraitChip } from '../../components/aurora';
import { CompatibilityRing } from '../../components/CompatibilityRing';
import { Avatar, EmptyState, GradientButton } from '../../components/ui';
import { usePermissions } from '../../lib/permissions';
import { colors, radius, s, spacing } from '../../lib/theme';
import { Match } from '../../lib/types';
import { useCurrentProfile, useMyAgent, useStore } from '../../stores/appStore';

export default function ChatTab() {
  const router = useRouter();
  const profile = useCurrentProfile();
  const agent = useMyAgent();
  const permissions = usePermissions();
  const matches = useStore((st) => st.matches);
  const messages = useStore((st) => st.messages);
  const profiles = useStore((st) => st.profiles);
  const matchReads = useStore((st) => st.matchReads);

  const myMatches = useMemo(
    () =>
      Object.values(matches)
        .filter((match) => match.userAId === profile?.id || match.userBId === profile?.id)
        .sort((a, b) => {
          const lastA = messages[a.id]?.slice(-1)[0]?.createdAt ?? a.createdAt;
          const lastB = messages[b.id]?.slice(-1)[0]?.createdAt ?? b.createdAt;
          return new Date(lastB).getTime() - new Date(lastA).getTime();
        }),
    [matches, messages, profile?.id]
  );

  const unreadTotal = myMatches.reduce((total, match) => {
    const readAt = matchReads[`${profile?.id}:${match.id}`];
    const readTime = readAt ? new Date(readAt).getTime() : 0;
    return total + (messages[match.id] ?? []).filter((message) => message.senderId !== profile?.id && new Date(message.createdAt).getTime() > readTime).length;
  }, 0);

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="CHAT"
        title="Real conversations, helped by Co-Pilot"
        subtitle="AI can suggest replies, but you always approve every outgoing message."
      />

      <View style={[s.cardElevated, { marginBottom: spacing.lg }]}>
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ai + '16', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
            <Ionicons name="color-wand" size={22} color={colors.ai} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h3}>Co-Pilot is optional</Text>
            <Text style={[s.body, { marginTop: 5 }]}>Get warm, playful, or curious reply ideas. Nothing sends until you tap send.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: spacing.md }}>
              <TraitChip label={permissions.isPremium ? 'Unlimited suggestions' : `${permissions.copilotRemaining} left today`} color={colors.ai} />
              <TraitChip label={`${unreadTotal} unread`} icon="chatbubble-ellipses" color={colors.primaryLight} />
            </View>
          </View>
        </View>
      </View>

      <SectionHeader eyebrow="CONVERSATIONS" title="Matched chats" />
      {myMatches.length === 0 ? (
        <EmptyState
          emoji="💬"
          title="No chats yet"
          subtitle={`${agent?.name ?? 'Your agent'} will bring conversations here once a spark is strong enough.`}
          action={<GradientButton title="Open Discover" icon="compass" onPress={() => router.push('/(tabs)/discover')} />}
        />
      ) : (
        myMatches.map((match) => {
          const partner = getPartner(match, profile?.id, profiles);
          const list = messages[match.id] ?? [];
          const latest = list.slice(-1)[0];
          const readAt = matchReads[`${profile?.id}:${match.id}`];
          const readTime = readAt ? new Date(readAt).getTime() : 0;
          const unread = list.filter((message) => message.senderId !== profile?.id && new Date(message.createdAt).getTime() > readTime).length;

          return (
            <Pressable
              key={match.id}
              accessibilityRole="button"
              onPress={() => router.push(`/match/${match.id}`)}
              style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }]}
            >
              <Avatar name={partner?.displayName ?? 'Match'} colorIndex={partner?.avatarColorIndex ?? 0} size={54} active={unread > 0} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={s.h3}>{partner?.displayName ?? 'Match'}</Text>
                  {unread > 0 ? (
                    <View style={{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{unread}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[s.label, { marginTop: 3 }]} numberOfLines={1}>
                  {latest?.content ?? match.icebreaker}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                  <TraitChip label="Warm intro" color={colors.accent} />
                  <TraitChip label="Co-Pilot ready" color={colors.ai} />
                </View>
              </View>
              <View style={{ marginLeft: spacing.sm }}>
                <CompatibilityRing score={match.compatibilityScore} size={50} strokeWidth={5} />
              </View>
            </Pressable>
          );
        })
      )}

      <View style={{ marginTop: spacing.lg }}>
        <SafetyNotice />
      </View>
    </ScreenContainer>
  );
}

function getPartner(match: Match, currentUserId: string | undefined, profiles: ReturnType<typeof useStore.getState>['profiles']) {
  const partnerId = match.userAId === currentUserId ? match.userBId : match.userAId;
  return profiles[partnerId];
}
