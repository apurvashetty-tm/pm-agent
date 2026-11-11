// State → what the case page shows. One function, so each approved state maps to one place.
// Every word is a messages key; every icon a foundation/icons name.
import { FeedbackMessageId, IconName, message, messages } from '../kit';
import type { NoticeTone } from '../components/Notice';
import type { StatusTone } from '../components/Blocks';
import type { ButtonVariant } from '../components/Button';
import { CallingState, haFollows } from './callingMachine';
import type { CaseData } from './types';

export type ActionId =
  | 'callPatient'
  | 'callAgain'
  | 'callback'
  | 'unavailable'
  | 'stillTalking'
  | 'callEnded'
  | 'confirmPrescription'
  | 'confirmLive'
  | 'confirmForward'
  | 'skipHa'
  | 'requestNext'
  | 'backToHome';

export interface BarButton {
  type: 'button';
  action: ActionId;
  label: string;
  variant: ButtonVariant;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  busy?: boolean;
  disabled?: boolean;
}
export type BarRow =
  | BarButton
  | { type: 'status'; text: string; takesButtonRow?: boolean }
  | { type: 'pair'; buttons: BarButton[] };

export interface BarNotice {
  tone: NoticeTone;
  icon: IconName;
  text: string;
  role: 'alert' | 'status';
}

export interface CaseView {
  headerBack: boolean;
  statusCard?: { tone: StatusTone; icon: IconName; title: string; text?: string };
  script?: string;
  /** Medicines + notes read-only and muted, no arrows (closed, Confirming…, Transferring…, live forward). */
  readOnly: boolean;
  medicinesTitle: string;
  /** View Rx keeps its look but takes no tap while confirming (case-89). */
  viewRxInert: boolean;
  bar: { notice?: BarNotice; rows: BarRow[] };
  /** What the phone's back gesture does. */
  phoneBack: 'leaveSheet' | 'blockedToast' | 'home';
}

const btn = (action: ActionId, key: FeedbackMessageId, variant: ButtonVariant, extra: Partial<BarButton> = {}): BarButton => ({
  type: 'button',
  action,
  label: messages[key],
  variant,
  ...extra,
});

const notice = (tone: NoticeTone, icon: IconName, key: FeedbackMessageId, role: 'alert' | 'status' = 'alert'): BarNotice => ({
  tone,
  icon,
  text: messages[key],
  role,
});

