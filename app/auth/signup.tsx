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

export default function Signup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const signUp = useStore((st) => st.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageOk, setAgeOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email.includes('@') || password.length < 4) {
      toast('Enter a valid email and a password (4+ chars).', 'error');
      return;
    }
    if (!ageOk) {
      toast('Please confirm you are 15 or older.', 'error');
      return;
    }
    setLoading(true);
    const res = signUp(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      toast(res.error ?? 'Could not sign up.', 'error');
      return;
    }
    router.replace('/onboarding/step1-name');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.screen}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + 12 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: spacing.xl }}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>

        <Text style={s.h1}>Create your account</Text>
        <Text style={[s.body, { marginTop: 8, marginBottom: spacing.xl }]}>
          Your AI agent is about to learn what makes you, you.
        </Text>

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
          style={[s.input, { marginTop: 6, marginBottom: spacing.lg }]}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable onPress={() => setAgeOk((v) => !v)} style={[s.row, { marginBottom: spacing.xl }]}>
          <View
            style={{
              width: 24, height: 24, borderRadius: 6, borderWidth: 2,
              borderColor: ageOk ? colors.primary : colors.border,
              backgroundColor: ageOk ? colors.primary : 'transparent',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}
          >
            {ageOk && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[s.body, { flex: 1 }]}>I confirm I'm 15 years or older</Text>
        </Pressable>

        <GradientButton title="Continue" onPress={submit} loading={loading} />

        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 }}>
          By continuing you agree to our Terms of Service and Privacy Policy. This demo stores all data locally on your device.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
