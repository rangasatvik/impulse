import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { MOODS } from '../lib/constants';
import { colors, radius } from '../lib/theme';
import { Mood } from '../lib/types';

// Grid of mood options with emoji + label and an animated-feel selection state.
export function MoodPicker({
  selected,
  onSelect,
}: {
  selected?: Mood;
  onSelect: (m: Mood) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
      {MOODS.map((m) => {
        const isSel = selected === m.mood;
        return (
          <Pressable
            key={m.mood}
            onPress={() => onSelect(m.mood)}
            style={({ pressed }) => ({
              width: 96,
              paddingVertical: 16,
              borderRadius: radius.lg,
              alignItems: 'center',
              backgroundColor: isSel ? colors.primary : colors.surfaceElevated,
              borderWidth: 1.5,
              borderColor: isSel ? colors.primaryLight : colors.border,
              transform: [{ scale: pressed ? 0.96 : isSel ? 1.02 : 1 }],
            })}
          >
            <Text style={{ fontSize: 30, marginBottom: 6 }}>{m.emoji}</Text>
            <Text
              style={{
                color: isSel ? '#fff' : colors.textSecondary,
                fontWeight: isSel ? '800' : '600',
                fontSize: 13,
              }}
            >
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
