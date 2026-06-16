import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import { colors, radius, s, spacing } from '../../lib/theme';
import { useMyAgent, useStore } from '../../stores/appStore';

export default function Training() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const agent = useMyAgent();
  const addTrainingTurn = useStore((st) => st.addTrainingTurn);
  const trainingMessages = useStore((st) => (agent ? st.trainingMessages[agent.id] ?? [] : []));
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  if (!agent) return null;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    addTrainingTurn(t);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.screen}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={s.row}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 8 }}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </Pressable>
          <AgentAvatar agent={agent} size={40} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.h3}>Training {agent.name}</Text>
            <Text style={s.label}>{agent.trainingTurns} turns · the more you share, the sharper your matches</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {trainingMessages.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={[s.body, { textAlign: 'center', maxWidth: 280 }]}>
              Pick up where you left off. Tell {agent.name} about your day, your people, or what's on your mind.
            </Text>
          </View>
        )}
        {trainingMessages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <View key={m.id} style={{ flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: spacing.md }}>
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
                <Text style={{ color: isUser ? '#fff' : colors.textPrimary, fontSize: 15, lineHeight: 21, fontStyle: isUser ? 'normal' : 'italic' }}>{m.content}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={[s.row, { gap: 8 }]}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder={`Tell ${agent.name} something...`}
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            returnKeyType="send"
            multiline
          />
          <Pressable onPress={send} style={{ width: 50, height: 50, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
