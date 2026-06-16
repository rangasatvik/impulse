import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { AgentAvatar } from '../../components/AgentAvatar';
import { Chip, GradientButton, OutlineButton } from '../../components/ui';
import { interestEmoji } from '../../lib/constants';
import { colors, radius, s, spacing } from '../../lib/theme';
import { useCurrentProfile, useMyAgent, useStore } from '../../stores/appStore';

export default function MyAgent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useCurrentProfile();
  const agent = useMyAgent();
  const conversations = useStore((st) => st.conversations);
  const matches = useStore((st) => st.matches);
  const profiles = useStore((st) => st.profiles);
  const agents = useStore((st) => st.agents);

  const myConvos = useMemo(() => {
    if (!agent) return [];
    return Object.values(conversations)
      .filter((c) => c.agentAId === agent.id || c.agentBId === agent.id)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [conversations, agent]);

  const matchCount = useMemo(
    () => Object.values(matches).filter((m) => m.userAId === profile?.id || m.userBId === profile?.id).length,
    [matches, profile?.id]
  );

  if (!agent) return null;

  const visibleConvos = profile?.isPremium ? myConvos : myConvos.slice(0, 1);

  const radar = [
    { label: 'Humor', value: agent.vector.humor },
    { label: 'Energy', value: agent.vector.energy },
    { label: 'Openness', value: agent.vector.openness },
    { label: 'Depth', value: agent.vector.depth },
    { label: 'Express', value: agent.vector.expressiveness },
  ];

  const otherName = (c: (typeof myConvos)[number]) => {
    const otherAgentId = c.agentAId === agent.id ? c.agentBId : c.agentAId;
    const other = Object.values(agents).find((a) => a.id === otherAgentId);
    const op = other ? profiles[other.userId] : undefined;
    return op?.displayName ?? other?.name ?? 'an agent';
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm }}>
        <AgentAvatar agent={agent} size={110} moodEmoji="✨" />
        <Text style={[s.h1, { marginTop: spacing.md }]}>{agent.name}</Text>
        <Text style={[s.agentText, { textAlign: 'center', marginTop: 8, maxWidth: 340 }]}>{agent.personalitySummary}</Text>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.md }}>
        <Stat label="Training turns" value={agent.trainingTurns} />
        <Stat label="Matches found" value={matchCount} />
        <Stat label="Agent chats" value={myConvos.length} />
      </View>

      {/* Radar */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <Text style={[s.label, { marginBottom: spacing.md }]}>PERSONALITY BREAKDOWN</Text>
        <View style={[s.card, { alignItems: 'center' }]}>
          <RadarChart data={radar} />
        </View>
      </View>

      {/* Values + interests */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <Text style={[s.label, { marginBottom: spacing.md }]}>VALUES</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {agent.values.map((v) => (
            <Chip key={v} label={v} small />
          ))}
        </View>
        <Text style={[s.label, { marginBottom: spacing.md, marginTop: spacing.lg }]}>INTERESTS</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {agent.interests.map((i) => (
            <Chip key={i} label={i} emoji={interestEmoji(i)} small />
          ))}
        </View>
      </View>

      {/* Recent agent activity */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
        <Text style={[s.label, { marginBottom: spacing.md }]}>RECENT AGENT CONVERSATIONS</Text>
        {visibleConvos.length === 0 ? (
          <Text style={s.body}>No agent conversations yet. Start one from Discover.</Text>
        ) : (
          visibleConvos.map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/agent/conversation/${c.id}`)} style={[s.card, s.row, { marginBottom: spacing.sm }]}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.primaryLight, fontWeight: '800' }}>{c.compatibilityScore}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={s.bodyStrong}>{c.status === 'matched' ? '🔥 Matched' : 'Checked'} with {otherName(c)}</Text>
                <Text style={[s.label, { marginTop: 2 }]} numberOfLines={1}>{c.summary}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))
        )}
        {!profile?.isPremium && myConvos.length > 1 && (
          <Pressable onPress={() => router.push('/premium')} style={{ padding: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 13 }}>
              🔒 Unlock all {myConvos.length} conversation logs with Premium
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: 12 }}>
        <GradientButton title="Continue Training" icon="chatbubbles" onPress={() => router.push('/agent/training')} />
        <OutlineButton title="View Agent Activity" icon="pulse" onPress={() => router.push('/(tabs)/discover')} />
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function RadarChart({ data }: { data: { label: string; value: number }[] }) {
  const size = 220;
  const center = size / 2;
  const maxR = size / 2 - 34;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => ({
    x: center + Math.cos(angle(i)) * r,
    y: center + Math.sin(angle(i)) * r,
  });

  const polygon = data.map((d, i) => {
    const p = point(i, maxR * Math.max(0.08, d.value));
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((ring, ri) => (
          <Polygon
            key={ri}
            points={data.map((_, i) => { const p = point(i, maxR * ring); return `${p.x},${p.y}`; }).join(' ')}
            stroke={colors.border}
            strokeWidth={1}
            fill="none"
          />
        ))}
        {data.map((_, i) => {
          const p = point(i, maxR);
          return <Line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke={colors.border} strokeWidth={1} />;
        })}
        <Polygon points={polygon} fill={colors.primary + '55'} stroke={colors.primaryLight} strokeWidth={2} />
        {data.map((d, i) => {
          const p = point(i, maxR * Math.max(0.08, d.value));
          return <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.primaryLight} />;
        })}
      </Svg>
      {data.map((d, i) => {
        const p = point(i, maxR + 16);
        return (
          <Text
            key={i}
            style={{ position: 'absolute', left: p.x - 30, top: p.y - 8, width: 60, textAlign: 'center', color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}
          >
            {d.label}
          </Text>
        );
      })}
    </View>
  );
}
