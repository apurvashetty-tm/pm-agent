import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { text, tokens } from '../theme';
import type { IconName } from '../theme';
import { Icon } from './Icon';

/**
 * components/button.json. Variants used on Prescribe:
 *  - primary      "lg · primary · block"   (pinned bar: Prescribe; Rx viewer: Try again)
 *  - quiet        "quiet · lg · block"     (Keep editing)
 *  - destructive  "destructive · lg · block" (Discard)
 *  - destructiveCompact "destructive"      (header Disable, 48 tall)
 *  - icon         "quiet · icon"           (✕)
 *  - iconOnDark   "on-dark · icon"         (✕ in the Rx viewer)
 */
export type ButtonVariant =
  | 'primary'
  | 'quiet'
  | 'destructive'
  | 'destructiveCompact'
  | 'icon'
  | 'iconOnDark';

type Props = {
  variant: ButtonVariant;
  label?: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  /** Required for icon-only buttons (common.close etc). */
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function Button({ variant, label, icon, onPress, disabled, accessibilityLabel, style }: Props) {
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        v.container,
        disabled && v.disabled,
        pressed && !disabled && (v.pressed ?? styles.pressedDim),
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={v.iconSize} color={disabled ? tokens.color.content.disabled : v.iconColor} /> : null}
      {label ? (
        <Text style={[v.label, disabled && styles.disabledLabel]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

type VariantStyle = {
  container: ViewStyle;
  label: TextStyle;
  disabled?: ViewStyle;
  pressed?: ViewStyle;
  iconColor: string;
  iconSize: number;
};

const block: ViewStyle = {
  alignSelf: 'stretch',
  minHeight: tokens.controlHeight.lg,
  padding: tokens.space.lg,
};

const variants: Record<ButtonVariant, VariantStyle> = {
  primary: {
    container: { ...block, backgroundColor: tokens.color.surface.brand.default },
    label: { ...text.button, color: tokens.color.content.inverse },
    disabled: { backgroundColor: tokens.color.surface.interactive.disabled },
    pressed: { backgroundColor: tokens.color.surface.interactive.pressed },
    iconColor: tokens.color.content.inverse,
    iconSize: tokens.iconSize.md,
  },
  quiet: {
    container: { ...block, backgroundColor: 'transparent' },
    label: { ...text.button, color: tokens.color.content.secondary },
    iconColor: tokens.color.content.secondary,
    iconSize: tokens.iconSize.md,
  },
  destructive: {
    container: {
      ...block,
      backgroundColor: tokens.color.surface.primary,
      borderWidth: tokens.borderWidth.default,
      borderColor: tokens.color.border.error.strong,
    },
    label: { ...text.button, color: tokens.color.feedback.error.content },
    iconColor: tokens.color.feedback.error.content,
    iconSize: tokens.iconSize.md,
  },
  destructiveCompact: {
    container: {
      minHeight: tokens.target.min,
      paddingVertical: tokens.space.md,
      paddingHorizontal: tokens.space.lg,
      backgroundColor: tokens.color.surface.primary,
      borderWidth: tokens.borderWidth.default,
      borderColor: tokens.color.border.error.strong,
    },
    label: { ...text.buttonCompact, color: tokens.color.feedback.error.content },
    iconColor: tokens.color.feedback.error.content,
    iconSize: tokens.iconSize.sm,
  },
  icon: {
    container: {
      minWidth: tokens.target.min,
      minHeight: tokens.target.min,
      padding: tokens.space.md,
      backgroundColor: 'transparent',
    },
    label: { ...text.buttonCompact, color: tokens.color.content.secondary },
    iconColor: tokens.color.content.secondary,
    iconSize: tokens.iconSize.md,
  },
  iconOnDark: {
    container: {
      minWidth: tokens.target.min,
      minHeight: tokens.target.min,
      padding: tokens.space.md,
      backgroundColor: 'transparent',
    },
    label: { ...text.buttonCompact, color: tokens.color.content.inverse },
    iconColor: tokens.color.content.inverse,
    iconSize: tokens.iconSize.md,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.sm,
    borderRadius: tokens.radius.lg,
  },
  // The kit only gives a pressed style for the primary button; other roles dim
  // with tokens.pressed.dim (assumption, see report).
  pressedDim: { opacity: tokens.pressed.dim },
  disabledLabel: { color: tokens.color.content.disabled },
});
