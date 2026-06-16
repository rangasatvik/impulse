import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';

import { colors, energyGradient } from '../lib/theme';
import { Agent } from '../lib/types';

const useNativeDriver = Platform.OS !== 'web';

// Pulsing circular avatar for an AI agent. Uses the built-in Animated API (works
// everywhere including Expo web) for a gentle breathing ring.
export function AgentAvatar({
  agent,
  size = 64,
  active = true,
  moodEmoji,
}: {
  agent?: Pick<Agent, 'name' | 'energyLevel'> | null;
  size?: number;
  active?: boolean;
  moodEmoji?: string;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const grad = energyGradient(agent?.energyLevel);
  const initials = (agent?.name ?? 'AI')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={{ width: size * 1.4, height: size * 1.4, alignItems: 'center', justifyContent: 'center' }}>
      {active && (
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: grad[0],
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          }}
        />
      )}
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.34 }}>{initials}</Text>
      </LinearGradient>
      {moodEmoji ? (
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.15,
            right: size * 0.15,
            backgroundColor: colors.background,
            borderRadius: 12,
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ fontSize: size * 0.28 }}>{moodEmoji}</Text>
        </View>
      ) : null}
    </View>
  );
}
