import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { OnboardingScaffold } from '../../components/Onboarding';
import { PERSONALITY_QUESTIONS } from '../../lib/constants';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

export default function Step4Personality() {
  const router = useRouter();
  const setDraft = useStore((st) => st.setDraft);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = PERSONALITY_QUESTIONS.every((q) => answers[q.id] != null);

  const next = () => {
    const effects = PERSONALITY_QUESTIONS.map((q) => q.options[answers[q.id]].effect);
    setDraft({ answers: effects });
    router.push('/onboarding/step5-interests');
  };

  return (
    <OnboardingScaffold
      step={4}
      total={6}
      title="Let's read your vibe"
      subtitle="Pick whatever feels most like you. Your agent uses this to find people you'll actually click with."
      onNext={next}
      nextLabel={allAnswered ? 'Continue' : `Answer all ${PERSONALITY_QUESTIONS.length}`}
      nextDisabled={!allAnswered}
    >
      {PERSONALITY_QUESTIONS.map((q, qi) => (
        <View key={q.id} style={{ marginBottom: spacing.xl }}>
          <Text style={[s.h3, { marginBottom: 12 }]}>
            {qi + 1}. {q.prompt}
          </Text>
          <View style={{ gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: radius.md,
                    backgroundColor: selected ? colors.primary + '22' : colors.surface,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : colors.borderLight,
                      backgroundColor: selected ? colors.primary : 'transparent',
                      marginRight: 12,
                    }}
                  />
                  <Text style={{ color: selected ? colors.textPrimary : colors.textSecondary, fontSize: 15, fontWeight: selected ? '700' : '500' }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </OnboardingScaffold>
  );
}
