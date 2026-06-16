import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
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

import { AgentAvatar } from '../../components/AgentAvatar';
import { GradientButton } from '../../components/ui';
import { AGENT_OPENER } from '../../lib/constants';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useMyAgent, useStore } from '../../stores/appStore';

const REQUIRED = 5;

export default function Step6AgentChat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const agent = useMyAgent();
  const addTrainingTurn = useStore((st) => st.addTrainingTurn);
  const trainingMessages = useStore((st) => (agent ? st.trainingMessages[agent.id] ?? [] : []));
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const userTurns = useMemo(
    () => trainingMessages.filter((m) => m.role === 'user').length,
    [trainingMessages]
  );
  const canContinue = userTurns >= REQUIRED;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    addTrainingTurn(t);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  if (!agent) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.screen}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={s.row}>
          <AgentAvatar agent={agent} size={40} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.h3}>{agent.name}</Text>
            <Text style={s.label}>Training · {userTurns}/{REQUIRED} exchanges</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <Bubble role="assistant" text={AGENT_OPENER} />
        {trainingMessages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.content} />
        ))}
        {canContinue && (
          <View style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.success + '55' }}>
            <Text style={{ color: colors.success, fontWeight: '700', textAlign: 'center' }}>
              ✨ {agent.name} has enough to get started. You can keep chatting or continue.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 12, paddingTop: 8, gap: 10 }}>
        <View style={[s.row, { gap: 8 }]}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="Tell your agent about yourself..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={{ width: 50, height: 50, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={22} color="#fff" />
          </Pressable>
        </View>
        {canContinue && (
          <GradientButton title="Continue" icon="checkmark" onPress={() => router.push('/onboarding/complete')} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user';
  return (
    <View style={{ flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: spacing.md }}>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: isUser ? colors.primary : colors.surfaceElevated,
          borderRadius: radius.lg,
          borderBottomRightRadius: isUser ? 4 : radius.lg,
          borderBottomLeftRadius: isUser ? radius.lg : 4,
          paddingVertical: 10,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ color: isUser ? '#fff' : colors.textPrimary, fontSize: 15, lineHeight: 21, fontStyle: isUser ? 'normal' : 'italic' }}>
          {text}
        </Text>
      </View>
    </View>
  );
}
