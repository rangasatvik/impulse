import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { OnboardingScaffold } from '../../components/Onboarding';
import { Chip } from '../../components/ui';
import { INTERESTS } from '../../lib/constants';
import { colors } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

const MIN = 5;

export default function Step5Interests() {
  const router = useRouter();
  const draft = useStore((st) => st.draft);
  const setDraft = useStore((st) => st.setDraft);
  const createAgent = useStore((st) => st.createAgentFromDraft);
  const [selected, setSelected] = useState<string[]>(draft.interests);

  const toggle = (tag: string) =>
    setSelected((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));

  const next = () => {
    setDraft({ interests: selected });
    // build the agent now so the next step can chat with a real agent
    createAgent();
    router.push('/onboarding/step6-agent-chat');
  };

  return (
    <OnboardingScaffold
      step={5}
      total={6}
      title="What are you into?"
      subtitle={`Pick at least ${MIN}. The more you choose, the sharper your matches.`}
      onNext={next}
      nextLabel={selected.length >= MIN ? `Continue (${selected.length})` : `Pick ${MIN - selected.length} more`}
      nextDisabled={selected.length < MIN}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {INTERESTS.map((i) => (
          <Chip
            key={i.tag}
            label={i.tag}
            emoji={i.emoji}
            selected={selected.includes(i.tag)}
            onPress={() => toggle(i.tag)}
          />
        ))}
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 18 }}>
        {selected.length} selected
      </Text>
    </OnboardingScaffold>
  );
}
