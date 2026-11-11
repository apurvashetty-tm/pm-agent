import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { text, tokens } from '../theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Grid chips stretch to their column (ps-grid); wrapping chips size to content. */
  fill?: boolean;
};

/** components/chip.json — "lg" / "lg · selected". 48 tall, pill, 14/20 semibold. */
export function Chip({ label, selected, onPress, accessibilityLabel, fill }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        fill && styles.fill,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** components/ps-chips.json / chip-group.json — wrapping row, gap 8. */
export function ChipRow({ children, accessibilityLabel }: { children: React.ReactNode; accessibilityLabel?: string }) {
  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel} accessibilityRole={accessibilityLabel ? 'radiogroup' : undefined}>
      {children}
    </View>
  );
}

/**
 * components/ps-grid.json — 4 equal columns, gap 8. Used for the M / A / N rows and,
 * per rx-09 (D-55), every single-row dose grid uses the same column width, so the grid is
 * always as wide as the M/A/N grid (100% − key column − its gap) unless `fullWidth`.
 */
export function ChipGrid({
  children,
  fullWidth,
  accessibilityLabel,
  style,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}) {
  const items = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += COLUMNS) rows.push(items.slice(i, i + COLUMNS));
  return (
    <View
      style={[styles.grid, !fullWidth && styles.gridInset, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'radiogroup' : undefined}
    >
      {rows.map((row, r) => (
        <View key={r} style={styles.gridRow}>
          {row.map((cell, c) => (
            <View key={c} style={styles.cell}>
              {cell}
            </View>
          ))}
          {Array.from({ length: COLUMNS - row.length }).map((_, k) => (
            <View key={`pad-${k}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ps-grid.json: grid-template-columns repeat(4, …). A layout value, not a size.
const COLUMNS = 4;

const styles = StyleSheet.create({
  chip: {
    minHeight: tokens.target.min,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderRadius: tokens.radius.full,
    borderWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    backgroundColor: tokens.color.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.space.xs,
  },
  selected: {
    borderColor: tokens.color.border.selected,
    backgroundColor: tokens.color.surface.brand.subtle,
  },
  fill: { alignSelf: 'stretch', paddingHorizontal: tokens.space.none },
  pressed: { opacity: tokens.pressed.dim },
  label: { ...text.bodyMdStrong, color: tokens.color.content.primary },
  labelSelected: { color: tokens.color.content.brand },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  grid: { gap: tokens.space.sm },
  // calc(100% - var(--tm-space-xl) - var(--tm-space-md))
  gridInset: { marginRight: tokens.space.xl + tokens.space.md },
  gridRow: { flexDirection: 'row', gap: tokens.space.sm },
  cell: { flex: 1 },
});
