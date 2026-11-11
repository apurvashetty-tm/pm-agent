// Single entry point to the kit's foundation. Every colour, size and word in
// claude-code/ comes through here (tokens / messages / icons). No constants file.
import { Platform, ViewStyle } from 'react-native';
import { tokens } from '../foundation/tokens';
import { messages, message } from '../foundation/messages';
import type { FeedbackMessageId } from '../foundation/messages';
import { icons } from '../foundation/icons';
import type { IconName } from '../foundation/icons';

export { tokens, messages, message, icons };
export type { FeedbackMessageId, IconName };

type ShadowName = keyof typeof tokens.shadow;

/** tokens.shadow.<name> as a React Native style (ios object / android elevation). */
export function shadow(name: ShadowName): ViewStyle {
  const s = tokens.shadow[name];
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: s.ios.shadowColor,
        shadowOffset: s.ios.shadowOffset,
        shadowOpacity: s.ios.shadowOpacity,
        shadowRadius: s.ios.shadowRadius,
      },
      android: { elevation: s.android.elevation },
      default: {},
    }) ?? {}
  );
}

/** Text styles used on Prescribe — all straight from tokens.text.* */
export const text = {
  title: tokens.text.h1, // 20/28 semibold (header-edit title, sheet title)
  button: tokens.text.buttonLg, // 18/24 semibold (56 action buttons)
  buttonCompact: tokens.text.buttonMd, // 16/24 semibold (48 compact buttons: Disable)
  bodyLgStrong: tokens.text.bodyLgStrong, // printed line, option title
  bodyMd: tokens.text.bodyMd,
  bodyMdStrong: tokens.text.bodyMdStrong,
} as const;

/**
 * Scrim behind sheets.
 * DOCUMENTED KIT EXCEPTION (screens/prescribe.json → rawValues.exceptions, selector .tm-overlay):
 * "scrim is black at the overlay-token opacity (SALT has no black semantic colour).
 *  Not a token on purpose; use the number as is."
 * NOTE: components/overlay.json says --tm-overlay-subtle, prescribe.json says
 * --tm-overlay-default. We follow the screen file (default); reported as a kit question.
 */
export const scrimColor = `rgba(0, 0, 0, ${tokens.overlayOpacity.default})`;
