import { Platform, StyleSheet } from 'react-native';

export const aurora = {
  name: 'Impulse Aurora',
  color: {
    impulseRed: '#E6392E',
    impulseOrange: '#FF7A1A',
    impulseCoral: '#FF5E6C',
    warmCream: '#FFF7F0',
    blush: '#FFE4DD',
    softPeach: '#FFD2B8',
    deepPlum: '#2A1028',
    charcoal: '#161316',
    mutedText: '#6F6268',
    cardWhite: '#FFFFFF',
    aiLavender: '#8E7CFF',
    trustBlue: '#4A90E2',
    safeGreen: '#38B48B',
    warningAmber: '#FFB020',
    danger: '#D92D20',
    plumMist: '#F4EAF2',
    peachMist: '#FFF0E6',
    border: 'rgba(42,16,40,0.10)',
    borderStrong: 'rgba(42,16,40,0.18)',
  },
  type: {
    hero: { fontSize: 34, lineHeight: 39, fontWeight: '900' as const },
    title: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
    section: { fontSize: 21, lineHeight: 27, fontWeight: '800' as const },
    cardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '800' as const },
    body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
    label: { fontSize: 12, lineHeight: 16, fontWeight: '800' as const },
    small: { fontSize: 12, lineHeight: 17, fontWeight: '600' as const },
  },
  spacing: {
    xxs: 3,
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 26,
    xxl: 36,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
    pill: 999,
  },
  motion: {
    fast: 160,
    base: 240,
    slow: 520,
  },
  z: {
    base: 0,
    floating: 20,
    modal: 50,
    toast: 1000,
  },
  size: {
    touch: 48,
    tabBar: 70,
    iconButton: 48,
    avatar: 56,
  },
};

export const semantic = {
  success: aurora.color.safeGreen,
  warning: aurora.color.warningAmber,
  danger: aurora.color.danger,
  info: aurora.color.trustBlue,
  premium: aurora.color.warningAmber,
  ai: aurora.color.aiLavender,
  safety: aurora.color.safeGreen,
};

export const colors = {
  background: aurora.color.warmCream,
  surface: aurora.color.cardWhite,
  surfaceElevated: '#FFFDF9',
  warmCream: aurora.color.warmCream,
  blush: aurora.color.blush,
  softPeach: aurora.color.softPeach,
  deepPlum: aurora.color.deepPlum,
  charcoal: aurora.color.charcoal,
  primary: aurora.color.impulseRed,
  primaryLight: aurora.color.impulseCoral,
  accent: aurora.color.impulseOrange,
  accentPink: aurora.color.impulseCoral,
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.danger,
  info: semantic.info,
  premium: semantic.premium,
  ai: semantic.ai,
  safety: semantic.safety,
  textPrimary: aurora.color.deepPlum,
  textSecondary: aurora.color.charcoal,
  textMuted: aurora.color.mutedText,
  border: aurora.color.border,
  borderLight: aurora.color.borderStrong,
  inverse: '#FFFFFF',
};

export const darkTheme = {
  background: aurora.color.charcoal,
  surface: '#21171F',
  surfaceElevated: '#2A1B28',
  textPrimary: '#FFF7F0',
  textSecondary: '#FFE4DD',
  textMuted: '#C8A9B5',
};

export const gradients = {
  brand: [aurora.color.impulseRed, aurora.color.impulseOrange] as const,
  brandSoft: [aurora.color.impulseCoral, aurora.color.impulseOrange] as const,
  aurora: [aurora.color.warmCream, aurora.color.blush, aurora.color.softPeach] as const,
  hero: [aurora.color.impulseRed, aurora.color.impulseOrange, aurora.color.deepPlum] as const,
  agent: [aurora.color.aiLavender, aurora.color.impulseCoral, aurora.color.impulseOrange] as const,
  premium: [aurora.color.warningAmber, aurora.color.impulseOrange, aurora.color.impulseRed] as const,
  safety: [aurora.color.safeGreen, aurora.color.trustBlue] as const,
  dark: [aurora.color.deepPlum, aurora.color.charcoal] as const,
  welcome: [aurora.color.impulseRed, aurora.color.impulseOrange, aurora.color.deepPlum] as const,
  energyLow: [aurora.color.trustBlue, aurora.color.aiLavender] as const,
  energyMedium: [aurora.color.aiLavender, aurora.color.impulseCoral] as const,
  energyHigh: [aurora.color.impulseOrange, aurora.color.impulseRed] as const,
};

export const radius = aurora.radius;
export const spacing = aurora.spacing;
export const motion = aurora.motion;
export const zIndex = aurora.z;
export const componentSizes = aurora.size;

export const shadow = {
  card:
    Platform.OS === 'web'
      ? ({ boxShadow: '0 16px 36px rgba(42, 16, 40, 0.10)' } as any)
      : {
          shadowColor: aurora.color.deepPlum,
          shadowOpacity: 0.10,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 3,
        },
  floating:
    Platform.OS === 'web'
      ? ({ boxShadow: '0 20px 44px rgba(42, 16, 40, 0.18)' } as any)
      : {
          shadowColor: aurora.color.deepPlum,
          shadowOpacity: 0.18,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 14 },
          elevation: 8,
        },
};

export function energyGradient(level?: string) {
  if (level === 'low') return gradients.energyLow;
  if (level === 'high') return gradients.energyHigh;
  return gradients.energyMedium;
}

export function compatibilityColor(score: number) {
  if (score >= 85) return colors.success;
  if (score >= 70) return colors.accent;
  if (score >= 50) return colors.warning;
  return colors.error;
}

export const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  h1: {
    color: colors.textPrimary,
    ...aurora.type.title,
  },
  h2: {
    color: colors.textPrimary,
    ...aurora.type.section,
  },
  h3: {
    color: colors.textPrimary,
    ...aurora.type.cardTitle,
  },
  body: {
    color: colors.textMuted,
    ...aurora.type.body,
  },
  bodyStrong: {
    color: colors.textPrimary,
    ...aurora.type.body,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    ...aurora.type.label,
    letterSpacing: 0,
  },
  agentText: {
    color: aurora.color.deepPlum,
    ...aurora.type.body,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: 48,
  },
});
