import React from 'react';
import { Text, View } from 'react-native';

import { colors, radius, spacing } from '../lib/theme';
import { AgentConversation } from '../lib/types';
import { AgentAvatar } from './AgentAvatar';

// Renders an agent-to-agent conversation log in a "dual bubble" screenplay style,
// showing which agent said what.
export function AgentConversationViewer({
  conversation,
  agentAName,
  agentBName,
}: {
  conversation: AgentConversation;
  agentAName: string;
  agentBName: string;
}) {
  return (
    <View>
      {conversation.conversationLog.map((turn, i) => {
        const isA = turn.role === 'agent_a';
        const name = isA ? agentAName : agentBName;
        return (
          <View
            key={i}
            style={{
              flexDirection: isA ? 'row' : 'row-reverse',
              alignItems: 'flex-end',
              marginBottom: spacing.md,
            }}
          >
            <AgentAvatar
              agent={{ name, energyLevel: isA ? 'low' : 'high' }}
              size={30}
              active={false}
            />
            <View
              style={{
                maxWidth: '78%',
                marginHorizontal: 8,
                backgroundColor: isA ? colors.surfaceElevated : colors.primary,
                borderRadius: radius.lg,
                borderBottomLeftRadius: isA ? 4 : radius.lg,
                borderBottomRightRadius: isA ? radius.lg : 4,
                paddingVertical: 9,
                paddingHorizontal: 13,
              }}
            >
              <Text
                style={{
                  color: isA ? colors.primaryLight : '#fff',
                  fontSize: 11,
                  fontWeight: '800',
                  marginBottom: 2,
                }}
              >
                {name}
              </Text>
              <Text style={{ color: isA ? colors.textPrimary : '#fff', fontSize: 14, lineHeight: 19 }}>
                {turn.content}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
