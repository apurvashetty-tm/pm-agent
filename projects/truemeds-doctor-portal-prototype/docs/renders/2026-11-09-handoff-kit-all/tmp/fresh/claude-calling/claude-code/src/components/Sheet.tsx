import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { easingFromToken, edgePull, messages, textStyle, tokens } from '../kit';
import { IconButton } from './Button';

/**
 * components/sheet.json + overlay.json.
 * A sheet covers the pinned bar behind it; the bar takes no tap while it is open (case-94).
 * Header and actions stay pinned; the content between them scrolls when it is taller than the space.
 */
export function Sheet({
  title, subtitle, onClose, closeDisabled, children, actions,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  closeDisabled?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: tokens.duration.medium,
      easing: easingFromToken(tokens.easing.sheet),
      useNativeDriver: true,
    }).start();
  }, [enter]);
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => !closeDisabled && onClose()} statusBarTranslucent>
      {/* Scrim: black at tokens.overlayOpacity.default — documented exception in case.json rawValues (no black semantic colour). */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: enter }]}>
        <Pressable style={[StyleSheet.absoluteFill, styles.scrim]} onPress={() => !closeDisabled && onClose()} accessible={false} />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={title}
        style={[styles.sheet, { maxHeight: (height * tokens.sheet.maxHeight) / 100, transform: [{ translateY }] }]}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <View style={{ marginRight: edgePull }}>
            <IconButton icon="x" label={messages['common.close']} onPress={onClose} disabled={closeDisabled} />
          </View>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} bounces={false}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
        {actions ? <View style={[styles.actions, { paddingBottom: tokens.space.xl + insets.bottom }]}>{actions}</View> : <View style={{ height: tokens.space.xl + insets.bottom }} />}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'black', opacity: tokens.overlayOpacity.default, zIndex: tokens.layer.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: tokens.layer.sheet,
    backgroundColor: tokens.color.surface.primary,
    borderTopLeftRadius: tokens.radius['2xl'],
    borderTopRightRadius: tokens.radius['2xl'],
    paddingHorizontal: tokens.space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space.md,
    paddingTop: tokens.space.lg,
    minHeight: tokens.target.min + tokens.space.lg,
  },
  title: { ...textStyle(tokens.font.size.title.sm, tokens.font.lineHeight.lg, 'semibold'), color: tokens.color.content.primary, flexShrink: 1 },
  body: { marginTop: tokens.space.lg, flexGrow: 0 },
  bodyContent: { gap: tokens.space.none },
  subtitle: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm), color: tokens.color.content.secondary, marginTop: tokens.space.xs },
  actions: { gap: tokens.space.sm, marginTop: tokens.space.xl, backgroundColor: tokens.color.surface.primary },
});

/** Sheet section label ("Date", "Time", "Select reason") — 14/20 semibold. */
export function SheetLabel({ text, first }: { text: string; first?: boolean }) {
  return <Text style={[labelStyles.label, { marginTop: first ? tokens.space.none : tokens.space.lg }]}>{text}</Text>;
}
const labelStyles = StyleSheet.create({
  label: {
    ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'),
    color: tokens.color.content.primary,
    marginBottom: tokens.space.sm,
  },
});
