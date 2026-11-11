// Prescribe / Disable — screens/prescribe.json (states d-*), DECIDED.md rx-01 … rx-29.
// One screen; its states come from the medicine data and the doctor's taps:
//   d-default · d-every-x-hours · d-alt-days · d-weekly · d-monthly · d-sos-only · d-sos-on
//   d-syrup · d-drops · d-inhaler · d-injection-default · d-cream      (form × schedule)
//   d-duration-picker · d-food-selected · d-notes-keyboard · d-scrolled · d-header-white
//   d-error-dose · d-error-other · d-disabled · d-disable-sheet · d-discard-sheet
// d-rx-failed is the prescription viewer: see RxViewer.tsx.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { message, messages, shadow, text, tokens } from '../theme';
import { Button } from '../components/Button';
import { Chip, ChipGrid, ChipRow } from '../components/Chip';
import { ActionBar, Card, FieldError, FieldLabel, Helper, Notice, ToggleRow } from '../components/Blocks';
import { Icon } from '../components/Icon';
import { Option, Sheet } from '../components/Sheet';
import {
  DISABLE_REASONS,
  DURATION_NUMBERS,
  EVERY_HOURS,
  FOOD,
  FORM_LABEL,
  FORM_RULES,
  FREQUENCIES,
  HOURS_PER_DAY,
  MAX_PER_DAY,
} from './formRules';
import { initialDraft, isChanged, ongoing, pickDurationNumber, pickDurationUnit, setFrequency } from './draft';
import {
  chipLabel,
  durationFieldValue,
  durationText,
  printedLine,
  sameDuration,
  slotAriaDose,
  validate,
} from './printLine';
import type { PrescribeErrors } from './printLine';
import type {
  DisableReason,
  DurationUnit,
  PrescribeMedicine,
  PrescribeResult,
  PrescriptionDraft,
} from './types';

type SheetName = 'disable' | 'discard' | null;

export type PrescribeScreenProps = {
  medicine: PrescribeMedicine;
  /** ✕ with no changes, or Discard on the "Discard changes?" sheet. */
  onClose: () => void;
  /** rx-19: save, mark Prescribed (re-enables a disabled medicine). */
  onPrescribe: (result: PrescribeResult) => void;
  /** rx-22: a reason was chosen; the medicine is disabled at once. */
  onDisable: (reason: DisableReason) => void;
  /** Previews of the approved states only (storybook / screenshot tests). */
  preview?: {
    draft?: Partial<PrescriptionDraft>;
    sheet?: SheetName;
    showErrors?: boolean;
    durationOpen?: boolean;
  };
};

const SLOTS = [
  { key: 'm', short: 'prescribe.keyMorning', long: 'prescribe.morning' },
  { key: 'a', short: 'prescribe.keyAfternoon', long: 'prescribe.afternoon' },
  { key: 'n', short: 'prescribe.keyNight', long: 'prescribe.night' },
] as const;

const DURATION_UNITS: { id: DurationUnit; label: 'prescribe.days' | 'prescribe.weeks' | 'prescribe.months' }[] = [
  { id: 'days', label: 'prescribe.days' },
  { id: 'weeks', label: 'prescribe.weeks' },
  { id: 'months', label: 'prescribe.months' },
];

/** KIT GAP: no key for "Additional instructions" without "(optional)"; split the one key we have. */
function splitOptional(label: string): string {
  const opt = messages['prescribe.optional'];
  return label.endsWith(opt) ? label.slice(0, label.length - opt.length).trimEnd() : label;
}

