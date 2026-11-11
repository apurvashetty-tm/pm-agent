import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconName, textStyle, tokens } from '../kit';
import { Icon } from './Icon';

/**
 * components/notice.json.
 * tone: neutral · warning · error · script (brand-subtle "default", the script box) · question (s7b).
 * placement:
 *  - 'band'   — inside the pinned action bar, above its button: full bleed, top corners rounded,
 *               centred (D-86, design rules 9.5). Pulled out by the bar padding (margin −lg).
 *  - 'inline' — inside a card or sheet, left aligned.
 */
export type NoticeTone = 'neutral' | 'warning' | 'error' | 'script' | 'question';

export function Notice({
  tone, placement, icon, text, role,
}: { tone: NoticeTone; placement: 'band' | 'inline'; icon?: IconName; text: string; role: 'alert' | 'status' }) {
  const t = toneStyles[tone];
  const band = placement === 'band';
  return (
    <View
      accessibilityRole={role === 'alert' ? 'alert' : 'text'}
      accessibilityLiveRegion={role === 'alert' ? 'assertive' : 'polite'}
      style={[styles.base, band ? styles.band : styles.inline, t.box]}
    >
      {icon ? <Icon name={icon} size={tokens.iconSize.md} color={t.icon} /> : null}
      <Text style={[tone === 'question' ? styles.textQuestion : styles.text, band ? styles.centred : styles.start]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', gap: tokens.space.sm, borderWidth: tokens.borderWidth.default },
  inline: { padding: tokens.space.md, borderRadius: tokens.radius.md, alignItems: 'flex-start' },
  band: {
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    marginTop: -tokens.space.lg,
    marginHorizontal: -tokens.space.lg,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  text: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm), color: tokens.color.content.primary, flexShrink: 1 },
  textQuestion: {
    ...textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.sm, 'semibold'),
    color: tokens.color.content.primary,
    flexShrink: 1,
  },
  centred: { textAlign: 'center' },
  start: { textAlign: 'left' },
});

const toneStyles: Record<NoticeTone, { box: object; icon: string }> = {
  neutral: { box: { backgroundColor: tokens.color.surface.secondary, borderColor: tokens.color.border.default }, icon: tokens.color.content.secondary },
  warning: { box: { backgroundColor: tokens.color.feedback.warning.surface, borderColor: tokens.color.feedback.warning.border }, icon: tokens.color.feedback.warning.content },
  error: { box: { backgroundColor: tokens.color.feedback.error.surface, borderColor: tokens.color.feedback.error.border }, icon: tokens.color.feedback.error.content },
  script: { box: { backgroundColor: tokens.color.surface.brand.subtle, borderColor: tokens.color.border.brand.subtle }, icon: tokens.color.content.brand },
  question: { box: { backgroundColor: 'transparent', borderColor: 'transparent' }, icon: tokens.color.content.brand },
};
