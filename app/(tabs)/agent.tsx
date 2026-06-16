import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AgentAvatar } from '../../components/AgentAvatar';
import {
  MemoryCard,
  PrivacyToggleRow,
  SafetyNotice,
  ScreenContainer,
  SectionHeader,
  TraitChip,
} from '../../components/aurora';
import { GradientButton, OutlineButton } from '../../components/ui';
import { DEFAULT_MEMORIES } from '../../lib/productData';
import { colors, gradients, radius, s, shadow, spacing } from '../../lib/theme';
import { useMyAgent, useStore } from '../../stores/appStore';

const TABS = ['Personality', 'Memory', 'Avatar', 'Voice', 'Privacy'] as const;
type StudioTab = (typeof TABS)[number];

const TONES = [
  { label: 'Gentle coach', icon: 'heart' as const, sample: 'Start simple. Ask one real question and let it breathe.' },
  { label: 'Funny guide', icon: 'happy' as const, sample: 'Open with a tiny joke, then give them an easy thing to answer.' },
  { label: 'Thoughtful listener', icon: 'ear' as const, sample: 'Reflect what they said first, then ask a deeper follow-up.' },
  { label: 'Direct strategist', icon: 'flash' as const, sample: 'Lead with shared context and a clear low-pressure invite.' },
];

export default function AgentStudio() {
  const router = useRouter();
  const agent = useMyAgent();
  const conversations = useStore((st) => st.conversations);
  const matches = useStore((st) => st.matches);
  const [tab, setTab] = useState<StudioTab>('Personality');
  const [privacy, setPrivacy] = useState({
    interests: true,
    memory: true,
    events: true,
    mood: true,
  });

  const agentConversations = agent
    ? Object.values(conversations).filter((conversation) => conversation.agentAId === agent.id || conversation.agentBId === agent.id)
    : [];
  const matchesFound = Object.values(matches).filter((match) => {
    const conversation = conversations[match.agentConversationId];
    return agent && (conversation?.agentAId === agent.id || conversation?.agentBId === agent.id);
  }).length;

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="AGENT STUDIO"
        title={agent?.name ?? 'Your AI social agent'}
        subtitle="Tune how your agent learns, remembers, and represents your social style."
      />

      <LinearGradient colors={gradients.agent} style={{ borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.floating }}>
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <AgentAvatar agent={agent} size={92} moodEmoji="✨" />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={{ color: '#fff', fontSize: 24, lineHeight: 29, fontWeight: '900' }}>{agent?.name ?? 'Agent'}</Text>
            <Text style={{ color: colors.blush, fontSize: 14, lineHeight: 20, marginTop: 5 }}>
              {agent?.agentBio || 'Your agent is forming from your onboarding answers.'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <StudioMetric value={`${agent?.trainingTurns ?? 0}`} label="Training turns" />
          <StudioMetric value={`${matchesFound}`} label="Matches found" />
          <StudioMetric value={`${agentConversations.length}`} label="Agent talks" />
        </View>
      </LinearGradient>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg }}>
        {TABS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            accessibilityRole="button"
            style={{
              minHeight: 38,
              paddingHorizontal: 13,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tab === item ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: tab === item ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: tab === item ? '#fff' : colors.textPrimary, fontSize: 12, fontWeight: '900' }}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'Personality' ? <PersonalityTab agent={agent} /> : null}
      {tab === 'Memory' ? <MemoryTab /> : null}
      {tab === 'Avatar' ? <AvatarTab agent={agent} /> : null}
      {tab === 'Voice' ? <VoiceTab /> : null}
      {tab === 'Privacy' ? (
        <PrivacyTab
          privacy={privacy}
          setPrivacy={(key) => setPrivacy((current) => ({ ...current, [key]: !current[key] }))}
        />
      ) : null}

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <GradientButton title="Continue training" icon="chatbubbles" onPress={() => router.push('/agent/training')} />
        <OutlineButton title="View agent activity" icon="git-compare" onPress={() => router.push('/(tabs)/discover')} />
      </View>
    </ScreenContainer>
  );
}

function PersonalityTab({ agent }: { agent: ReturnType<typeof useMyAgent> }) {
  const traits = [
    ['Humor', agent?.vector.humor ?? 0.45, colors.accent],
    ['Warmth', agent?.vector.expressiveness ?? 0.55, colors.primaryLight],
    ['Depth', agent?.vector.depth ?? 0.5, colors.ai],
    ['Confidence', agent?.vector.sociability ?? 0.48, colors.info],
    ['Spontaneity', agent?.vector.openness ?? 0.52, colors.success],
    ['Listening style', agent?.communicationStyle === 'empathetic' ? 0.86 : 0.62, colors.safety],
  ] as const;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={s.card}>
        <Text style={s.h3}>Personality breakdown</Text>
        <Text style={[s.body, { marginTop: 5 }]}>These signals shape recommendations and Co-Pilot tone.</Text>
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {traits.map(([label, value, color]) => (
            <TraitMeter key={label} label={label} value={Math.round(value * 100)} color={color} />
          ))}
        </View>
      </View>
      <View style={s.cardElevated}>
        <Text style={s.h3}>Agent voice preview</Text>
        <Text style={[s.agentText, { marginTop: 8 }]}>
          “I found someone who shares your pace and your interest in {agent?.interests?.[0] ?? 'building things'}. Want a warm intro that feels casual?”
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(agent?.values ?? ['kindness', 'curiosity', 'growth']).slice(0, 6).map((value) => (
          <TraitChip key={value} label={value} color={colors.ai} />
        ))}
      </View>
    </View>
  );
}