export function PrescribeScreen({ medicine, onClose, onPrescribe, onDisable, preview }: PrescribeScreenProps) {
  const insets = useSafeAreaInsets();
  const rule = FORM_RULES[medicine.form];
  const opening = useMemo(() => initialDraft(medicine), [medicine]);
  const [draft, setDraft] = useState<PrescriptionDraft>(() => ({ ...opening, ...preview?.draft }));
  const [sheet, setSheet] = useState<SheetName>(preview?.sheet ?? null);
  const [showErrors, setShowErrors] = useState(!!preview?.showErrors);
  const [durationOpen, setDurationOpen] = useState(!!preview?.durationOpen);
  const [focused, setFocused] = useState<'other' | 'notes' | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(0); // iOS keyboard height, for the scroll inset
  const lastUnit = useRef<DurationUnit>(medicine.defaultDuration.kind === 'fixed' ? medicine.defaultDuration.unit : 'days');
  const lastNumber = useRef<number>(medicine.defaultDuration.kind === 'fixed' ? medicine.defaultDuration.n : DURATION_NUMBERS[0]);

  const isDisabled = medicine.status === 'disabled';
  const line = printedLine(draft, medicine);
  const errors: PrescribeErrors = showErrors ? validate(draft, medicine.form) : {};
  const changed = isChanged(draft, opening);
  const update = (patch: Partial<PrescriptionDraft>) => setDraft((d) => ({ ...d, ...patch }));

  // ---- scrolling: first error (rx-18) and focused field above the keyboard (rx-24) ----
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Record<'dose' | 'notes', { y: number; h: number }>>({ dose: { y: 0, h: 0 }, notes: { y: 0, h: 0 } });
  const viewport = useRef(0);
  const track = (k: 'dose' | 'notes') => (e: LayoutChangeEvent) => {
    layouts.current[k] = { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height };
  };
  const revealCard = useCallback((k: 'dose' | 'notes', kb: number) => {
    const { y, h } = layouts.current[k];
    const visible = viewport.current - kb;
    scrollRef.current?.scrollTo({ y: Math.max(0, y + h - visible), animated: true });
  }, []);

  useEffect(() => {
    // iOS: the keyboard covers the window, so we pad by its height.
    // Android: adjustResize already shrinks the window, so no extra inset there.
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      setKeyboardOpen(true);
      setKeyboard(ios ? e.endCoordinates.height : 0);
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardOpen(false);
      setKeyboard(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  useEffect(() => {
    if (keyboardOpen && focused) revealCard(focused === 'other' ? 'dose' : 'notes', keyboard);
  }, [keyboardOpen, keyboard, focused, revealCard]);

  // ---- leaving ----
  const requestClose = useCallback(() => {
    if (changed) setSheet('discard'); // rx-21
    else onClose();
  }, [changed, onClose]);

  useEffect(() => {
    // ASSUMED (report Q20): Android back = ✕ (or closes the open sheet).
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheet) setSheet(null);
      else requestClose();
      return true;
    });
    return () => sub.remove();
  }, [sheet, requestClose]);

  const prescribe = () => {
    const found = validate(draft, medicine.form);
    if (found.dose || found.other) {
      setShowErrors(true);
      Keyboard.dismiss();
      // rx-18: scroll to the first error — both checks live in the dose card.
      scrollRef.current?.scrollTo({ y: layouts.current.dose.y, animated: true });
      return;
    }
    onPrescribe({ medicineId: medicine.id, draft, printedLine: line });
  };

  // ---- pieces ----
  const doseHint = rule.doseHint ? message('prescribe.unitHint', { unit: messages[rule.doseHint] }) : undefined;
  const singleOptions = rule.single;

  const singleGrid = (
    value: PrescriptionDraft['singleDose'],
    onPick: (v: number | 'other') => void,
    withOther: boolean,
    inSub = false,
  ) => (
    <ChipGrid style={inSub ? styles.subGrid : undefined} accessibilityLabel={messages['prescribe.dose']}>
      {singleOptions.map((v) => (
        <Chip key={v} fill label={chipLabel(v, medicine.form)} selected={value === v} onPress={() => onPick(v)}
          accessibilityLabel={slotAriaDose(v, medicine.form)} />
      ))}
      {withOther && rule.otherUnit ? (
        <Chip fill label={messages['prescribe.other']} selected={value === 'other'} onPress={() => onPick('other')} />
      ) : null}
    </ChipGrid>
  );

  const otherField = draft.singleDose === 'other' && rule.otherUnit ? (
    <View style={styles.otherGap}>
      <FieldLabel
        label={rule.otherUnit === 'print.unit.units'
          ? messages['prescribe.doseUnits']
          : message('prescribe.doseIn', { unit: messages[rule.otherUnit] }) /* ASSUMED label for ml, report Q6 */}
        style={styles.labelTight}
      />
      <View style={[styles.control, styles.controlRow, focused === 'other' && styles.controlFocus, errors.other && styles.controlError]}>
        <TextInput
          value={draft.otherText}
          onChangeText={(otherText) => update({ otherText })}
          placeholder={messages['prescribe.otherPlaceholder']}
          placeholderTextColor={tokens.color.content.placeholder}
          keyboardType="decimal-pad"
          onFocus={() => setFocused('other')}
          onBlur={() => setFocused(null)}
          style={styles.otherInput}
          accessibilityLabel={messages['prescribe.doseUnits']}
        />
        <Text style={styles.unit}>{messages[rule.otherUnit]}</Text>
      </View>
      {errors.other ? <FieldError>{errors.other}</FieldError> : null}
    </View>
  ) : null;

  const doseSection = (() => {
    if (draft.frequency === 'daily') {
      return (
        <View>
          <FieldLabel label={messages['prescribe.dose']} hint={doseHint} />
          <View style={styles.slots}>
            {SLOTS.map((s) => (
              <View key={s.key} style={styles.slot}>
                <Text style={styles.slotKey} importantForAccessibility="no">{messages[s.short]}</Text>
                <ChipGrid fullWidth style={styles.slotGrid} accessibilityLabel={messages[s.long]}>
                  {rule.daily.map((v) => (
                    <Chip
                      key={v}
                      fill
                      label={chipLabel(v, medicine.form)}
                      selected={draft.slots[s.key] === v}
                      onPress={() => update({ slots: { ...draft.slots, [s.key]: v } })}
                      accessibilityLabel={message('prescribe.slotAria', { slot: messages[s.long], dose: slotAriaDose(v, medicine.form) })}
                    />
                  ))}
                </ChipGrid>
              </View>
            ))}
          </View>
          {errors.dose ? <FieldError tight>{errors.dose}</FieldError> : null}
        </View>
      );
    }
    return (
      <>
        {draft.frequency === 'everyXHours' ? (
          <View>
            <FieldLabel label={messages['prescribe.every']} />
            <ChipGrid>
              {EVERY_HOURS.map((h) => (
                <Chip key={h} fill label={message('prescribe.hoursChip', { n: h })} selected={draft.everyHours === h}
                  onPress={() => update({ everyHours: h })} accessibilityLabel={message('prescribe.hoursAria', { n: h })} />
              ))}
            </ChipGrid>
            <Helper>{message('prescribe.timesADay', { n: HOURS_PER_DAY / draft.everyHours })}</Helper>
          </View>
        ) : null}
        <View>
          <FieldLabel label={messages['prescribe.dose']} hint={doseHint} />
          {singleGrid(draft.singleDose, (v) => update({ singleDose: v }), true)}
          {otherField}
        </View>
        {draft.frequency === 'sosOnly' ? (
          <View>
            <FieldLabel label={messages['prescribe.maxDoses']} />
            <ChipGrid>
              {MAX_PER_DAY.map((n) => (
                <Chip key={n} fill label={String(n)} selected={draft.maxDoses === n} onPress={() => update({ maxDoses: n })} />
              ))}
            </ChipGrid>
          </View>
        ) : null}
      </>
    );
  })();

  const durationChanged = !sameDuration(draft.duration, medicine.defaultDuration);

  return (
    <View style={styles.screen} accessibilityViewIsModal>
      {/* ps-top: header + pinned "On prescription" band */}
      <View style={[styles.top, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Button variant="icon" icon="x" onPress={requestClose} accessibilityLabel={messages['common.close']} style={styles.headerClose} />
          <View style={styles.headerText}>
            <Text style={styles.title} accessibilityRole="header">{medicine.name}</Text>
            <Text style={styles.subtitle}>{messages[FORM_LABEL[medicine.form]]}</Text>
          </View>
          {/* d-disabled: an already disabled medicine has no Disable button */}
          {!isDisabled ? (
            <Button variant="destructiveCompact" label={messages['prescribe.disable']} onPress={() => setSheet('disable')} />
          ) : null}
        </View>
        <View style={styles.rx} accessibilityLiveRegion="polite">
          <View style={styles.rxLabel}>
            <Icon name="prescription" size={tokens.iconSize.sm} color={tokens.color.content.brand} />
            <Text style={styles.rxLabelText}>{messages['prescribe.onPrescription']}</Text>
          </View>
          <Text style={styles.printed}>{line}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: tokens.space.lg + (Platform.OS === 'ios' ? keyboard : 0) }]}
        keyboardShouldPersistTaps="handled"
        onLayout={(e) => (viewport.current = e.nativeEvent.layout.height)}
      >
        {isDisabled && medicine.disabledReason ? (
          <Notice tone="warning">
            {message('case.disabledMedicine', {
              reason: messages[DISABLE_REASONS.find((r) => r.id === medicine.disabledReason)!.title],
            })}
          </Notice>
        ) : null}

        <Card onLayout={track('dose')}>
          <View>
            <FieldLabel label={messages['prescribe.howOften']} />
            <ChipRow accessibilityLabel={messages['prescribe.howOften']}>
              {FREQUENCIES.map((f) => (
                <Chip key={f.id} label={messages[f.label]} selected={draft.frequency === f.id}
                  onPress={() => setDraft((d) => setFrequency(d, f.id))} />
              ))}
            </ChipRow>
          </View>
          {doseSection}
        </Card>

        {draft.frequency !== 'sosOnly' ? (
          <Card>
            <View>
              <ToggleRow label={messages['prescribe.alsoSos']} value={draft.sosOn} onChange={(sosOn) => update({ sosOn })}
                describedBy={messages['prescribe.sosHelp']} />
              <Helper>{messages['prescribe.sosHelp']}</Helper>
              {draft.sosOn ? (
                <View style={styles.sub}>
                  <View>
                    <FieldLabel label={messages['prescribe.dose']} hint={doseHint} />
                    {/* ASSUMED (report Q15): the SOS dose grid has no Other */}
                    {singleGrid(draft.sosDose, (v) => typeof v === 'number' && update({ sosDose: v }), false, true)}
                  </View>
                  <View>
                    <FieldLabel label={messages['prescribe.maxExtra']} />
                    <ChipGrid style={styles.subGrid}>
                      {MAX_PER_DAY.map((n) => (
                        <Chip key={n} fill label={String(n)} selected={draft.sosMax === n} onPress={() => update({ sosMax: n })} />
                      ))}
                    </ChipGrid>
                  </View>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        <Card>
          <View>
            <FieldLabel label={messages['prescribe.duration']} />
            <View style={[styles.durField, durationOpen && styles.controlFocus]}>
              <Pressable
                onPress={() => setDurationOpen((o) => !o)}
                accessibilityRole="button"
                accessibilityState={{ expanded: durationOpen }}
                accessibilityLabel={draft.duration.kind === 'ongoing'
                  ? message('prescribe.ongoingAria', { period: durationText(medicine.ongoingPeriod) })
                  : durationFieldValue(draft.duration, medicine)}
                accessibilityHint={messages[durationChanged ? 'prescribe.changed' : 'prescribe.default']}
                style={styles.durToggle}
              >
                <View style={styles.durText}>
                  <Text style={styles.durValue}>{durationFieldValue(draft.duration, medicine)}</Text>
                  <Text style={styles.durSub}>{messages[durationChanged ? 'prescribe.changed' : 'prescribe.default']}</Text>
                </View>
                <Icon name={durationOpen ? 'chevron-up' : 'chevron-down'} size={tokens.iconSize.lg} color={tokens.color.content.secondary} />
              </Pressable>
              {durationOpen ? (
                <View style={styles.durPanel}>
                  <ChipGrid fullWidth accessibilityLabel={messages['prescribe.durationNumber']}>
                    {DURATION_NUMBERS.map((n) => (
                      <Chip key={n} fill label={String(n)}
                        selected={draft.duration.kind === 'fixed' && draft.duration.n === n}
                        onPress={() => {
                          lastNumber.current = n;
                          setDraft((d) => pickDurationNumber(d, n, lastUnit.current));
                        }} />
                    ))}
                  </ChipGrid>
                  <View style={styles.durUnits}>
                    <ChipRow accessibilityLabel={messages['prescribe.durationUnit']}>
                      {DURATION_UNITS.map((u) => (
                        <Chip key={u.id} label={messages[u.label]}
                          selected={draft.duration.kind === 'fixed' && draft.duration.unit === u.id}
                          onPress={() => {
                            lastUnit.current = u.id;
                            setDraft((d) => pickDurationUnit(d, u.id, lastNumber.current));
                          }} />
                      ))}
                      <Chip label={messages['prescribe.ongoing']} selected={draft.duration.kind === 'ongoing'}
                        onPress={() => update({ duration: ongoing })} />
                    </ChipRow>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </Card>

        <Card>
          <View>
            <FieldLabel label={messages['prescribe.food']} optional />
            <ChipRow accessibilityLabel={messages['prescribe.food']}>
              {FOOD.map((f) => (
                <Chip key={f.id} label={messages[f.label]} selected={draft.food === f.id}
                  onPress={() => update({ food: draft.food === f.id ? null : f.id })} /* rx-16: tap again clears */ />
              ))}
            </ChipRow>
          </View>
        </Card>

        <Card onLayout={track('notes')}>
          <View>
            <FieldLabel label={splitOptional(messages['prescribe.notesLabel'])} optional />
            <View style={[styles.control, focused === 'notes' && styles.controlFocus]}>
              <TextInput
                value={draft.instructions}
                onChangeText={(instructions) => update({ instructions })}
                placeholder={messages['prescribe.notesPlaceholder']}
                placeholderTextColor={tokens.color.content.placeholder}
                multiline
                keyboardType="default"
                onFocus={() => setFocused('notes')}
                onBlur={() => setFocused(null)}
                style={styles.noteInput}
                accessibilityLabel={messages['prescribe.notesLabel']}
                accessibilityHint={messages['prescribe.notesHelper']}
              />
            </View>
            <Helper>{messages['prescribe.notesHelper']}</Helper>
          </View>
        </Card>
      </ScrollView>

      {/* rx-24: the pinned bar hides while the keyboard is open */}
      {!keyboardOpen ? (
        <ActionBar>
          <Button variant="primary" label={messages['prescribe.prescribe']} onPress={prescribe} />
        </ActionBar>
      ) : null}

      <Sheet
        visible={sheet === 'disable'}
        title={message('prescribe.disableTitle', { name: medicine.name })}
        label={messages['prescribe.disableSub']}
        onClose={() => setSheet(null)}
      >
        <View style={styles.reasons}>
          {DISABLE_REASONS.map((r) => (
            <Option key={r.id} title={messages[r.title]} desc={messages[r.desc]}
              onPress={() => {
                setSheet(null);
                onDisable(r.id); // rx-22: disables at once
              }} />
          ))}
        </View>
      </Sheet>

      <Sheet
        visible={sheet === 'discard'}
        title={messages['prescribe.discardTitle']}
        subtitle={messages['prescribe.discardSub']}
        onClose={() => setSheet(null)}
        actions={
          <>
            {/* D-54: Discard (red outline) on top, Keep editing below */}
            <Button variant="destructive" label={messages['prescribe.discard']} onPress={() => { setSheet(null); onClose(); }} />
            <Button variant="quiet" label={messages['prescribe.keepEditing']} onPress={() => setSheet(null)} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surface.primary },
  top: { zIndex: tokens.layer.raised, backgroundColor: tokens.color.surface.primary, ...shadow('header') },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    minHeight: tokens.target.min + tokens.space.lg,
    paddingVertical: tokens.space.sm,
    paddingHorizontal: tokens.space.lg,
    backgroundColor: tokens.color.surface.primary,
  },
  // ✕ icon lines up with the 16 page margin (button at x 2 in the measured screen).
  headerClose: { marginLeft: tokens.space['2xs'] - tokens.space.lg },
  headerText: { flex: 1, minWidth: 0 },
  title: { ...text.title, color: tokens.color.content.primary },
  subtitle: { ...text.bodyMd, color: tokens.color.content.secondary },
  rx: {
    backgroundColor: tokens.color.surface.brand.subtle,
    paddingTop: tokens.space.sm,
    paddingHorizontal: tokens.space.lg,
    paddingBottom: tokens.space.md,
  },
  rxLabel: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.xs, marginBottom: tokens.space['2xs'] },
  rxLabelText: { ...text.bodyMdStrong, color: tokens.color.content.brand },
  printed: { ...text.bodyLgStrong, color: tokens.color.content.primary },
  body: { flex: 1, backgroundColor: tokens.color.surface.secondary },
  bodyContent: { padding: tokens.space.lg, gap: tokens.space.lg },
  slots: { gap: tokens.space.sm },
  slot: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  slotKey: { ...text.bodyMdStrong, color: tokens.color.content.secondary, width: tokens.space.xl },
  slotGrid: { flex: 1 },
  // Inside the SOS block the grid keeps the main grid's column width (ps-grid-4).
  subGrid: { marginRight: tokens.space.xl - tokens.borderWidth.thick },
  sub: {
    marginTop: tokens.space.xl,
    paddingLeft: tokens.space.md,
    borderLeftWidth: tokens.borderWidth.thick,
    borderLeftColor: tokens.color.border.subtle,
    gap: tokens.space.xl,
  },
  otherGap: { marginTop: tokens.space.md },
  labelTight: { marginBottom: tokens.space.sm },
  control: {
    backgroundColor: tokens.color.surface.primary,
    borderWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    minHeight: tokens.target.min,
  },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  controlFocus: { borderColor: tokens.color.border.focus },
  controlError: { borderColor: tokens.color.border.error.strong },
  otherInput: { ...text.bodyMd, color: tokens.color.content.primary, flex: 1, padding: tokens.space.none },
  unit: { ...text.bodyMd, color: tokens.color.content.secondary },
  noteInput: {
    ...text.bodyMd,
    color: tokens.color.content.primary,
    minHeight: tokens.space['2xl'],
    padding: tokens.space.none,
    textAlignVertical: 'top',
  },
  durField: {
    backgroundColor: tokens.color.surface.primary,
    borderWidth: tokens.borderWidth.default,
    borderColor: tokens.color.border.default,
    borderRadius: tokens.radius.md,
  },
  durToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space.md,
    padding: tokens.space.md,
    minHeight: tokens.target.min,
    borderRadius: tokens.radius.md,
  },
  durText: { flex: 1 },
  durValue: { ...text.bodyMdStrong, color: tokens.color.content.primary },
  durSub: { ...text.bodyMd, color: tokens.color.content.secondary },
  durPanel: { paddingHorizontal: tokens.space.md, paddingBottom: tokens.space.md },
  durUnits: { marginTop: tokens.space.sm },
  reasons: { gap: tokens.space.sm },
});
