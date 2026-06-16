import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AgentAvatar } from '../../components/AgentAvatar';
import { OnboardingScaffold } from '../../components/Onboarding';
import { colors, s, spacing } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

const SUGGESTIONS = ['Echo', 'Nova', 'Sage', 'Pixel', 'Juno', 'Atlas', 'Wren', 'Vibe'];

export default function Step3AgentName() {
  const router = useRouter();
  const draft = useStore((st) => st.draft);
  const setDraft = useStore((st) => st.setDraft);
  const [name, setName] = useState(draft.agentName);

  const next = () => {
    setDraft({ agentName: name.trim() || 'Nova' });
    router.push('/onboarding/step4-personality');
  };

  return (
    <OnboardingScaffold
      step={3}
      total={6}
      title="Name your AI agent"
      subtitle="This is your digital twin. It learns who you are, then meets other agents on your behalf."
      onNext={next}
      nextDisabled={name.trim().length < 1}
    >
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <AgentAvatar agent={{ name: name || 'AI', energyLevel: 'medium' }} size={88} />
        <Text style={[s.h3, { marginTop: 10 }]}>{name || 'Your agent'}</Text>
      </View>

      <Text style={s.label}>AGENT NAME</Text>
      <TextInput
        style={[s.input, { marginTop: 6, marginBottom: spacing.lg }]}
        placeholder="Give it a name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        maxLength={16}
      />

      <Text style={s.label}>OR PICK ONE</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {SUGGESTIONS.map((sug) => (
          <Pressable
            key={sug}
            onPress={() => setName(sug)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: name === sug ? colors.primary : colors.surfaceElevated,
              borderWidth: 1,
              borderColor: name === sug ? colors.primaryLight : colors.border,
            }}
          >
            <Text style={{ color: name === sug ? '#fff' : colors.textSecondary, fontWeight: '700' }}>{sug}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingScaffold>
  );
}
