import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { OnboardingScaffold } from '../../components/Onboarding';
import { useToast } from '../../components/Toast';
import { colors, s, spacing } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

export default function Step2Basics() {
  const router = useRouter();
  const toast = useToast();
  const draft = useStore((st) => st.draft);
  const setDraft = useStore((st) => st.setDraft);
  const [age, setAge] = useState(draft.age);
  const [bio, setBio] = useState(draft.bio);

  const next = () => {
    const n = parseInt(age, 10);
    if (!n || n < 15 || n > 100) {
      toast('Enter an age between 15 and 100.', 'error');
      return;
    }
    setDraft({ age, bio: bio.trim() });
    router.push('/onboarding/step3-agent-name');
  };

  return (
    <OnboardingScaffold
      step={2}
      total={6}
      title="The basics"
      subtitle="A couple of details to round out your profile."
      onNext={next}
      nextDisabled={!age}
    >
      <Text style={s.label}>AGE</Text>
      <TextInput
        style={[s.input, { marginTop: 6, marginBottom: spacing.lg }]}
        placeholder="e.g. 18"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
        maxLength={3}
      />

      <Text style={s.label}>SHORT BIO</Text>
      <TextInput
        style={[s.input, { marginTop: 6, height: 110, textAlignVertical: 'top', paddingTop: 14 }]}
        placeholder="Tell people a little about you... (optional)"
        placeholderTextColor={colors.textMuted}
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={160}
      />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8, textAlign: 'right' }}>
        {bio.length}/160
      </Text>
    </OnboardingScaffold>
  );
}
