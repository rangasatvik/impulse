import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../components/ui';
import { colors, radius, s, spacing } from '../../lib/theme';
import { AppNotification } from '../../lib/types';
import { useStore } from '../../stores/appStore';

const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  new_match: 'heart',
  new_message: 'chatbubble',
  agent_match_found: 'sparkles',
  co_pilot_tip: 'bulb',
  milestone: 'trophy',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUserId = useStore((st) => st.currentUserId);
  const notifications = useStore((st) => st.notifications);
  const markAllRead = useStore((st) => st.markAllNotificationsRead);

  const mine = useMemo(
    () => notifications.filter((n) => n.userId === currentUserId),
    [notifications, currentUserId]
  );
  const hasUnread = mine.some((n) => !n.isRead);

  // mark everything read when the user leaves this tab
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (mine.some((n) => !n.isRead)) markAllRead();
      };
    }, [mine, markAllRead])
  );

  const onPress = (n: AppNotification) => {
    if (n.data?.matchId) router.push(`/match/${n.data.matchId}`);
  };

  return (
    <View style={s.screen}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Text style={s.h1}>Activity</Text>
        {hasUnread && (
          <Pressable onPress={markAllRead}>
            <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 13 }}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {mine.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="All quiet for now"
            subtitle="When your agent finds matches or someone messages you, it'll show up here."
          />
        ) : (
          mine.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => onPress(n)}
              style={[s.card, { marginBottom: spacing.sm, flexDirection: 'row', backgroundColor: n.isRead ? colors.surface : colors.primary + '14', borderColor: n.isRead ? colors.border : colors.primary + '44' }]}
            >
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
                <Ionicons name={ICON[n.type] ?? 'notifications'} size={18} color={colors.primaryLight} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={s.bodyStrong}>{n.title}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{timeAgo(n.createdAt)}</Text>
                </View>
                <Text style={[s.label, { marginTop: 3, fontWeight: '500' }]} numberOfLines={2}>
                  {n.body}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
