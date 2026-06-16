import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, s, shadow, spacing } from '../lib/theme';
import { GradientButton } from './ui';

export function OnboardingScaffold({
  step,
  total,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
  canGoBack = true,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  canGoBack?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.screen}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing.xl }}>
        <View style={[s.row, { marginBottom: spacing.lg }]}>
          {canGoBack ? (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <View style={{ width: 26 }} />
          )}
          <View style={{ flex: 1, flexDirection: 'row', gap: 6, marginLeft: 14 }}>
            {Array.from({ length: total }).map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i < step ? colors.primary : colors.blush,
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.card, { padding: spacing.md, marginBottom: spacing.lg, ...shadow.card }]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text style={[s.label, { color: colors.primary }]}>STEP {step} OF {total}</Text>
            <Text style={s.label}>~2 minutes</Text>
          </View>
          <Text style={[s.h1, { marginTop: spacing.sm }]}>{title}</Text>
          {subtitle ? <Text style={[s.body, { marginTop: 8 }]}>{subtitle}</Text> : null}
          <View style={[s.row, { marginTop: spacing.md, justifyContent: 'space-between' }]}>
            <Text style={[s.label, { flex: 1, paddingRight: spacing.md }]}>You control what your agent remembers.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/auth/welcome')}
              style={{
                minHeight: 36,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>Save</Text>
            </Pressable>
          </View>
        </View>
        {children}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + 18, paddingTop: 8 }}>
        <GradientButton title={nextLabel} onPress={onNext} disabled={nextDisabled} />
      </View>
    </KeyboardAvoidingView>
  );
}
