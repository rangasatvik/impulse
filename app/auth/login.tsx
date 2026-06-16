import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { colors, s, spacing } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const login = useStore((st) => st.login);
  const profiles = useStore((st) => st.profiles);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    const res = login(email.trim(), password);
    if (!res.ok) {
      toast(res.error ?? 'Could not sign in.', 'error');
      return;
    }
    const profile = Object.values(profiles).find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (profile && !profile.onboardingComplete) router.replace('/onboarding/step1-name');
    else router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.screen}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + 12 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: spacing.xl }}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>

        <Text style={s.h1}>Welcome back</Text>
        <Text style={[s.body, { marginTop: 8, marginBottom: spacing.xl }]}>Your agent missed you.</Text>

        <Text style={s.label}>EMAIL</Text>
        <TextInput
          style={[s.input, { marginTop: 6, marginBottom: spacing.lg }]}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={s.label}>PASSWORD</Text>
        <TextInput
          style={[s.input, { marginTop: 6, marginBottom: spacing.sm }]}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
        />
        <Pressable onPress={() => toast('Password recovery is mocked in this demo.', 'info')} style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}>
          <Text style={{ color: colors.primaryLight, fontSize: 13, fontWeight: '600' }}>Forgot password?</Text>
        </Pressable>

        <GradientButton title="Sign In" onPress={submit} />

        <View style={{ marginTop: spacing.xl, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={[s.label, { marginBottom: 6 }]}>👋 NEW HERE?</Text>
          <Text style={s.body}>
            Tap "Sign In" with a fresh email & password to explore, or head back and create an account. Everything runs locally — no servers, no keys.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
