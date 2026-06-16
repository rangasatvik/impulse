import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { AVATAR_GRADIENTS } from '../lib/constants';
import { colors, gradients, radius, s, spacing } from '../lib/theme';

export function GradientButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  style,
  colorsOverride,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  colorsOverride?: readonly [string, string, ...string[]];
}) {
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={colorsOverride ?? gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, pressed && { opacity: 0.85 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={s.row}>
              {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />}
              <Text style={styles.btnText}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.7 }, style]}>
      <View style={s.row}>
        {icon && <Ionicons name={icon} size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />}
        <Text style={styles.outlineBtnText}>{title}</Text>
      </View>
    </Pressable>
  );
}

export function Chip({
  label,
  emoji,
  selected,
  onPress,
  small,
}: {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}) {
  const content = (
    <View
      style={[
        styles.chip,
        small && { paddingVertical: 5, paddingHorizontal: 10 },
        selected && styles.chipSelected,
      ]}
    >
      {emoji ? <Text style={{ fontSize: small ? 13 : 15, marginRight: 5 }}>{emoji}</Text> : null}
      <Text
        style={[
          styles.chipText,
          small && { fontSize: 12 },
          selected && { color: '#fff', fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

export function EmptyState({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 44, marginBottom: 12 }}>{emoji}</Text>
      <Text style={[s.h3, { textAlign: 'center', marginBottom: 6 }]}>{title}</Text>
      <Text style={[s.body, { textAlign: 'center', maxWidth: 300 }]}>{subtitle}</Text>
      {action ? <View style={{ marginTop: 18 }}>{action}</View> : null}
    </View>
  );
}

export function Avatar({
  name,
  colorIndex = 0,
  size = 44,
  active,
}: {
  name: string;
  colorIndex?: number;
  size?: number;
  active?: boolean;
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const grad = AVATAR_GRADIENTS[colorIndex % AVATAR_GRADIENTS.length];
  return (
    <View>
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>{initials || '?'}</Text>
      </LinearGradient>
      {active && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: size * 0.14,
            backgroundColor: colors.success,
            borderWidth: 2,
            borderColor: colors.background,
          }}
        />
      )}
    </View>
  );
}

export function Pill({ children, color = colors.primary }: { children: React.ReactNode; color?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
  },
  outlineBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  chipText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
