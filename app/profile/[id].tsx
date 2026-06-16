import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AgentAvatar } from '../../components/AgentAvatar';
import { Avatar, Chip, GradientButton, Pill } from '../../components/ui';
import { interestEmoji } from '../../lib/constants';
import { colors, s, spacing } from '../../lib/theme';
import { useCurrentProfile, useStore } from '../../stores/appStore';

export default function PublicProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const me = useCurrentProfile();

  const profile = useStore((st) => (id ? st.profiles[id] : undefined));
  const agents = useStore((st) => st.agents);
  const posts = useStore((st) => st.posts);
  const startAgentChatWith = useStore((st) => st.startAgentChatWith);

  const agent = useMemo(() => Object.values(agents).find((a) => a.userId === id), [agents, id]);
  const theirPosts = useMemo(() => posts.filter((p) => p.userId === id), [posts, id]);

  if (!profile) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.body}>Profile not found.</Text>
      </View>
    );
  }

  const isMe = id === me?.id;

  const start = () => {
    if (!id) return;
    const { conversationId } = startAgentChatWith(id);
    router.push(`/agent/conversation/${conversationId}`);
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm }}>
        <Avatar name={profile.displayName} colorIndex={profile.avatarColorIndex} size={84} />
        <Text style={[s.h2, { marginTop: spacing.md }]}>{profile.displayName}</Text>
        <Text style={s.label}>@{profile.username}{profile.age ? ` · ${profile.age}` : ''}</Text>
        {profile.isPremium && <View style={{ marginTop: 8 }}><Pill color={colors.accent}>★ PREMIUM</Pill></View>}
        {profile.bio ? <Text style={[s.body, { textAlign: 'center', marginTop: spacing.md, maxWidth: 320 }]}>{profile.bio}</Text> : null}
      </View>

      {agent && (
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={[s.card, s.row]}>
            <AgentAvatar agent={agent} size={48} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={s.h3}>{agent.name}</Text>
              <Text style={[s.agentText, { marginTop: 2, fontSize: 13 }]} numberOfLines={3}>{agent.agentBio}</Text>
            </View>
          </View>
          <Text style={[s.label, { marginTop: spacing.lg, marginBottom: spacing.md }]}>INTERESTS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {agent.interests.map((i) => (
              <Chip key={i} label={i} emoji={interestEmoji(i)} small />
            ))}
          </View>
        </View>
      )}

      {theirPosts.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Text style={[s.label, { marginBottom: spacing.md }]}>POSTS</Text>
          {theirPosts.map((p) => (
            <View key={p.id} style={[s.card, { marginBottom: spacing.sm }]}>
              <Text style={s.bodyStrong}>{p.content}</Text>
            </View>
          ))}
        </View>
      )}

      {!isMe && agent && (
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <GradientButton title="Start Agent Chat" icon="git-compare" onPress={start} />
        </View>
      )}
    </ScrollView>
  );
}