export function deriveCaseView(s: CallingState, c: CaseData, online: boolean): CaseView {
  const ha = haFollows(s);
  const liveScript = ha ? messages['call.scriptNeutral'] : messages['call.scriptCat4'];
  const preCall = s.phase === 'ready' || s.phase === 'notThrough' || s.phase === 'doctorMissed';
  const headerBack = preCall && !s.patientAnsweredEver && s.phase !== 'closed';

  const v: CaseView = {
    headerBack,
    readOnly: false,
    medicinesTitle: messages['case.medicinesTitle'],
    viewRxInert: false,
    bar: { rows: [] },
    phoneBack: headerBack ? 'leaveSheet' : 'blockedToast',
  };
  const confirmRow = (action: ActionId, key: FeedbackMessageId): BarButton =>
    s.confirmBusy ? btn(action, 'case.confirming', 'primary', { busy: true }) : btn(action, key, 'primary');
  const disabledIfBusy = (b: BarButton): BarButton => (s.confirmBusy ? { ...b, disabled: true } : b);
  const skipHa = (disabled = false) => btn('skipHa', 'case.skipHa', 'secondary', { icon: 'player-track-next', disabled });

  switch (s.phase) {
    case 'ready': // 1
      v.bar.rows = [btn('callPatient', 'case.callPatient', 'primary', { icon: 'phone' })];
      break;
    case 'calling': // 2 / 7a · g0 (Pilot): status line only, script, no Back, no Callback, no End call
      v.script = liveScript;
      v.bar.rows = [{ type: 'status', text: message('call.calling', { name: c.patient.fullName }) }];
      break;
    case 'notThrough': // 3
      v.bar.notice = notice('error', 'alert-circle', 'call.notThrough');
      v.bar.rows = [btn('callAgain', 'case.callAgain', 'primary', { icon: 'phone' })];
      break;
    case 'doctorMissed': // 4
      v.bar.notice = notice('warning', 'phone-off', 'call.doctorMissed');
      v.bar.rows = [btn('callAgain', 'case.callAgain', 'primary', { icon: 'phone' })];
      break;
    case 'resultWait': // 5 / 7c — no script, status line only
      v.bar.rows = [{ type: 'status', text: messages['call.resultWait'] }];
      break;
    case 'endedEarly': // 6 — Call again · Callback (no Unavailable)
      v.bar.notice = notice('warning', 'phone-off', 'call.endedEarly');
      v.bar.rows = [
        btn('callAgain', 'case.callAgain', 'primary', { icon: 'phone' }),
        { type: 'pair', buttons: [btn('callback', 'case.callback', 'secondary', { icon: 'calendar' })] },
      ];
      break;
    case 'stillOnCall': // 7b — script stays; grey question in the bar
      v.script = liveScript;
      v.bar.notice = notice('question', 'phone', 'call.stillOnCall', 'status');
      v.bar.rows = [
        {
          type: 'pair',
          buttons: [btn('stillTalking', 'case.stillTalking', 'secondary'), btn('callEnded', 'case.callEnded', 'secondary')],
        },
      ];
      break;
    case 'resultMissing': // 7d — Cat4: Confirm prescription · Pilot: Confirm & forward; Callback + Unavailable; no Skip HA
      v.bar.notice = notice('warning', 'alert-triangle', 'call.resultMissing');
      v.bar.rows = [
        ha ? confirmRow('confirmForward', 'case.confirmForward') : confirmRow('confirmPrescription', 'case.confirmPrescription'),
        {
          type: 'pair',
          buttons: [
            disabledIfBusy(btn('callback', 'case.callback', 'secondary', { icon: 'calendar' })),
            disabledIfBusy(btn('unavailable', 'case.unavailable', 'destructive', { icon: 'phone-off' })),
          ],
        },
      ];
      break;
    case 'valid': // 8a — Confirm prescription only, no script
      v.bar.rows = [confirmRow('confirmPrescription', 'case.confirmPrescription')];
      break;
    case 'liveConfirm': // B1 — Confirm prescription on the live call · Skip HA full width
      v.script = liveScript;
      v.bar.rows = [btn('confirmLive', 'case.confirmPrescription', 'primary'), { type: 'pair', buttons: [skipHa()] }];
      break;
    case 'checkingHa': // B2 — status line takes the button's row; Skip HA greyed
      v.script = liveScript;
      v.bar.rows = [
        { type: 'status', text: messages['call.checkingHa'], takesButtonRow: true },
        { type: 'pair', buttons: [skipHa(true)] },
      ];
      break;
    case 'transferring': // 13 — Transferring… busy; Skip HA greyed; content read-only
      v.script = liveScript;
      v.readOnly = true;
      v.bar.rows = [
        btn('confirmLive', 'call.connectingHa', 'primary', { busy: true }),
        { type: 'pair', buttons: [skipHa(true)] },
      ];
      break;
    case 'forwardedLive': // 15 / B3 live — amber card + forward script; "Waiting for the call to end…"
      v.statusCard = {
        tone: 'warning',
        icon: 'alert-triangle',
        title: messages['case.forwardedTitle'],
        text: messages['call.transferFailed'],
      };
      v.script = messages['call.forwardedTell'];
      v.readOnly = true;
      v.medicinesTitle = messages['case.medicinesTitleClosed'];
      v.bar.rows = [{ type: 'status', text: messages['call.waitingForHangup'] }];
      break;
    case 'skipHaWait': // 17 — no-HA script, grey note, status line, no buttons
      v.script = liveScript;
      v.bar.notice = notice('neutral', 'info-circle', 'call.skipHa', 'status');
      v.bar.rows = [{ type: 'status', text: messages['call.resultWait'] }];
      break;
    case 'transferMissed': { // 16 — notice names who ended the call; Confirm & forward · Skip HA
      const by = s.hangup?.endedBy ?? 'unknown';
      const key: FeedbackMessageId =
        by === 'doctor' ? 'call.transferMissedDoctor' : by === 'patient' ? 'call.transferMissedPatient' : 'call.transferMissed';
      v.bar.notice = notice('warning', 'phone-off', key);
      v.bar.rows = [confirmRow('confirmForward', 'case.confirmForward'), { type: 'pair', buttons: [disabledIfBusy(skipHa())] }];
      break;
    }
    case 'closed':
      v.readOnly = true;
      v.medicinesTitle = messages['case.medicinesTitleClosed'];
      v.headerBack = false;
      v.phoneBack = 'home';
      v.statusCard = closedCard(s);
      v.bar.rows = s.availabilityEnded
        ? [btn('backToHome', 'case.backToHome', 'primary')]
        : [
            btn('requestNext', 'case.requestNext', 'primary', { icon: 'arrow-right', iconPosition: 'end' }),
            btn('backToHome', 'case.backToHome', 'quiet'),
          ];
      break;
  }

  if (s.confirmBusy) {
    v.readOnly = true; // Confirming…: rows and notes read-only and muted; title unchanged (a-confirm-busy)
    v.viewRxInert = true;
  }

  // Bar notice precedence: the result of the last action > offline > the state's own notice.
  const a = s.actionNotice;
  if (a?.kind === 'confirmBlocked') {
    v.bar.notice = {
      tone: 'error',
      icon: 'alert-circle',
      text: a.n === 1 ? messages['case.confirmBlockedOne'] : message('case.confirmBlocked', { n: a.n }),
      role: 'alert',
    };
  } else if (a?.kind === 'confirmFailed') v.bar.notice = notice('error', 'alert-circle', 'case.confirmFailed');
  else if (a?.kind === 'releaseFailed') v.bar.notice = notice('error', 'alert-circle', 'case.releaseFailed');
  else if (a?.kind === 'offlineAction') v.bar.notice = notice('error', 'alert-circle', 'case.offlineAction');
  else if (!online && s.phase !== 'closed') v.bar.notice = notice('warning', 'alert-triangle', 'case.offline');

  return v;
}

