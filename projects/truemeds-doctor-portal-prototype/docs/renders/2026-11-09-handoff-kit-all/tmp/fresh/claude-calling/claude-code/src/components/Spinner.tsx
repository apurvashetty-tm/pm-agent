import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { tokens } from '../kit';

/**
 * components/spinner.json.
 * - `onPrimary`: inside a busy primary Button — white ring, open top (L2).
 * - `brand`: inside a StatusLine — brand-subtle ring, brand top (case.json tm-spinner in tm-status-line).
 *
 * QUESTION (see report): AGENTS.md says the turn speed has no token ("timing: true, don't type it"),
 * but tokens.duration.spinner exists. Using that token; confirm it is the intended one.
 */
export function Spinner({ tone }: { tone: 'onPrimary' | 'brand' }) {
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(turn, { toValue: 1, duration: tokens.duration.spinner, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [turn]);
  // A full turn: transform keywords, not design values.
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[tone === 'onPrimary' ? styles.onPrimary : styles.brand, { transform: [{ rotate }] }]}
    />
  );
}

const styles = StyleSheet.create({
  onPrimary: {
    width: tokens.spinner.size,
    height: tokens.spinner.size,
    borderWidth: tokens.spinner.ring,
    borderColor: tokens.color.content.inverse,
    borderTopColor: 'transparent',
    borderRadius: tokens.radius.full,
  },
  brand: {
    width: tokens.spinner.sizeLg,
    height: tokens.spinner.sizeLg,
    borderWidth: tokens.borderWidth.thick,
    borderColor: tokens.color.border.brand.subtle,
    borderTopColor: tokens.color.content.brand,
    borderRadius: tokens.radius.full,
  },
});
