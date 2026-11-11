import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { edgePull, message, messages, textStyle, tokens } from '../../kit';
import { IconButton } from '../../components/Button';
import type { CaseData } from '../../model/types';

/**
 * components/header-task--compact.json — tinted compact task header, no logo on the case page (D-61).
 * Back only on 1 / 3 / 4 before the patient was reached; Help always (case-11).
 * A two-line name makes the header taller, not tighter (case-10).
 */
export function CaseHeader({ c, showBack, onBack, onHelp }: { c: CaseData; showBack: boolean; onBack: () => void; onHelp: () => void }) {
  const insets = useSafeAreaInsets();
  // Title / meta start 54 from the edge with Back (48 target pulled to the 16 margin + gap xs), 16 without.
  const metaIndent = showBack ? tokens.target.min + edgePull + tokens.space.xs : tokens.space.none;
  return (
    <View style={[styles.header, { paddingTop: tokens.space.xs + insets.top }]}>
      <View style={styles.row}>
        {showBack ? (
          <View style={{ marginLeft: edgePull }}>
            <IconButton icon="arrow-left" label={messages['common.back']} onPress={onBack} />
          </View>
        ) : null}
        {/* Patient name: backend data (the kit's screen file tags it with print.amount; see report). */}
        <Text accessibilityRole="header" style={styles.title}>{c.patient.fullName}</Text>
        <View style={{ marginRight: edgePull }}>
          <IconButton icon="help-circle" label={messages['common.help']} onPress={onHelp} />
        </View>
      </View>
      <Text style={[styles.meta, { marginLeft: metaIndent }]}>
        {message('case.patientMeta', { age: c.patient.age, gender: c.patient.gender })}
      </Text>
      <Text style={[styles.meta, styles.metaLast, { marginLeft: metaIndent }]}>
        {message('case.orderMeta', { id: c.order.id, total: c.order.total })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: tokens.color.surface.brand.subtle,
    paddingHorizontal: tokens.space.lg,
    paddingBottom: tokens.space.sm,
    zIndex: tokens.layer.sticky,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.xs, minHeight: tokens.target.min },
  title: {
    ...textStyle(tokens.font.size.title.sm, tokens.font.lineHeight.lg, 'semibold'),
    color: tokens.color.content.primary,
    flex: 1,
  },
  meta: {
    ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm),
    color: tokens.color.content.secondary,
    marginRight: tokens.target.min,
  },
  metaLast: { marginTop: tokens.space.none },
});