function closedCard(s: CallingState): CaseView['statusCard'] {
  switch (s.closed) {
    case 'confirmed':
      return { tone: 'success', icon: 'circle-check', title: messages['case.confirmedTitle'] };
    case 'forwarded':
      return { tone: 'success', icon: 'circle-check', title: messages['case.forwardedTitle'] };
    case 'transferred':
      return { tone: 'success', icon: 'circle-check', title: messages['case.transferredTitle'] };
    case 'forwardedAfterHangup': // title only, neutral, info icon (D-85)
      return { tone: 'neutral', icon: 'info-circle', title: messages['case.forwardedTitle'] };
    case 'patientUnavailable':
      return { tone: 'neutral', icon: 'phone-off', title: messages['case.unavailableTitle'] };
    case 'callbackScheduled':
      return {
        tone: 'neutral',
        icon: 'calendar',
        title: message('callback.scheduled', {
          day: s.scheduledFor?.day === 'tomorrow' ? messages['callback.dayTomorrow'] : messages['callback.dayToday'],
          time: s.scheduledFor?.time ?? '',
        }),
      };
    case 'submitted':
      return { tone: 'neutral', icon: 'clock', title: messages['call.submittedTitle'], text: messages['call.submittedText'] };
    default:
      return undefined;
  }
}
