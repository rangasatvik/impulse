import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { OnboardingScaffold } from '../../components/Onboarding';
import { colors, s, spacing } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

export default function Step1Name() {
  const router = useRouter();
  const draft = useStore((st) => st.draft);
  const setDraft = useStore((st) => st.setDraft);
  const [displayName, setDisplayName] = useState(draft.displayName);
  const [username, setUsername] = useState(draft.username);

  const next = () => {
    setDraft({ displayName: displayName.trim(), username: username.trim().replace(/\s+/g, '_') });
    router.push('/onboarding/step2-basics');
  };

  return (
    <OnboardingScaffold
      step={1}
      total={6}
      title="What should we call you?"
      subtitle="This is how you'll show up to your future connections."
      onNext={next}
      nextDisabled={displayName.trim().length < 2}
      canGoBack={false}
    >
      <Text style={s.label}>DISPLAY NAME</Text>
      <TextInput
        style={[s.input, { marginTop: 6, marginBottom: spacing.lg }]}
        placeholder="e.g. Riley"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={setDisplayName}
        autoFocus
      />

      <Text style={s.label}>USERNAME</Text>
      <TextInput
        style={[s.input, { marginTop: 6 }]}
        placeholder="e.g. riley (optional)"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
        Leave blank and we'll generate one for you.
      </Text>
    </OnboardingScaffold>
  );
}
