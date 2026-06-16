import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '../../components/ui';
import { CompatibilityRing } from '../../components/CompatibilityRing';
import { SafetyNotice, TraitChip } from '../../components/aurora';
import { useToast } from '../../components/Toast';
import { usePermissions } from '../../lib/permissions';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useCurrentProfile, useStore } from '../../stores/appStore';

export default function MatchChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const profile = useCurrentProfile();
  const permissions = usePermissions();

  const match = useStore((st) => (id ? st.matches[id] : undefined));
  const messages = useStore((st) => (id ? st.messages[id] ?? [] : []));
  const profiles = useStore((st) => st.profiles);
  const conversations = useStore((st) => st.conversations);
  const sendMessage = useStore((st) => st.sendMessage);
  const markMatchRead = useStore((st) => st.markMatchRead);
  const pendingChatText = useStore((st) => st.pendingChatText);
  const setPendingChatText = useStore((st) => st.setPendingChatText);

  const [text, setText] = useState('');
  const [showReason, setShowReason] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const partnerId = match ? (match.userAId === profile?.id ? match.userBId : match.userAId) : undefined;
  const partner = partnerId ? profiles[partnerId] : undefined;
  const conversation = match ? conversations[match.agentConversationId] : undefined;

  // pull in a co-pilot suggestion if one was tapped
  useEffect(() => {
    if (pendingChatText) {
      setText(pendingChatText);
      setPendingChatText(null);
    }
  }, [pendingChatText, setPendingChatText]);

  useFocusEffect(
    useCallback(() => {
      if (id) markMatchRead(id);
    }, [id, markMatchRead])
  );

  // keep marking read as new messages arrive while open
  useEffect(() => {
    if (id) markMatchRead(id);
  }, [messages.length, id, markMatchRead]);

  if (!match || !profile) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.body}>This match is no longer available.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    sendMessage(match.id, t);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const remaining = permissions.isPremium ? '∞' : permissions.copilotRemaining;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.screen}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={s.row}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 8 }}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </Pressable>
          <Avatar name={partner?.displayName ?? '?'} colorIndex={partner?.avatarColorIndex ?? 0} size={40} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.h3}>{partner?.displayName}</Text>
            <Text style={s.label}>@{partner?.username} · warm intro ready</Text>
          </View>
          <CompatibilityRing score={match.compatibilityScore} size={42} strokeWidth={4} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Safety controls"
            onPress={() => toast('Safety menu is a frontend MVP placeholder.', 'info')}
            style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginLeft: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border }}
          >
            <Ionicons name="shield-checkmark" size={18} color={colors.safety} />
          </Pressable>
        </View>

        <Pressable onPress={() => setShowReason((v) => !v)} style={{ marginTop: spacing.md, backgroundColor: colors.primary + '18', borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.primary + '40', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="sparkles" size={13} color={colors.primaryLight} />
          <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
            Why this spark?
          </Text>
          <Ionicons name={showReason ? 'chevron-up' : 'chevron-down'} size={13} color={colors.primaryLight} style={{ marginLeft: 4 }} />
        </Pressable>
        {showReason && (
          <View style={{ marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: radius.md }}>
            <Text style={s.agentText}>{match.matchReason}</Text>
            {conversation ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: spacing.md }}>
                <TraitChip label={`Humor ${conversation.breakdown.humorCompatibility}%`} color={colors.accent} />
                <TraitChip label={`Values ${conversation.breakdown.valuesOverlap}%`} color={colors.safety} />
                <TraitChip label={`Conversation ${conversation.breakdown.communicationFit}%`} color={colors.ai} />
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', maxWidth: 280 }}>
            Your agents found a strong spark. Start simple and keep it human.
          </Text>
          <Pressable
            onPress={() => setText(match.icebreaker)}
            style={{ marginTop: 10, backgroundColor: colors.surfaceElevated, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>SUGGESTED ICEBREAKER · TAP TO USE</Text>
            <Text style={{ color: colors.textPrimary, fontStyle: 'italic' }}>"{match.icebreaker}"</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md, justifyContent: 'center' }}>
            {[
              'Ask about their current project',
              'Invite a low-pressure coffee chat',
              'React to the shared interest',
            ].map((move) => (
              <Pressable
                key={move}
                onPress={() => setText(move)}
                style={{ minHeight: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>{move}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {messages.map((m) => {
          const mine = m.senderId === profile.id;
          return (
            <View key={m.id} style={{ flexDirection: mine ? 'row-reverse' : 'row', marginBottom: spacing.sm }}>
              <View
                style={{
                  maxWidth: '78%',
                  backgroundColor: mine ? colors.primary : colors.surfaceElevated,
                  borderRadius: radius.lg,
                  borderBottomRightRadius: mine ? 4 : radius.lg,
                  borderBottomLeftRadius: mine ? radius.lg : 4,
                  paddingVertical: 9,
                  paddingHorizontal: 13,
                }}
              >
                <Text style={{ color: mine ? '#fff' : colors.textPrimary, fontSize: 15, lineHeight: 20 }}>{m.content}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <SafetyNotice compact />
        <View style={[s.row, { gap: 8 }]}>
          <Pressable
            onPress={() => router.push(`/modal/copilot?matchId=${match.id}`)}
            style={{ minWidth: 96, height: 46, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary + '55', flexDirection: 'row', paddingHorizontal: 12 }}
          >
            <Ionicons name="color-wand" size={20} color={colors.primaryLight} />
            <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '900', marginLeft: 6 }}>Co-Pilot</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '900', marginLeft: 5 }}>{remaining}</Text>
          </Pressable>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder={`Message ${partner?.displayName ?? ''}...`}
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            returnKeyType="send"
            multiline
          />
          <Pressable onPress={send} style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
