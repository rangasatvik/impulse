import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoodPicker } from '../../components/MoodPicker';
import { GradientButton } from '../../components/ui';
import { MOOD_PREFERENCES } from '../../lib/constants';
import { colors, radius, s, spacing } from '../../lib/theme';
import { Mood } from '../../lib/types';
import { useStore } from '../../stores/appStore';

export default function MoodCheck() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentMood = useStore((st) => (st.currentUserId ? st.currentMood[st.currentUserId] : undefined));
  const setMood = useStore((st) => st.setMood);
  const [selected, setSelected] = useState<Mood | undefined>(currentMood);
  const [note, setNote] = useState('');

  const save = () => {
    if (!selected) return;
    setMood(selected, note.trim() || undefined);
    router.back();
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top + 8 }]}>
      <View style={{ paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <Text style={s.h2}>How are you feeling?</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 24 }}>
        <Text style={[s.body, { marginBottom: spacing.xl }]}>
          Your agent uses your mood to tune today's feed and the kind of people it surfaces.
        </Text>

        <MoodPicker selected={selected} onSelect={setSelected} />

        {selected && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={{ backgroundColor: colors.primary + '14', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.primary + '33', marginBottom: spacing.lg }}>
              <Text style={s.agentText}>Got it — I'll lean your feed toward {MOOD_PREFERENCES[selected]}.</Text>
            </View>
            <Text style={s.label}>ADD A NOTE (OPTIONAL)</Text>
            <TextInput
              style={[s.input, { marginTop: 6, height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="What's behind this feeling?"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 16 }}>
        <GradientButton title="Save mood" onPress={save} disabled={!selected} />
      </View>
    </View>
  );
}
