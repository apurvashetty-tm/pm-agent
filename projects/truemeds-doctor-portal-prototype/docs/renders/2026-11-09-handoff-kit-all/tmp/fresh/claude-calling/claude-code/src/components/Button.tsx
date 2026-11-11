import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { IconName, shadow, textStyle, tokens } from '../kit';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** lg = the pinned bar buttons (body.xl, 56 high); md = View Rx (body.lg, 48 high). */
  size?: 'lg' | 'md';
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  busy?: boolean;
  disabled?: boolean;
  /** Keep the look but take no taps (View Rx while confirming, case-63). */
  inert?: boolean;
}

/** components/button.json — primary · lg · block / secondary · lg / quiet · lg · block / destructive · lg. */
export function Button({
  label, onPress, variant = 'primary', size = 'lg', icon, iconPosition = 'start', busy, disabled, inert,
}: ButtonProps) {
  const look = disabled ? looks.disabled : looks[variant];
  const iconSize = variant === 'primary' || variant === 'quiet' ? tokens.iconSize.md : tokens.iconSize.sm;
  const iconNode = icon && !busy ? <Icon name={icon} size={iconSize} color={look.text.color as string} /> : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }}
      disabled={disabled || busy || inert || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        look.box,
        pressed && variant === 'primary' && !disabled ? looks.primaryPressed : null,
        pressed && variant !== 'primary' ? { opacity: tokens.pressed.dim } : null,
      ]}
    >
      <View style={styles.row}>
        {/* busy: white spinner + label, brand fill kept (L2); the row gap is the spinner's space.sm margin */}
        {busy ? <Spinner tone="onPrimary" /> : null}
        {iconPosition === 'start' ? iconNode : null}
        <Text style={[size === 'lg' ? styles.labelLg : styles.labelMd, look.text]}>{label}</Text>
        {iconPosition === 'end' ? iconNode : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: tokens.radius.lg, minHeight: tokens.target.min },
  lg: { padding: tokens.space.lg, alignSelf: 'stretch' },
  md: { paddingVertical: tokens.space.md, paddingHorizontal: tokens.space.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space.sm },
  labelLg: textStyle(tokens.font.size.body.xl, tokens.font.lineHeight.md, 'semibold'),
  labelMd: textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.md, 'semibold'),
});

const outlined: ViewStyle = {
  backgroundColor: tokens.color.surface.primary,
  borderWidth: tokens.borderWidth.default,
  borderColor: tokens.color.border.default,
  ...shadow('buttonSecondary'),
};

const looks: Record<ButtonVariant | 'disabled' | 'primaryPressed', any> = {
  primary: { box: { backgroundColor: tokens.color.surface.brand.default }, text: { color: tokens.color.content.inverse } as TextStyle },
  primaryPressed: { backgroundColor: tokens.color.surface.interactive.pressed },
  secondary: { box: outlined, text: { color: tokens.color.content.brand } },
  quiet: { box: { backgroundColor: 'transparent' }, text: { color: tokens.color.content.secondary } },
  destructive: {
    box: { ...outlined, borderColor: tokens.color.border.error.strong },
    text: { color: tokens.color.feedback.error.content },
  },
  disabled: { box: { backgroundColor: tokens.color.surface.interactive.disabled }, text: { color: tokens.color.content.disabled } },
};

/** Quiet 48×48 icon button used for header Back, Help and the sheet ✕ (case-96). */
export function IconButton({ icon, label, onPress, disabled }: { icon: IconName; label: string; onPress?: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      hitSlop={0}
      style={({ pressed }) => [iconStyles.box, pressed ? { opacity: tokens.pressed.dim } : null]}
    >
      <Icon name={icon} size={tokens.iconSize.md} color={disabled ? tokens.color.content.disabled : tokens.color.content.secondary} />
    </Pressable>
  );
}

const iconStyles = StyleSheet.create({
  box: {
    width: tokens.target.min,
    height: tokens.target.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.lg,
  },
});
