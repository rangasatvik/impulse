import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '../../components/ui';
import { SafetyNotice, TraitChip } from '../../components/aurora';
import { FREE_LIMITS, usePermissions } from '../../lib/permissions';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useStore } from '../../stores/appStore';

export default function CopilotModal() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const permissions = usePermissions();

  const consumeCopilot = useStore((st) => st.consumeCopilot);
  const getCopilot = useStore((st) => st.getCopilot);
  const setPendingChatText = useStore((st) => st.setPendingChatText);

  const decided = useRef(false);
  const [result, setResult] = useState<{
    allowed: boolean;
    data?: { suggestions: string[]; tip: string };
  } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (decided.current) return;
    decided.current = true;
    const allowed = consumeCopilot();
    setResult({ allowed, data: allowed && matchId ? getCopilot(matchId) : undefined });
  }, [consumeCopilot, getCopilot, matchId]);

  const use = (text: string) => {
    setPicked(text);
    setPendingChatText(text);
    setTimeout(() => router.back(), 220);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top + 8 }]}>
      <View style={{ paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <View style={s.row}>
          <Ionicons name="color-wand" size={22} color={colors.primaryLight} />
          <Text style={[s.h2, { marginLeft: 10 }]}>Co-Pilot</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 24 }}>
        {!result ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <ActivityIndicator color={colors.primaryLight} size="large" />
            <Text style={[s.body, { marginTop: spacing.md }]}>Preparing suggestions...</Text>
          </View>
        ) : !result.allowed ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🪄</Text>
              <Text style={[s.h3, { textAlign: 'center' }]}>
                You've used your {FREE_LIMITS.copilotUsesPerDay} free Co-Pilot assists today
              </Text>
            <Text style={[s.body, { textAlign: 'center', marginTop: 8, marginBottom: spacing.xl, maxWidth: 300 }]}>
              Premium unlocks unlimited Co-Pilot suggestions so you never get stuck mid-conversation.
            </Text>
            <GradientButton title="Unlock Premium" icon="star" onPress={() => { router.back(); router.push('/premium'); }} />
          </View>
        ) : (
          <>
            <Text style={[s.body, { marginBottom: spacing.md }]}>
              Tap a suggestion to insert it into your message box. Co-Pilot never sends for you.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg }}>
              <TraitChip label="Playful" color={colors.accent} />
              <TraitChip label="Warm" color={colors.primaryLight} />
              <TraitChip label="Curious" color={colors.ai} />
            </View>
            {result.data?.suggestions.map((sug, i) => (
              <Pressable
                key={i}
                onPress={() => use(sug)}
                style={{
                  backgroundColor: picked === sug ? colors.primary : colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: picked === sug ? colors.primaryLight : colors.border,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1, paddingRight: spacing.md }}>
                  <Text style={{ color: picked === sug ? '#fff' : colors.textMuted, fontSize: 11, fontWeight: '900', marginBottom: 4 }}>
                    {i === 0 ? 'PLAYFUL REPLY' : i === 1 ? 'WARM REPLY' : 'CURIOUS REPLY'}
                  </Text>
                  <Text style={{ color: picked === sug ? '#fff' : colors.textPrimary, fontSize: 15, lineHeight: 21 }}>{sug}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={22} color={picked === sug ? '#fff' : colors.primaryLight} />
              </Pressable>
            ))}

            <View style={{ marginTop: spacing.md, backgroundColor: colors.accent + '14', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.accent + '40' }}>
              <View style={[s.row, { marginBottom: 6 }]}>
                <Ionicons name="bulb" size={16} color={colors.accent} />
                <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12, marginLeft: 6, letterSpacing: 0.5 }}>RELATIONAL INSIGHT</Text>
              </View>
              <Text style={[s.body, { color: colors.textPrimary }]}>{result.data?.tip}</Text>
            </View>

            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <View style={[s.card, { backgroundColor: colors.ai + '10', borderColor: colors.ai + '35' }]}>
                <View style={[s.row, { marginBottom: 6 }]}>
                  <Ionicons name="git-branch" size={16} color={colors.ai} />
                  <Text style={{ color: colors.ai, fontWeight: '900', fontSize: 12, marginLeft: 6 }}>CONVERSATION BRIDGE</Text>
                </View>
                <Text style={s.body}>Ask about the shared interest your agents noticed, then keep the invite low-pressure.</Text>
              </View>
              <View style={[s.card, { backgroundColor: colors.safety + '10', borderColor: colors.safety + '35' }]}>
                <View style={[s.row, { marginBottom: 6 }]}>
                  <Ionicons name="bookmark" size={16} color={colors.safety} />
                  <Text style={{ color: colors.safety, fontWeight: '900', fontSize: 12, marginLeft: 6 }}>MEMORY CALLBACK</Text>
                </View>
                <Text style={s.body}>If they mentioned a test, project, or event, ask how it went before changing topics.</Text>
              </View>
              <View style={[s.card, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '35' }]}>
                <View style={[s.row, { marginBottom: 6 }]}>
                  <Ionicons name="heart" size={16} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 12, marginLeft: 6 }}>CONFIDENCE BOOST</Text>
                </View>
                <Text style={s.body}>You do not need the perfect message. Simple, specific, and kind is enough.</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md }}>
              <TraitChip label="Keep it casual" icon="chatbubble" color={colors.info} />
              <TraitChip label="No flirting suggestions" icon="shield-checkmark" color={colors.safety} />
              <TraitChip label="No AI help for this chat" icon="close-circle" color={colors.textMuted} />
            </View>

            {!permissions.isPremium && (
              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.lg }}>
                Free plan: {FREE_LIMITS.copilotUsesPerDay} Co-Pilot uses per day. Premium unlocks unlimited.
              </Text>
            )}
            <View style={{ marginTop: spacing.lg }}>
              <SafetyNotice compact />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
