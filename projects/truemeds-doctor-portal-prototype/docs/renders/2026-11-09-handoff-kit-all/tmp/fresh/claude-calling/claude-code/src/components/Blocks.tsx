// Small blocks used by the case page: Card, SectionTitle, StatusLine, StatusCard, Tag, Toast, Actionbar.
import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconName, shadow, textStyle, tokens } from '../kit';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

/** components/card.json */
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/** components/section-title.json (muted = read-only, components/readonly.json) */
export function SectionTitle({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <Text accessibilityRole="header" style={[s.sectionTitle, muted ? s.muted : null]}>
      {text}
    </Text>
  );
}

/**
 * components/status-line.json — spinner + text, centred, role=status.
 * `takesButtonRow`: the status line sits where a 56 button would be (g2 "Checking for a Health Advisor…", B2):
 * min height tokens.controlHeight.lg instead of tokens.space['3xl'].
 */
export function StatusLine({ text, takesButtonRow }: { text: string; takesButtonRow?: boolean }) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[s.statusLine, { minHeight: takesButtonRow ? tokens.controlHeight.lg : tokens.space['3xl'] }]}
    >
      <Spinner tone="brand" />
      <Text style={s.statusText}>{text}</Text>
    </View>
  );
}

/** components/status-card.json — success / neutral / warning; icon 24; title 16/24; optional text 14/20. */
export type StatusTone = 'success' | 'neutral' | 'warning';
export function StatusCard({ tone, icon, title, text }: { tone: StatusTone; icon: IconName; title: string; text?: string }) {
  const t = statusTones[tone];
  return (
    <View
      accessibilityRole="summary"
      style={[s.statusCard, t.box, { alignItems: text ? 'flex-start' : 'center' }]}
    >
      <Icon name={icon} size={tokens.iconSize.lg} color={t.icon} />
      <View style={s.flexShrink}>
        <Text style={s.statusTitle}>{title}</Text>
        {text ? <Text style={s.statusText2}>{text}</Text> : null}
      </View>
    </View>
  );
}

const statusTones: Record<StatusTone, { box: ViewStyle; icon: string }> = {
  success: {
    box: { backgroundColor: tokens.color.surface.success.subtle, borderColor: tokens.color.surface.success.medium },
    icon: tokens.color.content.success,
  },
  neutral: {
    box: { backgroundColor: tokens.color.surface.tertiary, borderColor: tokens.color.border.default },
    icon: tokens.color.content.secondary,
  },
  warning: {
    box: { backgroundColor: tokens.color.feedback.warning.surface, borderColor: tokens.color.border.warning.strong },
    icon: tokens.color.feedback.warning.content,
  },
};

/** components/tag.json — md · success / warning / neutral · fixed */
export function Tag({ tone, text }: { tone: 'success' | 'warning' | 'neutral'; text: string }) {
  const t = tagTones[tone];
  return (
    <View style={[s.tag, { backgroundColor: t.bg }]}>
      <Text style={[s.tagText, { color: t.fg }]}>{text}</Text>
    </View>
  );
}
const tagTones = {
  success: { bg: tokens.color.surface.success.subtle, fg: tokens.color.content.successStrong },
  warning: { bg: tokens.color.surface.warning.subtle, fg: tokens.color.content.warning },
  neutral: { bg: tokens.color.surface.tertiary, fg: tokens.color.content.secondary },
};

/**
 * components/toast.json + case-toast.json — dark, 14/20, one at a time, just above the bar,
 * polite announcement, never takes focus. Shown for `durationMs` (see settings: no token for "about 4 s").
 */
export function Toast({ text, bottom, durationMs, onDone }: { text: string; bottom: number; durationMs: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [text, durationMs, onDone]);
  return (
    <View pointerEvents="none" style={[s.toastWrap, { bottom }]}>
      <View accessibilityLiveRegion="polite" style={s.toast}>
        <Text style={s.toastText}>{text}</Text>
      </View>
    </View>
  );
}

/**
 * components/actionbar.json — pinned bar: top hairline + bar shadow, top corners lg,
 * padding lg (+ safe area at the bottom), rows stacked with gap sm.
 */
export function Actionbar({ children, onHeight }: { children: ReactNode; onHeight?: (h: number) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      onLayout={(e) => onHeight?.(e.nativeEvent.layout.height)}
      style={[s.bar, { paddingBottom: tokens.space.lg + insets.bottom }]}
    >
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    gap: tokens.space.md,
    ...shadow('card'),
  },
  sectionTitle: { ...textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.md, 'semibold'), color: tokens.color.content.primary },
  muted: { color: tokens.color.content.secondary },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space.sm },
  statusText: { ...textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.md, 'semibold'), color: tokens.color.content.primary },
  statusCard: {
    flexDirection: 'row',
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: tokens.borderWidth.default,
  },
  flexShrink: { flexShrink: 1 },
  statusTitle: { ...textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.md, 'semibold'), color: tokens.color.content.primary },
  statusText2: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm), color: tokens.color.content.primary, marginTop: tokens.space.xs },
  tag: {
    paddingVertical: tokens.space['2xs'],
    paddingHorizontal: tokens.space.sm,
    borderRadius: tokens.radius.full,
    // QUESTION (report): picture tag is 96 wide ("fixed"); the spec only gives min-width space.3xl.
    minWidth: tokens.space['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: textStyle(tokens.font.size.body.xs, tokens.font.lineHeight.xs, 'semibold'),
  toastWrap: {
    position: 'absolute',
    left: tokens.space.xl,
    right: tokens.space.xl,
    alignItems: 'center',
    zIndex: tokens.layer.toast,
  },
  toast: {
    backgroundColor: tokens.color.surface.inverse,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderRadius: tokens.radius.md,
    ...shadow('secondary'),
  },
  toastText: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'medium'), color: tokens.color.content.inverse, textAlign: 'center' },
  bar: {
    backgroundColor: tokens.color.surface.primary,
    paddingTop: tokens.space.lg,
    paddingHorizontal: tokens.space.lg,
    gap: tokens.space.sm,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    borderTopWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    zIndex: tokens.layer.sticky,
    ...shadow('bar'),
  },
});
