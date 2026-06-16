import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, componentSizes, gradients, radius, s, shadow, spacing } from '../lib/theme';
import { AgentMemory, CampusEvent, Community } from '../lib/productData';
import { Agent, Profile } from '../lib/types';
import { AgentAvatar } from './AgentAvatar';
import { CompatibilityRing } from './CompatibilityRing';
import { Avatar } from './ui';

const useNativeDriver = Platform.OS !== 'web';

export function ScreenContainer({
  children,
  scroll = true,
  padded = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const padding = padded ? spacing.lg : 0;
  if (!scroll) {
    return (
      <View style={[s.screen, { paddingTop: insets.top + padding, paddingHorizontal: padding }, contentStyle]}>
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[
        {
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: padding,
          paddingBottom: insets.bottom + componentSizes.tabBar + spacing.xl,
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function GradientBackground({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient colors={gradients.aurora} style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
}

export function PulseLogo({ size = 92, label }: { size?: number; label?: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.38] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.34, 0] });

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size * 1.45, height: size * 1.45, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.accent,
            transform: [{ scale }],
            opacity,
          }}
        />
        <LinearGradient
          colors={gradients.agent}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow.floating,
          }}
        >
          <Ionicons name="sparkles" size={size * 0.42} color="#fff" />
        </LinearGradient>
      </View>
      {label ? <Text style={[s.label, { color: colors.inverse, marginTop: 4 }]}>{label}</Text> : null}
    </View>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          {eyebrow ? <Text style={[s.label, { color: colors.accent }]}>{eyebrow}</Text> : null}
          <Text style={[s.h2, { marginTop: eyebrow ? 2 : 0 }]}>{title}</Text>
        </View>
        {action && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={{
              minHeight: 44,
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <Text style={[s.body, { marginTop: 5 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color = colors.textPrimary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: componentSizes.iconButton,
        height: componentSizes.iconButton,
        borderRadius: componentSizes.iconButton / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function AgentStatusCard({
  agent,
  title,
  detail,
  action,
  onPress,
}: {
  agent?: Agent | null;
  title?: string;
  detail?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.cardElevated, { flexDirection: 'row', alignItems: 'center' }]}>
      <AgentAvatar agent={agent} size={58} moodEmoji="✨" />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={s.h3}>{title ?? `${agent?.name ?? 'Your agent'} is active`}</Text>
        <Text style={[s.body, { marginTop: 3 }]} numberOfLines={2}>
          {detail ?? 'Learning your vibe and looking for emotionally aligned people.'}
        </Text>
      </View>
      {action ? <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 12 }}>{action}</Text> : null}
    </Pressable>
  );
}

export function SparkCard({
  profile,
  agent,
  score,
  reasons,
  onPress,
  onWarmIntro,
  onPass,
}: {
  profile: Profile;
  agent: Agent;
  score: number;
  reasons: string[];
  onPress: () => void;
  onWarmIntro?: () => void;
  onPass?: () => void;
}) {
  return (
    <View style={[s.cardElevated, { marginBottom: spacing.md }]}>
      <Pressable onPress={onPress} style={[s.row, { alignItems: 'flex-start' }]}>
        <Avatar name={profile.displayName} colorIndex={profile.avatarColorIndex} size={58} active />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={s.h3}>{profile.displayName}</Text>
          <Text style={s.label}>
            {profile.age ? `${profile.age} · ` : ''}{agent.name} · {agent.energyLevel} energy
          </Text>
          <Text style={[s.body, { marginTop: 7 }]} numberOfLines={3}>
            Your agents found overlap in {agent.interests.slice(0, 2).join(' and ')}, plus a matching social pace.
          </Text>
        </View>
        <CompatibilityRing score={score} size={58} strokeWidth={6} label="spark" />
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: spacing.md }}>
        {reasons.slice(0, 4).map((reason) => (
          <TraitChip key={reason} label={reason} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <MiniCTA label="Why this spark?" icon="help-circle" onPress={onPress} />
        <MiniCTA label="Warm intro" icon="chatbubbles" onPress={onWarmIntro ?? onPress} filled />
        <MiniCTA label="Pass" icon="close" onPress={onPass ?? onPress} muted />
      </View>
    </View>
  );
}

export function TraitChip({ label, icon, color = colors.primaryLight }: { label: string; icon?: keyof typeof Ionicons.glyphMap; color?: string }) {
  return (
    <View
      style={{
        minHeight: 30,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color + '14',
        borderColor: color + '40',
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      {icon ? <Ionicons name={icon} size={13} color={color} style={{ marginRight: 5 }} /> : null}
      <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

export function MoodChip({ emoji, label, active, onPress }: { emoji: string; label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primaryLight : colors.border,
      }}
    >
      <Text style={{ fontSize: 18, marginRight: 7 }}>{emoji}</Text>
      <Text style={{ color: active ? '#fff' : colors.textPrimary, fontSize: 13, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

export function InsightCard({
  icon,
  title,
  body,
  tone = colors.ai,
  action,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  tone?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.card, { backgroundColor: tone + '10', borderColor: tone + '35' }]}>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: tone + '20', marginRight: spacing.md }}>
          <Ionicons name={icon} size={20} color={tone} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.h3}>{title}</Text>
          <Text style={[s.body, { marginTop: 5 }]}>{body}</Text>
          {action ? <Text style={{ color: tone, fontWeight: '900', marginTop: 10, fontSize: 13 }}>{action}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function SafetyNotice({ compact }: { compact?: boolean }) {
  return (
    <View style={[s.card, { backgroundColor: colors.safety + '10', borderColor: colors.safety + '35', padding: compact ? spacing.md : spacing.lg }]}>
      <View style={s.row}>
        <Ionicons name="shield-checkmark" size={18} color={colors.safety} />
        <Text style={{ color: colors.safety, fontWeight: '900', fontSize: 12, marginLeft: 7 }}>SAFETY & PRIVACY</Text>
      </View>
      <Text style={[s.body, { marginTop: 7 }]}>
        You approve every message. Private agent memories stay private, and you can report, block, hide, or tune recommendations anytime.
      </Text>
    </View>
  );
}

export function PrivacyToggleRow({
  title,
  detail,
  enabled,
  onPress,
}: {
  title: string;
  detail: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.row, { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text style={s.bodyStrong}>{title}</Text>
        <Text style={[s.label, { marginTop: 3, fontWeight: '600' }]}>{detail}</Text>
      </View>
      <View
        style={{
          width: 52,
          height: 32,
          borderRadius: 16,
          padding: 3,
          backgroundColor: enabled ? colors.safety : colors.borderLight,
          alignItems: enabled ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' }} />
      </View>
    </Pressable>
  );
}

export function MemoryCard({ memory }: { memory: AgentMemory }) {
  return (
    <View style={[s.card, { marginBottom: spacing.sm }]}>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={s.h3}>{memory.title}</Text>
          <Text style={[s.body, { marginTop: 5 }]}>{memory.detail}</Text>
        </View>
        <TraitChip label={memory.category} color={colors.ai} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md }}>
        <TraitChip label={memory.private ? 'Private' : 'Shareable'} icon={memory.private ? 'lock-closed' : 'eye'} color={memory.private ? colors.safety : colors.info} />
        <TraitChip label={memory.matching ? 'Used for matching' : 'Not matching'} icon="git-network" color={colors.accent} />
      </View>
    </View>
  );
}

export function CommunityCard({ community, onPress }: { community: Community; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.card, { marginBottom: spacing.sm }]}>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ai + '16', marginRight: spacing.md }}>
          <Ionicons name={community.icon as any} size={21} color={colors.ai} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text style={s.h3}>{community.title}</Text>
            <Text style={{ color: colors.success, fontWeight: '900', fontSize: 13 }}>{community.compatibility}%</Text>
          </View>
          <Text style={[s.body, { marginTop: 4 }]}>{community.description}</Text>
          <Text style={[s.label, { marginTop: 8 }]}>
            {community.members} members · {community.nextEvent}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function EventCard({ event, onPress }: { event: CampusEvent; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.card, { marginBottom: spacing.sm }]}>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <View style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent + '18', marginRight: spacing.md }}>
          <Ionicons name="calendar" size={21} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.h3}>{event.title}</Text>
          <Text style={[s.body, { marginTop: 4 }]}>{event.time} · {event.location}</Text>
          <Text style={[s.label, { marginTop: 7 }]}>
            {event.compatiblePeople} compatible people interested · {event.vibe}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function SkeletonCard() {
  return (
    <View style={[s.card, { gap: 10 }]}>
      <View style={{ width: '52%', height: 16, borderRadius: 8, backgroundColor: colors.blush ?? '#FFE4DD' }} />
      <View style={{ width: '100%', height: 12, borderRadius: 6, backgroundColor: colors.borderLight }} />
      <View style={{ width: '78%', height: 12, borderRadius: 6, backgroundColor: colors.borderLight }} />
    </View>
  );
}

function MiniCTA({
  label,
  icon,
  onPress,
  filled,
  muted,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  filled?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 44,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 8,
        backgroundColor: filled ? colors.primary : colors.surfaceElevated,
        borderWidth: 1,
        borderColor: filled ? colors.primary : colors.border,
        opacity: muted ? 0.75 : 1,
      }}
    >
      <Ionicons name={icon} size={14} color={filled ? '#fff' : colors.textPrimary} style={{ marginRight: 5 }} />
      <Text style={{ color: filled ? '#fff' : colors.textPrimary, fontSize: 11, fontWeight: '900' }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
