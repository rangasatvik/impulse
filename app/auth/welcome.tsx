import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PulseLogo, SafetyNotice, TraitChip } from '../../components/aurora';
import { GradientButton, OutlineButton } from '../../components/ui';
import { colors, gradients, radius, s, shadow, spacing } from '../../lib/theme';

const STEPS = [
  { icon: 'sparkles' as const, label: 'Build your agent' },
  { icon: 'git-compare' as const, label: 'Agents find fit' },
  { icon: 'chatbubbles' as const, label: 'Start naturally' },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={gradients.aurora} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          minHeight: '100%',
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <View style={s.row}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
              }}
            >
              <Ionicons name="pulse" size={21} color="#fff" />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginLeft: 10 }}>
              Impulse
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/auth/login')}
            style={{
              minHeight: 44,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '900' }}>Sign in</Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: spacing.xl,
            borderRadius: radius.xl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderLight,
            ...shadow.floating,
          }}
        >
          <LinearGradient colors={gradients.hero} style={{ padding: spacing.xl, minHeight: 300 }}>
            <View style={{ alignItems: 'center' }}>
              <PulseLogo size={94} />
              <Text style={{ color: '#fff', fontSize: 34, lineHeight: 38, fontWeight: '900', marginTop: spacing.lg, textAlign: 'center' }}>
                Meet people your agent already understands.
              </Text>
              <Text style={{ color: colors.blush, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: spacing.md }}>
                Build an AI social agent that learns your personality, finds emotionally aligned people, and helps you start real conversations.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.lg }}>
          <TraitChip label="Private by default" icon="lock-closed" color={colors.safety} />
          <TraitChip label="You approve messages" icon="checkmark-circle" color={colors.info} />
          <TraitChip label="Campus-first MVP" icon="school" color={colors.accent} />
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          {STEPS.map((step, index) => (
            <View key={step.label} style={[s.card, { flexDirection: 'row', alignItems: 'center', padding: spacing.md }]}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primary + '14',
                  marginRight: spacing.md,
                }}
              >
                <Ionicons name={step.icon} size={19} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.bodyStrong}>{step.label}</Text>
                <Text style={[s.label, { marginTop: 2 }]}>Step {index + 1} · Low-pressure social discovery</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SafetyNotice compact />
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          <GradientButton title="Create my agent" icon="sparkles" onPress={() => router.push('/auth/signup')} />
          <OutlineButton title="Preview demo" icon="play-circle" onPress={() => router.push('/auth/signup')} />
          <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 2 }}>
            AI that understands you. Connections that matter.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
