import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { interestEmoji } from '../lib/constants';
import { colors, radius, s, spacing } from '../lib/theme';
import { Agent, Profile } from '../lib/types';
import { AgentAvatar } from './AgentAvatar';
import { GradientButton } from './ui';

// Card for the Discover grid. When `locked`, it dims the content and shows a
// premium gate overlay instead of the action button.
export function MatchCard({
  profile,
  agent,
  sharedInterests,
  locked,
  onStartChat,
  onUnlock,
}: {
  profile: Profile;
  agent: Agent;
  sharedInterests: string[];
  locked?: boolean;
  onStartChat: () => void;
  onUnlock: () => void;
}) {
  const top = (sharedInterests.length ? sharedInterests : agent.interests).slice(0, 3);
  return (
    <View style={[s.card, { padding: spacing.lg }]}>
      <View style={{ opacity: locked ? 0.35 : 1 }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
          <AgentAvatar agent={agent} size={56} active={!locked} />
        </View>
        <Text style={[s.h3, { textAlign: 'center' }]}>{profile.displayName}</Text>
        <Text style={[s.label, { textAlign: 'center', marginBottom: 4 }]}>
          agent · {agent.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
          {agent.energyLevel} energy · {agent.humorStyle}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
          {top.map((t) => (
            <View key={t} style={styles.miniTag}>
              <Text style={{ fontSize: 11 }}>{interestEmoji(t)}</Text>
              <Text style={styles.miniTagText}>{t}</Text>
            </View>
          ))}
        </View>
        {!locked && <GradientButton title="Start Agent Chat" icon="git-compare" onPress={onStartChat} />}
      </View>

      {locked && (
        <Pressable onPress={onUnlock} style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={26} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 8 }}>
            Unlock with Premium
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            See unlimited matches
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  miniTagText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,15,0.55)',
    borderRadius: radius.lg,
  },
});
