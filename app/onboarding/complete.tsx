import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AgentAvatar } from '../../components/AgentAvatar';
import { GradientButton } from '../../components/ui';
import { colors, gradients, s, spacing } from '../../lib/theme';
import { useMyAgent, useStore } from '../../stores/appStore';

const CONFETTI = ['🎉', '✨', '💫', '⚡', '🔮', '💜', '🌟'];
const useNativeDriver = Platform.OS !== 'web';

export default function Complete() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const agent = useMyAgent();
  const finishOnboarding = useStore((st) => st.finishOnboarding);
  const pieces = useRef(
    CONFETTI.map((e, i) => ({ emoji: e, x: 20 + ((i * 53) % 320), anim: new Animated.Value(0), delay: i * 180 }))
  ).current;

  useEffect(() => {
    pieces.forEach((p) => {
      Animated.loop(
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 4200,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver,
        })
      ).start();
    });
  }, [pieces]);

  const enter = () => {
    finishOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={gradients.welcome} style={{ flex: 1 }}>
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 760] });
        const rotate = p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
        return (
          <Animated.Text
            key={i}
            style={{ position: 'absolute', left: p.x, fontSize: 26, transform: [{ translateY }, { rotate }] }}
          >
            {p.emoji}
          </Animated.Text>
        );
      })}

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}>
        <AgentAvatar agent={agent} size={120} moodEmoji="✨" />
        <Text style={[s.h1, { marginTop: spacing.xl, textAlign: 'center' }]}>You're all set!</Text>
        <Text style={[s.body, { textAlign: 'center', marginTop: 12, maxWidth: 320 }]}>
          {agent?.name ?? 'Your agent'} now knows your vibe and is already out there meeting other agents. Let's find your people.
        </Text>

        <View style={{ marginTop: spacing.xl, padding: spacing.lg, backgroundColor: 'rgba(20,16,31,0.7)', borderRadius: 16, borderWidth: 1, borderColor: colors.border, width: '100%' }}>
          <Text style={[s.label, { marginBottom: 6 }]}>YOUR AGENT'S READ ON YOU</Text>
          <Text style={s.agentText}>{agent?.personalitySummary}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + 24 }}>
        <GradientButton title="Enter Impulse" icon="rocket" onPress={enter} />
      </View>
    </LinearGradient>
  );
}
