import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AgentStatusCard,
  PrivacyToggleRow,
  SafetyNotice,
  ScreenContainer,
  SectionHeader,
  TraitChip,
} from '../../components/aurora';
import { Avatar, GradientButton, OutlineButton } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { calculateMeaningfulConnectionsScore } from '../../lib/connectionScore';
import { colors, gradients, radius, s, spacing } from '../../lib/theme';
import { useCurrentProfile, useMyAgent, useStore } from '../../stores/appStore';

export default function ProfileTab() {
  const router = useRouter();
  const toast = useToast();
  const profile = useCurrentProfile();
  const agent = useMyAgent();
  const matches = useStore((st) => st.matches);
  const messages = useStore((st) => st.messages);
  const posts = useStore((st) => st.posts);
  const logout = useStore((st) => st.logout);
  const [expanded, setExpanded] = useState(false);
  const [privacy, setPrivacy] = useState({
    interests: true,
    memories: true,
    mood: true,
  });

  const myPosts = useMemo(() => posts.filter((post) => post.userId === profile?.id), [posts, profile?.id]);

  const score = useMemo(() => {
    const myMatches = Object.values(matches).filter((match) => match.userAId === profile?.id || match.userBId === profile?.id);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let totalMessages = 0;
    let activeConversations = 0;
    let longestConversationDays = 0;
    for (const match of myMatches) {
      const list = messages[match.id] ?? [];
      totalMessages += list.length;
      if (list.some((message) => new Date(message.createdAt).getTime() > weekAgo)) activeConversations++;
      if (list.length) {
        longestConversationDays = Math.max(
          longestConversationDays,
          (new Date(list[list.length - 1].createdAt).getTime() - new Date(list[0].createdAt).getTime()) / 86400000
        );
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
  }, [matches, messages, profile?.id]);

  const signOut = () => {
    logout();
    router.replace('/auth/welcome');
  };

  if (!profile) return null;

  return (
    <ScreenContainer>
      <View style={[s.cardElevated, { alignItems: 'center', marginBottom: spacing.lg }]}>
        <Avatar name={profile.displayName || 'You'} colorIndex={profile.avatarColorIndex} size={86} active />
        <Text style={[s.h2, { marginTop: spacing.md }]}>{profile.displayName || 'Impulse member'}</Text>
        <Text style={s.label}>@{profile.username || 'your_username'}{profile.age ? ` · ${profile.age}` : ''}</Text>
        {profile.bio ? <Text style={[s.body, { textAlign: 'center', marginTop: spacing.md }]}>{profile.bio}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md }}>
          <TraitChip label={profile.isPremium ? 'Premium' : 'Free MVP'} icon={profile.isPremium ? 'star' : 'sparkles'} color={profile.isPremium ? colors.premium : colors.primary} />
          <TraitChip label="Private memories" icon="lock-closed" color={colors.safety} />
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => setExpanded((value) => !value)} style={{ marginBottom: spacing.lg }}>
        <LinearGradient colors={gradients.premium} style={{ borderRadius: radius.xl, padding: spacing.lg }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>PRIVATE CONNECTION HEALTH</Text>
          <View style={[s.row, { justifyContent: 'space-between', marginTop: spacing.sm }]}>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>{score.total}</Text>
            <Ionicons name={expanded ? 'chevron-up' : 'information-circle'} size={24} color="#fff" />
          </View>
          <Text style={{ color: colors.blush, fontSize: 14, lineHeight: 21 }}>
            This helps your agent improve recommendations. It is private to you.
          </Text>
          {expanded ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <ScoreRow label="Depth" value={score.matchDepth} max={30} />
              <ScoreRow label="Consistency" value={score.activityScore} max={30} />
              <ScoreRow label="Mutuality" value={score.qualityScore} max={20} />
              <ScoreRow label="Follow-through" value={score.longevityScore} max={15} />
              <ScoreRow label="Community involvement" value={score.engagementScore} max={5} />
            </View>
          ) : null}
        </LinearGradient>
      </Pressable>

      <AgentStatusCard
        agent={agent}
        title="Agent profile preview"
        detail={agent?.personalitySummary || 'Your agent profile will fill in as onboarding and training continue.'}
        action="Open"
        onPress={() => router.push('/(tabs)/agent')}
      />

      <View style={{ marginTop: spacing.lg }}>
        <SectionHeader eyebrow="PROFILE PROMPTS" title="Your story" action="Edit" onAction={() => toast('Profile editing is mocked in this frontend MVP.', 'info')} />
        {myPosts.length === 0 ? (
          <View style={s.card}>
            <Text style={s.h3}>No posts yet</Text>
            <Text style={[s.body, { marginTop: 5 }]}>Share a low-pressure update from Home when you want your agent to learn from it.</Text>
          </View>
        ) : (
          myPosts.slice(0, 3).map((post) => (
            <View key={post.id} style={[s.card, { marginBottom: spacing.sm }]}>
              <Text style={s.bodyStrong}>{post.content}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: spacing.sm }}>
                {post.interestTags.slice(0, 4).map((tag) => (
                  <TraitChip key={tag} label={tag} color={colors.ai} />
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <SectionHeader eyebrow="SAFETY" title="Privacy & control" />
        <View style={s.card}>
          <PrivacyToggleRow
            title="Use interests for matching"
            detail="Your agent can use interests to find people and groups."
            enabled={privacy.interests}
            onPress={() => setPrivacy((value) => ({ ...value, interests: !value.interests }))}
          />
          <PrivacyToggleRow
            title="Remember agent insights"
            detail="Private by default and editable in Agent Studio."
            enabled={privacy.memories}
            onPress={() => setPrivacy((value) => ({ ...value, memories: !value.memories }))}
          />
          <PrivacyToggleRow
            title="Mood-based personalization"
            detail="Tune today's sparks without showing your mood to matches."
            enabled={privacy.mood}
            onPress={() => setPrivacy((value) => ({ ...value, mood: !value.mood }))}
          />
        </View>
      </View>

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <SectionHeader eyebrow="SETTINGS" title="Account" />
        {!profile.isPremium ? (
          <GradientButton title="Preview Premium" icon="star" onPress={() => router.push('/premium')} />
        ) : null}
        <OutlineButton title="Notifications" icon="notifications" onPress={() => router.push('/(tabs)/notifications')} />
        <OutlineButton title="Help & safety center" icon="shield-checkmark" onPress={() => toast('Help center is a UI-only MVP placeholder.', 'info')} />
        <OutlineButton title="Sign out" icon="log-out" onPress={signOut} />
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <SafetyNotice />
      </View>
    </ScreenContainer>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <View>
      <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>{label}</Text>
        <Text style={{ color: colors.blush, fontSize: 12, fontWeight: '900' }}>{value}/{max}</Text>
      </View>
      <View style={{ height: 7, borderRadius: 4, backgroundColor: '#FFFFFF30', overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: 7, borderRadius: 4, backgroundColor: '#fff' }} />
      </View>
    </View>
  );
}
