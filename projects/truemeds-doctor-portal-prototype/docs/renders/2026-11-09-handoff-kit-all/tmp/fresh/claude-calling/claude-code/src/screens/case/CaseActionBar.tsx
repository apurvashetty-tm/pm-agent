import React from 'react';
import { StyleSheet, View } from 'react-native';
import { tokens } from '../../kit';
import { Actionbar, StatusLine } from '../../components/Blocks';
import { Button } from '../../components/Button';
import { Notice } from '../../components/Notice';
import type { ActionId, BarButton, CaseView } from '../../model/caseView';

/**
 * The pinned bar for every calling state. Busy bars keep their height and the button's place (case-95).
 * One primary per state (AGENTS rule 4). Notice band sits inside the bar above its button (case-10).
 */
export function CaseActionBar({ bar, onAction, onHeight }: { bar: CaseView['bar']; onAction: (a: ActionId) => void; onHeight: (h: number) => void }) {
  const render = (b: BarButton) => (
    <Button
      key={b.action + b.label}
      label={b.label}
      variant={b.variant}
      icon={b.icon}
      iconPosition={b.iconPosition}
      busy={b.busy}
      disabled={b.disabled}
      onPress={() => onAction(b.action)}
    />
  );
  return (
    <Actionbar onHeight={onHeight}>
      {bar.notice ? <Notice placement="band" {...bar.notice} /> : null}
      {bar.rows.map((row, i) => {
        if (row.type === 'status') return <StatusLine key={i} text={row.text} takesButtonRow={row.takesButtonRow} />;
        if (row.type === 'pair')
          return (
            <View key={i} style={styles.pair}>
              {row.buttons.map((b) => (
                <View key={b.action} style={styles.pairCell}>{render(b)}</View>
              ))}
            </View>
          );
        return render(row);
      })}
    </Actionbar>
  );
}

const styles = StyleSheet.create({
  // components/btn-pair.json: equal columns, gap sm (one button = full width).
  pair: { flexDirection: 'row', gap: tokens.space.sm },
  pairCell: { flex: 1 },
});
