// Small building blocks used by Prescribe: Card, FieldLabel, Helper, FieldError,
// Notice, Toggle (Check + Toggle), ActionBar. Each follows its components/<block>.json.
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { messages, shadow, text, tokens } from '../theme';
import type { IconName } from '../theme';
import { Icon } from './Icon';

/** components/card.json (ps-card): white, radius lg, padding lg, sections 24 apart. */
export function Card({ children, style, onLayout }: { children: React.ReactNode; style?: ViewStyle; onLayout?: ViewProps['onLayout'] }) {
  return (
    <View style={[styles.card, style]} onLayout={onLayout}>
      {children}
    </View>
  );
}

/**
 * components/field.json label (ps-label): 14/20 semibold, 8 above the control.
 * `optional` adds the grey regular "(optional)" (rx-11); `hint` adds e.g. "(ml)".
 */
export function FieldLabel({ label, optional, hint, style }: { label: string; optional?: boolean; hint?: string; style?: ViewStyle }) {
  const muted = optional ? messages['prescribe.optional'] : hint;
  return (
    <Text style={[styles.label, style]} accessibilityRole="header">
      {label}
      {muted ? <Text style={styles.muted}>{' '}{muted}</Text> : null}
    </Text>
  );
}

/** components/ps-helper.json — 14/20 secondary, 8 above. */
export function Helper({ children, nativeID }: { children: string; nativeID?: string }) {
  return (
    <Text style={styles.helper} nativeID={nativeID}>
      {children}
    </Text>
  );
}

/** Field error / dose error (field helper · error): 14/20 error colour, announced. */
export function FieldError({ children, tight }: { children: string; tight?: boolean }) {
  return (
    <Text
      style={[styles.error, tight ? styles.errorTight : styles.errorField]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {children}
    </Text>
  );
}

/** components/notice.json — warning (disabled medicine) / error (Rx didn't load). */
export function Notice({ tone, children }: { tone: 'warning' | 'error'; children: string }) {
  const t = tone === 'warning' ? tokens.color.feedback.warning : tokens.color.feedback.error;
  const icon: IconName = tone === 'warning' ? 'alert-triangle' : 'alert-circle';
  return (
    <View
      style={[styles.notice, { backgroundColor: t.surface, borderColor: t.border }]}
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
    >
      <View style={styles.noticeIcon}>
        <Icon name={icon} size={tokens.iconSize.md} color={t.content} />
      </View>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

/** components/check.json + toggle.json — "Also as needed (SOS)" switch row, 48 tall. */
export function ToggleRow({
  label,
  value,
  onChange,
  describedBy,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  describedBy?: string;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      accessibilityHint={describedBy}
      style={styles.check}
    >
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

/** components/actionbar.json — pinned bottom bar holding the one primary button. */
export function ActionBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingBottom: tokens.space.lg + insets.bottom }]}>{children}</View>;
}

const knobInset = (tokens.toggle.height - tokens.toggle.knob) / 2;

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    gap: tokens.space.xl,
    ...shadow('card'),
  },
  label: { ...text.bodyMdStrong, color: tokens.color.content.primary, marginBottom: tokens.space.sm },
  muted: { ...text.bodyMd, color: tokens.color.content.secondary },
  helper: { ...text.bodyMd, color: tokens.color.content.secondary, marginTop: tokens.space.sm },
  error: { ...text.bodyMd, color: tokens.color.feedback.error.content },
  errorTight: { marginTop: tokens.space.xs }, // ps-dose-error: 4 under the grid
  errorField: { marginTop: tokens.space.sm }, // field helper: 8 under the field
  notice: {
    flexDirection: 'row',
    gap: tokens.space.sm,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.borderWidth.default,
  },
  // components/icon.json "default": margin-top 1px — documented ≤3px optical nudge (kit exception).
  noticeIcon: { marginTop: 1 },
  noticeText: { ...text.bodyMd, color: tokens.color.content.primary, flex: 1 },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    minHeight: tokens.target.min,
    alignSelf: 'flex-start',
  },
  checkLabel: { ...text.bodyMd, color: tokens.color.content.primary },
  track: {
    width: tokens.toggle.width,
    height: tokens.toggle.height,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.border.default,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: tokens.color.surface.brand.default },
  knob: {
    position: 'absolute',
    width: tokens.toggle.knob,
    height: tokens.toggle.knob,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.surface.primary,
  },
  knobOff: { left: knobInset },
  knobOn: { left: tokens.toggle.width - tokens.toggle.knob - knobInset },
  bar: {
    paddingTop: tokens.space.lg,
    paddingHorizontal: tokens.space.lg,
    gap: tokens.space.sm,
    backgroundColor: tokens.color.surface.primary,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    borderTopWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    ...shadow('bar'),
  },
});
