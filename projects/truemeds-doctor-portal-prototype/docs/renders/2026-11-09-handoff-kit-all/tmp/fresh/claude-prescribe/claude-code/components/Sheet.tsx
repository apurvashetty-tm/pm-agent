import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { messages, scrimColor, text, tokens } from '../theme';
import { Button } from './Button';

/**
 * components/sheet.json + overlay.json — bottom sheet over a scrim, inside the screen
 * (never a centred dialog). Title + ✕, optional subtitle / label, body, pinned actions.
 */
export function Sheet({
  visible,
  title,
  subtitle,
  label,
  onClose,
  children,
  actions,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  label?: string;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        {/* Scrim tap closes like ✕ — assumption (not stated in the kit). */}
        <Pressable style={styles.scrim} onPress={onClose} accessibilityElementsHidden importantForAccessibility="no" />
        <View
          style={[styles.sheet, { paddingBottom: tokens.space.xl + insets.bottom }]}
          accessibilityViewIsModal
          accessibilityLabel={title}
        >
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Button variant="icon" icon="x" onPress={onClose} accessibilityLabel={messages['common.close']} style={styles.close} />
          </View>
          <ScrollView style={styles.body} bounces={false}>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {label ? <Text style={styles.label}>{label}</Text> : null}
            {children}
          </ScrollView>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

/** components/option.json — a reason row (title + description), 48+ tall. */
export function Option({ title, desc, onPress }: { title: string; desc: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={desc}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    >
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDesc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: scrimColor },
  sheet: {
    backgroundColor: tokens.color.surface.primary,
    borderTopLeftRadius: tokens.radius['2xl'],
    borderTopRightRadius: tokens.radius['2xl'],
    paddingHorizontal: tokens.space.lg,
    maxHeight: `${tokens.sheet.maxHeight}%`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space.md,
    minHeight: tokens.target.min + tokens.space.lg,
    paddingTop: tokens.space.lg,
  },
  title: { ...text.title, color: tokens.color.content.primary, flex: 1 },
  // ✕ sits so its icon lines up with the page margin: 48 target, icon 20 → pull right.
  close: { marginRight: -((tokens.target.min - tokens.iconSize.md) / 2) },
  body: { marginTop: tokens.space.lg, flexGrow: 0 },
  subtitle: { ...text.bodyMd, color: tokens.color.content.secondary, marginTop: tokens.space.xs },
  label: { ...text.bodyMdStrong, color: tokens.color.content.primary, marginBottom: tokens.space.sm },
  actions: { marginTop: tokens.space.xl, gap: tokens.space.sm },
  option: {
    gap: tokens.space['2xs'],
    minHeight: tokens.target.min,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface.primary,
  },
  pressed: { opacity: tokens.pressed.dim },
  optionTitle: { ...text.bodyLgStrong, color: tokens.color.content.primary },
  optionDesc: { ...text.bodyMd, color: tokens.color.content.secondary },
});