function MemoryTab() {
  return (
    <View>
      <SectionHeader title="What your agent remembers" subtitle="Every memory can be edited, deleted, or kept private." />
      {DEFAULT_MEMORIES.map((memory) => (
        <MemoryCard key={memory.id} memory={memory} />
      ))}
      <SafetyNotice compact />
    </View>
  );
}

function AvatarTab({ agent }: { agent: ReturnType<typeof useMyAgent> }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={[s.cardElevated, { alignItems: 'center' }]}>
        <AgentAvatar agent={agent} size={118} moodEmoji="✨" />
        <Text style={[s.h3, { marginTop: spacing.md }]}>Aurora avatar</Text>
        <Text style={[s.body, { textAlign: 'center', marginTop: 5 }]}>Animated circles keep the MVP polished without needing a 3D avatar pipeline.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.h3}>Theme options</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.md }}>
          {[colors.primary, colors.accent, colors.ai, colors.info, colors.safety].map((color) => (
            <View key={color} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color, borderWidth: 3, borderColor: '#fff' }} />
          ))}
          <TraitChip label="Premium expressions" icon="lock-closed" color={colors.premium} />
        </View>
      </View>
    </View>
  );
}

function VoiceTab() {
  return (
    <View style={{ gap: spacing.md }}>
      {TONES.map((tone) => (
        <View key={tone.label} style={s.card}>
          <View style={[s.row, { alignItems: 'flex-start' }]}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary + '14', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
              <Ionicons name={tone.icon} size={19} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.h3}>{tone.label}</Text>
              <Text style={[s.agentText, { marginTop: 6 }]}>“{tone.sample}”</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function PrivacyTab({
  privacy,
  setPrivacy,
}: {
  privacy: { interests: boolean; memory: boolean; events: boolean; mood: boolean };
  setPrivacy: (key: keyof typeof privacy) => void;
}) {
  return (
    <View style={s.card}>
      <Text style={s.h3}>Safety & Privacy Center</Text>
      <Text style={[s.body, { marginTop: 5, marginBottom: spacing.md }]}>You control what your agent remembers and uses for matching.</Text>
      <PrivacyToggleRow
        title="Use interests for matching"
        detail="Helps find people, groups, and events with shared context."
        enabled={privacy.interests}
        onPress={() => setPrivacy('interests')}
      />
      <PrivacyToggleRow
        title="Remember chat insights"
        detail="Lets your agent improve warm intros. Private by default."
        enabled={privacy.memory}
        onPress={() => setPrivacy('memory')}
      />
      <PrivacyToggleRow
        title="Event recommendations"
        detail="Suggests low-pressure campus opportunities."
        enabled={privacy.events}
        onPress={() => setPrivacy('events')}
      />
      <PrivacyToggleRow
        title="Mood-based personalization"
        detail="Uses today's check-in to rank suggestions more gently."
        enabled={privacy.mood}
        onPress={() => setPrivacy('mood')}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        <SmallControl label="Download data" icon="download" />
        <SmallControl label="Clear memory" icon="trash" danger />
      </View>
    </View>
  );
}

function StudioMetric({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF24', borderWidth: 1, borderColor: '#FFFFFF33', borderRadius: radius.lg, padding: spacing.md }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: colors.blush, fontSize: 11, fontWeight: '800', marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function TraitMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View>
      <View style={[s.row, { justifyContent: 'space-between', marginBottom: 5 }]}>
        <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '900' }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '900' }}>{value}%</Text>
      </View>
      <View style={{ height: 9, borderRadius: 5, backgroundColor: colors.blush, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(100, value)}%`, height: 9, borderRadius: 5, backgroundColor: color }} />
      </View>
    </View>
  );
}

function SmallControl({ label, icon, danger }: { label: string; icon: keyof typeof Ionicons.glyphMap; danger?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={{
        flex: 1,
        minHeight: 46,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: danger ? colors.error + '40' : colors.border,
        backgroundColor: danger ? colors.error + '10' : colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}
    >
      <Ionicons name={icon} size={16} color={danger ? colors.error : colors.textPrimary} style={{ marginRight: 6 }} />
      <Text style={{ color: danger ? colors.error : colors.textPrimary, fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}
