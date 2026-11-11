// The Case page in its calling states: Ready → Calling → result → what follows (Cat4, HA skipped, Pilot Fallback B).
// One screen; its state comes from the backend's answers via useCaseCalling, not from separate screens.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { messages, tokens } from '../../kit';
import { StatusCard, Toast } from '../../components/Blocks';
import type { CaseCallingApi } from '../../model/api';
import type { CallingSettings } from '../../model/settings';
import type { CallbackSlot, CaseData, Medicine } from '../../model/types';
import { useCaseCalling } from '../../model/useCaseCalling';
import { CaseActionBar } from './CaseActionBar';
import { MedicinesCard, NotesCard, OrderDetailsCard, ScriptCard } from './CaseCards';
import { CaseHeader } from './CaseHeader';
import { CallbackSheet, LeaveCaseSheet, SkipHaSheet, UnavailableSheet } from './CaseSheets';

export interface CaseCallingScreenProps {
  caseData: CaseData;
  api: CaseCallingApi;
  settings: CallingSettings;
  online: boolean;
  availabilityEnded: boolean;
  navigation: { goHome: () => void; requestNextCase: () => void };
  onOpenMedicine: (m: Medicine) => void; // → Prescribe / Disable (separate screen)
  onViewRx: () => void; // → prescription viewer (separate screen)
  onHelp: () => void; // QUESTION (report): what Help opens is not in the kit
}

export function CaseCallingScreen(p: CaseCallingScreenProps) {
  const [notes, setNotes] = useState({ symptoms: '', doctorNotes: '' });
  const [barHeight, setBarHeight] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [slots, setSlots] = useState<CallbackSlot[]>([]);
  const scroll = useRef<ScrollView>(null);
  const y = useRef<Record<string, number>>({}).current;

  const scrollToFirstPending = useCallback(() => {
    const first = p.caseData.medicines.find((m) => m.status === 'pending');
    if (!first) return;
    scroll.current?.scrollTo({ y: (y.__card ?? 0) + (y[first.id] ?? 0), animated: true });
  }, [p.caseData.medicines, y]);

  const c = useCaseCalling({
    caseData: p.caseData,
    api: p.api,
    settings: p.settings,
    online: p.online,
    availabilityEnded: p.availabilityEnded,
    notes,
    onScrollToFirstPending: scrollToFirstPending,
    navigation: p.navigation,
  });
  const { state, view, dispatch } = c;

  // Keyboard rule (case-86): the focused field scrolls above the keyboard; the pinned bar hides while it is open.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Callback slots come from the backend ([MOCK] list in the prototype, case-130).
  useEffect(() => {
    if (state.sheet !== 'callback') return;
    p.api.callbackSlots(p.caseData.caseId, state.callback.day ?? 'today').then(setSlots).catch(() => setSlots([]));
  }, [p.api, p.caseData.caseId, state.sheet, state.callback.day]);

  return (
    <View style={styles.screen}>
      <CaseHeader c={p.caseData} showBack={view.headerBack} onBack={c.onHeaderBack} onHelp={p.onHelp} />
      <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <OrderDetailsCard c={p.caseData} onViewRx={p.onViewRx} viewRxInert={view.viewRxInert} />
        {/* Outcome / forward card sits directly under Order details, where the script was (D-58 pt 16). */}
        {view.statusCard ? <StatusCard {...view.statusCard} /> : null}
        {view.script ? <ScriptCard text={view.script} /> : null}
        <View onLayout={(e) => (y.__section = e.nativeEvent.layout.y)}>
          <MedicinesCard
            medicines={p.caseData.medicines}
            title={view.medicinesTitle}
            readOnly={view.readOnly}
            onOpen={p.onOpenMedicine}
            onRowLayout={(id, rowY) => (y[id === '__card' ? '__card' : id] = id === '__card' ? (y.__section ?? 0) + rowY : rowY)}
          />
        </View>
        <View onLayout={(e) => (y.__notes = e.nativeEvent.layout.y)}>
          <NotesCard
            symptoms={notes.symptoms}
            doctorNotes={notes.doctorNotes}
            readOnly={view.readOnly}
            onChange={(field, v) => setNotes((n) => ({ ...n, [field]: v }))}
            onFocusField={(fieldY) => scroll.current?.scrollTo({ y: (y.__notes ?? 0) + fieldY, animated: true })}
          />
        </View>
      </ScrollView>

      {keyboardOpen ? null : <CaseActionBar bar={view.bar} onAction={c.onAction} onHeight={setBarHeight} />}

      {state.toast === 'backBlocked' ? (
        <Toast
          text={messages['case.backBlocked']}
          bottom={barHeight + tokens.space.sm}
          durationMs={p.settings.toastDurationMs}
          onDone={() => dispatch({ type: 'TOAST_DONE' })}
        />
      ) : null}

      {state.sheet === 'leave' ? (
        <LeaveCaseSheet releasing={state.releasing} onRelease={c.release} onStay={() => dispatch({ type: 'CLOSE_SHEET' })} />
      ) : null}
      {state.sheet === 'callback' ? (
        <CallbackSheet
          draft={state.callback}
          slots={slots}
          onDay={(day) => dispatch({ type: 'CALLBACK_DAY', day })}
          onSlot={(slotId) => dispatch({ type: 'CALLBACK_SLOT', slotId })}
          onConfirm={() => c.confirmCallback((id) => slots.find((s) => s.id === id)?.label ?? '')}
          onClose={() => dispatch({ type: 'CLOSE_SHEET' })}
        />
      ) : null}
      {state.sheet === 'skipHa' ? <SkipHaSheet onChoose={c.chooseSkipHa} onClose={() => dispatch({ type: 'CLOSE_SHEET' })} /> : null}
      {state.sheet === 'unavailable' ? (
        <UnavailableSheet onChoose={c.chooseUnavailable} onClose={() => dispatch({ type: 'CLOSE_SHEET' })} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surface.secondary },
  scroll: { flex: 1 },
  // case-scroll: gap lg between cards, page margin lg, 2xl at the bottom.
  content: { gap: tokens.space.lg, paddingTop: tokens.space.lg, paddingHorizontal: tokens.space.lg, paddingBottom: tokens.space['2xl'] },
});
