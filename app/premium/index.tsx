import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { colors, gradients, radius, s, spacing } from '../../lib/theme';
import { useCurrentProfile, useStore } from '../../stores/appStore';

const FREE = [
  'Basic AI agent',
  'Up to 5 discovery cards',
  '3 AI Co-Pilot uses / day',
  'Top 3 compatibility factors',
];

const PREMIUM = [
  'Advanced personality tuning',
  'Unlimited discovery',
  'Unlimited AI Co-Pilot',
  'Avatar Studio (colors & expressions)',
  'Full compatibility breakdown',
  'Priority matching',
  'Connection Score analytics',
];

const useNativeDriver = Platform.OS !== 'web';

export default function Premium() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const profile = useCurrentProfile();
  const upgrade = useStore((st) => st.upgradePremium);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver }),
      ])
    ).start();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  const confirm = () => {
    upgrade();
    toast('Premium unlocked! (mock payment — no real charge)', 'success');
    setTimeout(() => router.back(), 600);
  };

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradients.welcome} style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: spacing.lg }}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <LinearGradient colors={gradients.premium} style={{ paddingVertical: 8, paddingHorizontal: 18, borderRadius: radius.pill }}>
                <Text style={{ color: '#fff', fontWeight: '900', letterSpacing: 1 }}>★ IMPULSE PREMIUM</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={[s.h1, { marginTop: spacing.lg, textAlign: 'center', color: '#fff' }]}>
              Unlock deeper agent tuning.
            </Text>
            <Text style={[s.body, { textAlign: 'center', marginTop: 8, maxWidth: 320, color: colors.blush }]}>
              More detailed explanations, more Co-Pilot support, and richer avatar controls.
            </Text>
          </View>
        </LinearGradient>

        {profile?.isPremium ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={[s.h2, { marginTop: 12, textAlign: 'center' }]}>You're Premium!</Text>
            <Text style={[s.body, { textAlign: 'center', marginTop: 8 }]}>
              Advanced tuning is unlocked for this local demo.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {/* Free */}
              <View style={[s.card, { flex: 1 }]}>
                <Text style={s.h3}>Free</Text>
                <Text style={[s.label, { marginBottom: spacing.md }]}>Your current plan</Text>
                {FREE.map((f) => (
                  <View key={f} style={[s.row, { marginBottom: 8 }]}>
                    <Ionicons name="checkmark" size={15} color={colors.textMuted} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>{f}</Text>
                  </View>
                ))}
              </View>
              {/* Premium */}
              <LinearGradient colors={gradients.dark} style={{ flex: 1, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primary, padding: spacing.lg }}>
                <Text style={[s.h3, { color: '#fff' }]}>Premium</Text>
                <Text style={[s.label, { marginBottom: spacing.md, color: colors.blush }]}>$12 / month</Text>
                {PREMIUM.map((f) => (
                  <View key={f} style={[s.row, { marginBottom: 8 }]}>
                    <Ionicons name="checkmark-circle" size={15} color={colors.blush} style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontSize: 13, flex: 1 }}>{f}</Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          </View>
        )}
      </ScrollView>

      {!profile?.isPremium && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, paddingBottom: insets.bottom + 18, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }}>
          <GradientButton title="Upgrade for $12/month" icon="star" colorsOverride={gradients.premium} onPress={confirm} />
          <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
            Payments are mocked in this demo. No real charge.
          </Text>
        </View>
      )}
    </View>
  );
}
