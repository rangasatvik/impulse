import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, compatibilityColor } from '../lib/theme';

// Circular progress ring showing a compatibility score, color-coded.
export function CompatibilityRing({
  score,
  size = 64,
  strokeWidth = 6,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const stroke = compatibilityColor(clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: size * 0.28 }}>
          {clamped}
        </Text>
        {label ? (
          <Text style={{ color: colors.textMuted, fontSize: size * 0.13, fontWeight: '600' }}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}
