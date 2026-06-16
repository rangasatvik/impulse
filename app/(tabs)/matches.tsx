import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompatibilityRing } from '../../components/CompatibilityRing';
import { Avatar, EmptyState, GradientButton } from '../../components/ui';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useCurrentProfile, useStore } from '../../stores/appStore';

export default function Matches() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useCurrentProfile();
  const matches = useStore((st) => st.matches);
  const messages = useStore((st) => st.messages);
  const profiles = useStore((st) => st.profiles);
  const matchReads = useStore((st) => st.matchReads);
  const [expanded, setExpanded] = useState<string | null>(null);

  const myMatches = useMemo(() => {
    return Object.values(matches)
      .filter((m) => m.userAId === profile?.id || m.userBId === profile?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [matches, profile?.id]);

  const partnerOf = (m: (typeof myMatches)[number]) => {
    const pid = m.userAId === profile?.id ? m.userBId : m.userAId;
    return profiles[pid];
  };

  const lastMessage = (matchId: string) => {
    const list = messages[matchId] ?? [];
    return list[list.length - 1];
  };

  const unreadCount = (matchId: string) => {
    const list = messages[matchId] ?? [];
    const readAt = matchReads[`${profile?.id}:${matchId}`];
    const t = readAt ? new Date(readAt).getTime() : 0;
    return list.filter((m) => m.senderId !== profile?.id && new Date(m.createdAt).getTime() > t).length;
  };

  return (
    <View style={s.screen}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <Text style={s.h1}>Matches</Text>
        <Text style={s.label}>{myMatches.length} connection{myMatches.length === 1 ? '' : 's'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {myMatches.length === 0 ? (
          <EmptyState
            emoji="💫"
            title="No matches yet"
            subtitle="Your agent hasn't found anyone yet — head to Discover and start an agent chat to make your first connection!"
            action={<GradientButton title="Go to Discover" icon="compass" onPress={() => router.push('/(tabs)/discover')} />}
          />
        ) : (
          myMatches.map((m) => {
            const partner = partnerOf(m);
            const last = lastMessage(m.id);
            const unread = unreadCount(m.id);
            const isOpen = expanded === m.id;
            return (
              <View key={m.id} style={[s.card, { marginBottom: spacing.md }]}>
                <Pressable onPress={() => router.push(`/match/${m.id}`)} style={s.row}>
                  <Avatar name={partner?.displayName ?? '?'} colorIndex={partner?.avatarColorIndex ?? 0} size={52} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <View style={[s.row, { justifyContent: 'space-between' }]}>
                      <Text style={s.h3}>{partner?.displayName}</Text>
                      {unread > 0 && (
                        <View style={{ backgroundColor: colors.accentPink, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{unread}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[s.label, { marginTop: 2 }]} numberOfLines={1}>
                      {last ? (last.senderId === profile?.id ? 'You: ' : '') + last.content : 'Say hi 👋'}
                    </Text>
                  </View>
                  <View style={{ marginLeft: spacing.sm }}>
                    <CompatibilityRing score={m.compatibilityScore} size={48} strokeWidth={5} />
                  </View>
                </Pressable>

                <Pressable onPress={() => setExpanded(isOpen ? null : m.id)} style={[s.row, { marginTop: spacing.md, justifyContent: 'space-between' }]}>
                  <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 13 }}>
                    {isOpen ? 'Hide' : 'Why you matched'}
                  </Text>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primaryLight} />
                </Pressable>
                {isOpen && (
                  <View style={{ marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: radius.md }}>
                    <Text style={s.agentText}>{m.matchReason}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
