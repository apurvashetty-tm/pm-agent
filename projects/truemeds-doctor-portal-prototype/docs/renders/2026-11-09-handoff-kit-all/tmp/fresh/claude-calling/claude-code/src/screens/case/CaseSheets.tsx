// Sheets on the case page: Leave this case? (a-leave-sheet / a-releasing / s7e-leave-sheet),
// Schedule callback (c-callback*), Skip HA reason (c-skip-ha), Mark patient unavailable (s7d-unavailable-sheet).
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FeedbackMessageId, messages, textStyle, tokens } from '../../kit';
import { Button } from '../../components/Button';
import { Chip, ChipGrid, ChipGroup, Option, ReasonList } from '../../components/Choice';
import { Notice } from '../../components/Notice';
import { Sheet, SheetLabel } from '../../components/Sheet';
import type { CallbackDraft } from '../../model/callingMachine';
import type { CallbackSlot, SkipHaReason, UnavailableReason } from '../../model/types';

export function LeaveCaseSheet({ releasing, onRelease, onStay }: { releasing: boolean; onRelease: () => void; onStay: () => void }) {
  return (
    <Sheet
      title={messages['case.leaveTitle']}
      subtitle={messages['case.leaveSub']}
      onClose={onStay}
      closeDisabled={releasing}
      actions={
        <>
          <Button label={releasing ? messages['case.releasing'] : messages['case.releaseCase']} busy={releasing} onPress={onRelease} />
          <Button label={messages['case.stay']} variant="quiet" disabled={releasing} onPress={onStay} />
        </>
      }
    />
  );
}

const pickError: Record<NonNullable<CallbackDraft['error']>, FeedbackMessageId> = {
  pickBoth: 'case.callbackPickBoth',
  pickDate: 'case.callbackPickDate',
  pickTime: 'case.callbackPickTime',
};

/** Available only on 6 and 7d; never over a live call (case-80). Choices are kept on every error. */
export function CallbackSheet({
  draft, slots, onDay, onSlot, onConfirm, onClose,
}: {
  draft: CallbackDraft;
  slots: CallbackSlot[];
  onDay: (d: 'today' | 'tomorrow') => void;
  onSlot: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet
      title={messages['callback.title']}
      onClose={onClose}
      closeDisabled={draft.saving}
      actions={
        // QUESTION (report): no "saving" label key for Confirm callback; the spinner shows with the same label.
        <Button label={messages['callback.confirm']} busy={draft.saving} onPress={onConfirm} />
      }
    >
      <SheetLabel text={messages['callback.date']} first />
      <ChipGroup label={messages['callback.date']}>
        <Chip label={messages['callback.today']} selected={draft.day === 'today'} onPress={() => onDay('today')} />
        <Chip label={messages['callback.tomorrow']} selected={draft.day === 'tomorrow'} onPress={() => onDay('tomorrow')} />
      </ChipGroup>
      <SheetLabel text={messages['callback.time']} />
      <ChipGrid label={messages['callback.time']}>
        {slots.map((s) => (
          <Chip key={s.id} label={s.label} fill selected={draft.slotId === s.id} onPress={() => onSlot(s.id)} />
        ))}
      </ChipGrid>
      {draft.error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.fieldError}>
          {messages[pickError[draft.error]]}
        </Text>
      ) : null}
      {draft.notice ? (
        <View style={styles.sheetNotice}>
          <Notice
            tone="error"
            placement="inline"
            icon="alert-circle"
            role="alert"
            text={draft.notice === 'notReached' ? messages['callback.notReached'] : messages['case.callbackFailed']}
          />
        </View>
      ) : null}
    </Sheet>
  );
}

export function SkipHaSheet({ onChoose, onClose }: { onChoose: (r: SkipHaReason) => void; onClose: () => void }) {
  return (
    <Sheet title={messages['skipHa.title']} onClose={onClose}>
      <SheetLabel text={messages['skipHa.selectReason']} first />
      <ReasonList>
        <Option title={messages['skipHa.declined']} desc={messages['skipHa.declinedDesc']} onPress={() => onChoose('declined')} />
        <Option title={messages['skipHa.notRequired']} desc={messages['skipHa.notRequiredDesc']} onPress={() => onChoose('notRequired')} />
        <Option title={messages['skipHa.repeat']} desc={messages['skipHa.repeatDesc']} onPress={() => onChoose('repeat')} />
      </ReasonList>
    </Sheet>
  );
}

export function UnavailableSheet({ onChoose, onClose }: { onChoose: (r: UnavailableReason) => void; onClose: () => void }) {
  return (
    <Sheet title={messages['unavailable.title']} onClose={onClose}>
      <SheetLabel text={messages['unavailable.selectReason']} first />
      <ReasonList>
        <Option title={messages['unavailable.noAnswer']} desc={messages['unavailable.noAnswerDesc']} onPress={() => onChoose('noAnswer')} />
        <Option title={messages['unavailable.notReachable']} desc={messages['unavailable.notReachableDesc']} onPress={() => onChoose('notReachable')} />
        <Option title={messages['unavailable.wrongNumber']} desc={messages['unavailable.wrongNumberDesc']} onPress={() => onChoose('wrongNumber')} />
      </ReasonList>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  fieldError: {
    ...textStyle(tokens.font.size.body.md, tokens.font.lineHeight.sm),
    color: tokens.color.content.error,
    marginTop: tokens.space.sm,
  },
  sheetNotice: { marginTop: tokens.space.lg },
});
