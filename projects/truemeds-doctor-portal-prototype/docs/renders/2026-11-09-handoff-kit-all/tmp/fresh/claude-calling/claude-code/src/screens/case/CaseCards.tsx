// The case page's content cards: Order details + View Rx, End-of-call script, Medicines, Notes & symptoms.
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { IconName, message, messages, shadow, textStyle, tokens } from '../../kit';
import { Button } from '../../components/Button';
import { Card, SectionTitle, Tag } from '../../components/Blocks';
import { Icon } from '../../components/Icon';
import { Notice } from '../../components/Notice';
import type { CaseData, Medicine, MedicineForm } from '../../model/types';

/** ct-row / ct-details: "Order details ⓘ" expands in its card (case-88); hidden when the order has none. View Rx (case-89). */
export function OrderDetailsCard({ c, onViewRx, viewRxInert }: { c: CaseData; onViewRx: () => void; viewRxInert: boolean }) {
  const [open, setOpen] = useState(false);
  const rows: [string, string | undefined][] = [
    [messages['case.orderCreated'], c.order.created],
    [messages['case.expectedDelivery'], c.order.expectedDelivery],
    [messages['case.payment'], c.order.payment],
  ];
  const hasDetails = rows.some(([, v]) => !!v);
  return (
    <Card style={styles.orderCard}>
      <View style={[styles.ctRow, !hasDetails ? styles.ctRowStart : null]}>
        {hasDetails ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((o) => !o)}
            style={styles.ctDetails}
          >
            <Text style={styles.ctText}>{messages['case.orderDetails']}</Text>
            <Icon name="info-circle" size={tokens.iconSize.md} color={tokens.color.content.secondary} />
          </Pressable>
        ) : null}
        <Button label={messages['case.viewRx']} size="md" variant="secondary" icon="clipboard-text" onPress={onViewRx} inert={viewRxInert} />
      </View>
      {open && hasDetails ? (
        <View style={styles.expand}>
          {rows.filter(([, v]) => !!v).map(([label, value]) => (
            <View key={label} style={styles.expandRow}>
              <Text style={styles.expandLabel}>{label}</Text>
              <Text style={styles.expandValue}>{value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

/** End-of-call script (case-12): section title + brand-subtle box with the quoted line. */
export function ScriptCard({ text }: { text: string }) {
  return (
    <Card>
      <SectionTitle text={messages['case.scriptTitle']} />
      <Notice tone="script" placement="inline" text={text} role="status" />
    </Card>
  );
}

const formIcon: Record<MedicineForm, IconName> = {
  tablet: 'tablet',
  capsule: 'pill',
  syrup: 'syrup',
  drops: 'eye-drops',
  inhaler: 'inhaler',
  injection: 'vaccine',
  cream: 'ointment-tube',
};
const statusTag = {
  prescribed: { tone: 'success' as const, key: 'case.statusPrescribed' as const },
  pending: { tone: 'warning' as const, key: 'case.statusPending' as const },
  disabled: { tone: 'neutral' as const, key: 'case.statusDisabled' as const },
};

/** Medicines card. Rows open Prescribe; read-only rows are muted with no arrow (case-63). */
export function MedicinesCard({
  medicines, title, readOnly, onOpen, onRowLayout,
}: {
  medicines: Medicine[];
  title: string;
  readOnly: boolean;
  onOpen: (m: Medicine) => void;
  onRowLayout: (id: string, y: number) => void;
}) {
  const count = medicines.length === 1 ? messages['case.medicinesCountOne'] : message('case.medicinesCount', { n: medicines.length });
  return (
    <View style={styles.medicinesCard} onLayout={(e) => onRowLayout('__card', e.nativeEvent.layout.y)}>
      <View style={styles.medHeader}>
        <SectionTitle text={title} muted={readOnly} />
        <Text style={styles.medCount}>{count}</Text>
      </View>
      {medicines.map((m, i) => {
        const tag = statusTag[m.status];
        return (
          <Pressable
            key={m.id}
            accessibilityRole="button"
            accessibilityLabel={message('case.editMedicine', { name: m.name })}
            disabled={readOnly}
            onPress={() => onOpen(m)}
            onLayout={(e) => onRowLayout(m.id, e.nativeEvent.layout.y)}
            style={[styles.medRow, i > 0 ? styles.medRowDivider : null]}
          >
            <View style={styles.thumb}>
              <Icon name={formIcon[m.form]} size={tokens.iconSize.lg} color={tokens.color.content.secondary} />
            </View>
            <View style={styles.medInfo}>
              <Text style={[styles.medName, readOnly ? styles.muted : null]}>{m.name}</Text>
              <View style={styles.medLine}>
                <Text style={styles.medQty}>{message('case.qty', { n: m.qty })}</Text>
                <Tag tone={tag.tone} text={messages[tag.key]} />
              </View>
            </View>
            {readOnly ? null : <Icon name="chevron-right" size={tokens.iconSize.sm} color={tokens.color.content.tertiary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Notes & symptoms (case-90): optional, editable until Confirm, saved only with a confirmed prescription. */
export function NotesCard({
  symptoms, doctorNotes, onChange, readOnly, onFocusField,
}: {
  symptoms: string;
  doctorNotes: string;
  onChange: (field: 'symptoms' | 'doctorNotes', v: string) => void;
  readOnly: boolean;
  /** y of the focused field inside this card (the screen adds the card's own y and scrolls, case-86). */
  onFocusField: (y: number) => void;
}) {
  const fieldY = React.useRef<Record<string, number>>({}).current;
  const field =(key: 'symptoms' | 'doctorNotes', label: string, placeholder: string, value: string) => (
    <View style={styles.field} onLayout={(e) => (fieldY[key] = e.nativeEvent.layout.y)}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldControl, readOnly ? styles.fieldReadOnly : null]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          editable={!readOnly}
          multiline
          keyboardType="default"
          placeholder={placeholder}
          placeholderTextColor={tokens.color.content.placeholder}
          onChangeText={(v) => onChange(key, v)}
          onFocus={() => onFocusField(fieldY[key])}
          style={[styles.input, readOnly ? styles.muted : null]}
        />
      </View>
    </View>
  );
  return (
    <Card>
      <SectionTitle text={messages['case.notesTitle']} />
      {field('symptoms', messages['case.symptomsLabel'], messages['case.symptomsPlaceholder'], symptoms)}
      {field('doctorNotes', messages['case.doctorNotesLabel'], messages['case.doctorNotesPlaceholder'], doctorNotes)}
    </Card>
  );
}

const styles = StyleSheet.create({
  orderCard: { gap: tokens.space.sm },
  ctRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.space.sm, minHeight: tokens.target.min },
  ctRowStart: { justifyContent: 'flex-start' }, // View Rx left-aligned when Order details is hidden (case-08)
  ctDetails: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.xs, minHeight: tokens.target.min, padding: tokens.space.xs },
  ctText: { ...textStyle(tokens.font.size.body.lg, tokens.font.lineHeight.md), color: tokens.color.content.primary },
  expand: {
    paddingTop: tokens.space.md,
    borderTopWidth: tokens.borderWidth.default,
    borderTopColor: tokens.color.border.subtle,
    gap: tokens.space.sm,
  },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.space.sm },
  expandLabel: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm), color: tokens.color.content.secondary },
  expandValue: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'), color: tokens.color.content.primary },
  medicinesCard: {
    backgroundColor: tokens.color.surface.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    ...shadow('card'),
  },
  medHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.space.xs },
  medCount: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'), color: tokens.color.content.secondary },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, paddingVertical: tokens.space.md },
  medRowDivider: { borderTopWidth: tokens.borderWidth.default, borderTopColor: tokens.color.border.subtle },
  thumb: {
    width: tokens.thumb.size,
    height: tokens.thumb.size,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo: { flex: 1, minWidth: 0 },
  medName: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'), color: tokens.color.content.primary },
  medLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.space.sm, marginTop: tokens.space['2xs'] },
  medQty: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'), color: tokens.color.content.secondary },
  muted: { color: tokens.color.content.secondary },
  field: { gap: tokens.space.sm },
  fieldLabel: { ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm, 'semibold'), color: tokens.color.content.primary },
  fieldControl: {
    backgroundColor: tokens.color.surface.primary,
    borderWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    minHeight: tokens.target.min,
  },
  fieldReadOnly: { backgroundColor: tokens.color.surface.secondary, borderColor: tokens.color.border.subtle },
  input: {
    ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm),
    color: tokens.color.content.primary,
    minHeight: tokens.space['3xl'] + tokens.space.lg,
    padding: tokens.space.none,
    textAlignVertical: 'top',
  },
});
