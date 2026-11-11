// One import point for the hand-off kit (foundation/). Nothing in here adds a value:
// it only reshapes tokens into React Native style objects.
import { Easing, Platform, TextStyle, ViewStyle } from 'react-native';
import { tokens } from '../../foundation/tokens';

export { tokens } from '../../foundation/tokens';
export { messages, message } from '../../foundation/messages';
export type { FeedbackMessageId } from '../../foundation/messages';
export { icons } from '../../foundation/icons';
export type { IconName } from '../../foundation/icons';

type Weight = keyof typeof tokens.font.weight;

/** Text style from token values. fontFamily + fontWeight pick the static TTF (foundation/fonts/FONTS.md). */
export function textStyle(fontSize: number, lineHeight: number, weight: Weight = 'regular'): TextStyle {
  return {
    fontFamily: tokens.font.family,
    fontSize,
    lineHeight,
    fontWeight: tokens.font.weight[weight],
  };
}

/** A tokens.shadow.* object for the current platform. */
export function shadow(name: keyof typeof tokens.shadow): ViewStyle {
  const s = tokens.shadow[name];
  return (Platform.select({ ios: { ...s.ios }, android: { ...s.android }, default: {} }) ?? {}) as ViewStyle;
}

/** RN Easing from a tokens.easing.* "cubic-bezier(a, b, c, d)" string, so no curve numbers are typed. */
export function easingFromToken(css: string) {
  const [a, b, c, d] = (css.match(/[-\d.]+/g) ?? []).map(Number);
  return Easing.bezier(a, b, c, d);
}

/**
 * Header / sheet edge rule (DECIDED case-96): the 48 target's glyph starts on the 16 margin,
 * so the button is pulled out by half of (target − icon). Derived from tokens, not typed.
 */
export const edgePull = -(tokens.target.min - tokens.iconSize.md) / 2;
