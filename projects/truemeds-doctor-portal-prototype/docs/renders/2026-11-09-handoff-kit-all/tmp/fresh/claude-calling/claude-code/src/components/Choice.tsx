// components/chip.json (+ chip-group.json, chip-grid.json) and components/option.json (+ reason-list.json).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { textStyle, tokens } from '../kit';

export function Chip({ label, selected, onPress, fill }: { label: string; selected: boolean; onPress: () => void; fill?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        fill ? styles.chipFill : null,
        selected ? styles.chipSelected : null,
        pressed ? { opacity: tokens.pressed.dim } : null,
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? tokens.color.content.brand : tokens.color.content.primary }]}>{label}</Text>
    </Pressable>
  );
}

/** chip-group: wrapping row, gap sm. */
export function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <View accessibilityLabel={label} style={styles.group}>{children}</View>;
}

/** chip-grid · 3: three equal columns, gap sm. */
export function ChipGrid({ label, children }: { label: string; children: React.ReactNode[] }) {
  const [width, setWidth] = React.useState(0);
  const columns = 3; // chip-grid variant "3" (components/chip-grid.json)
  const cell = width ? (width - tokens.space.sm * (columns - 1)) / columns : undefined;
  return (
    <View accessibilityLabel={label} style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {children.map((child, i) => (
        <View key={i} style={{ width: cell }}>{child}</View>
      ))}
    </View>
  );
}

export function Option({ title, desc, onPress, disabled }: { title: string; desc: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={desc}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed ? { opacity: tokens.pressed.dim } : null]}
    >
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDesc}>{desc}</Text>
    </Pressable>
  );
}

export function ReasonList({ children }: { children: React.ReactNode }) {
  return <View style={styles.reasonList}>{children}</View>;
}

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
  },
  chipFill: { paddingHorizontal: tokens.space.sm, alignSelf: 'stretch' },
  chipSelected: { borderColor: tokens.color.border.selected, backgroundColor: tokens.color.surface.brand.subtle },
  chipText: textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'),
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  option: {
    width: '100%',
    minHeight: tokens.target.min,
    gap: tokens.space['2xs'],
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface.primary,
  },
  optionTitle: { ...textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.md, 'semibold'), color: tokens.color.content.primary },
  optionDesc: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm), color: tokens.color.content.secondary },
  reasonList: { gap: tokens.space.sm },
});
