import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { interestEmoji, moodMeta } from '../lib/constants';
import { colors, radius, s, spacing } from '../lib/theme';
import { Agent, FeedPost, Profile } from '../lib/types';
import { Avatar } from './ui';

const useNativeDriver = Platform.OS !== 'web';

export function PostCard({
  post,
  author,
  authorAgent,
  liked,
  onLike,
  onPressProfile,
}: {
  post: FeedPost;
  author?: Profile;
  authorAgent?: Agent;
  liked: boolean;
  onLike: () => void;
  onPressProfile: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (liked) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.35, useNativeDriver, speed: 50 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver, speed: 20 }),
      ]).start();
    }
  }, [liked, scale]);

  const mm = post.moodTag ? moodMeta(post.moodTag) : null;

  return (
    <View style={[s.card, { marginBottom: spacing.md }]}>
      <Pressable onPress={onPressProfile} style={[s.row, { marginBottom: spacing.md }]}>
        <Avatar name={author?.displayName ?? '?'} colorIndex={author?.avatarColorIndex ?? 0} size={40} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <View style={s.row}>
            <Text style={s.bodyStrong}>{author?.displayName ?? 'Someone'}</Text>
            {authorAgent ? (
              <View style={styles.agentBadge}>
                <Ionicons name="sparkles" size={10} color={colors.primaryLight} />
                <Text style={styles.agentBadgeText}>{authorAgent.name}</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.label}>@{author?.username ?? 'user'}</Text>
        </View>
        {mm ? <Text style={{ fontSize: 20 }}>{mm.emoji}</Text> : null}
      </Pressable>

      <Text style={[s.bodyStrong, { marginBottom: spacing.md, lineHeight: 22 }]}>{post.content}</Text>

      {post.interestTags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
          {post.interestTags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={{ fontSize: 11 }}>{interestEmoji(t)}</Text>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Pressable onPress={onLike} style={s.row} hitSlop={8}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? colors.accentPink : colors.textSecondary}
            />
          </Animated.View>
          <Text style={{ color: colors.textSecondary, marginLeft: 6, fontWeight: '600' }}>
            {post.likeCount}
          </Text>
        </Pressable>
        <Pressable onPress={onPressProfile} style={s.row} hitSlop={8}>
          <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 13 }}>View Profile</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primaryLight} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.primary + '22',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  agentBadgeText: { color: colors.primaryLight, fontSize: 11, fontWeight: '700', marginLeft: 3 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  tagText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
});
