// Sign-in screen (entry journey, step 1). States: default, keyboard-open, empty-tap, too-short, wrong-first-digit,
// pasted-cleaned, sending, not-registered, offline, couldnt-send, too-many-tries, inactive (app-logic §2, §11).
// Behaviour: live validation, test numbers in app/data/test-numbers.js, errors clear on edit.
import { MSG } from "../core/msg.js";
import { push } from "../core/nav.js";
import { store } from "../core/store.js";

const STATES = {
  "sign-in_default": "default",
  "sign-in_keyboard-open": "keyboard-open",
  "sign-in_empty-tap": "empty-tap",
  "sign-in_too-short": "too-short",
  "sign-in_wrong-first-digit": "wrong-first-digit",
  "sign-in_pasted-cleaned": "pasted-cleaned",
  "sign-in_sending": "sending",
  "sign-in_not-registered": "not-registered",
  "sign-in_offline": "offline",
  "sign-in_couldnt-send": "couldnt-send",
  "sign-in_too-many-tries": "too-many-tries",
  "sign-in_inactive": "inactive",
};

export function render(host, id, { mode, w }) {
  const stateKey = STATES[id];
  if (!stateKey) return null;

  host.innerHTML = '';
  const section = document.createElement('section');
  section.className = 'tm shell-screen';
  section.style.display = 'flex';
  section.style.flexDirection = 'column';
  section.style.height = '100%';
  section.setAttribute('aria-label', MSG('signin.title'));

  // Header with logo
  const headerDiv = document.createElement('div');
  headerDiv.style.padding = 'var(--tm-space-lg) var(--tm-space-page) 0';
  const logo = document.createElement('img');
  logo.src = 'brand/truemeds-for-doctors.svg';
  logo.alt = 'truemeds for doctors';
  logo.style.width = '166px';
  logo.style.height = 'auto';
  headerDiv.appendChild(logo);
  section.appendChild(headerDiv);

  // Main content
  const main = document.createElement('main');
  main.style.flex = '1';
  main.style.display = 'flex';
  main.style.flexDirection = 'column';
  main.style.paddingTop = 'var(--tm-space-3xl)';
  main.style.maxWidth = '31ch';

  const h1 = document.createElement('h1');
  h1.className = 'tm-font-title-lg';
  h1.style.margin = '0 0 var(--tm-space-sm)';
  h1.textContent = MSG('signin.welcome');
  main.appendChild(h1);

  const subtitle = document.createElement('p');
  subtitle.className = 'tm-font-body-lg';
  subtitle.style.color = 'var(--tm-content-secondary)';
  subtitle.style.margin = '0';
  subtitle.textContent = MSG('signin.subtitle');
  main.appendChild(subtitle);

  section.appendChild(main);

  // Fields panel
  const fieldsDiv = document.createElement('div');
  fieldsDiv.style.margin = 'var(--tm-space-2xl) calc(-1 * var(--tm-space-page)) 0';
  fieldsDiv.style.padding = 'var(--tm-space-2xl) var(--tm-space-page) var(--tm-space-xl)';
  fieldsDiv.style.background = 'var(--tm-surface-primary)';
  fieldsDiv.style.borderRadius = 'var(--tm-radius-2xl) var(--tm-radius-2xl) 0 0';
  fieldsDiv.style.flex = '1';
  fieldsDiv.style.display = 'flex';
  fieldsDiv.style.flexDirection = 'column';

  const field = document.createElement('div');
  field.className = 'tm-field';

  const label = document.createElement('label');
  label.className = 'tm-field__label';
  label.setAttribute('for', 'tm-signin-mobile');
  label.textContent = MSG('signin.phoneLabel');
  field.appendChild(label);

  const control = document.createElement('div');
  control.className = 'tm-field__control';
  control.style.display = 'flex';
  control.style.alignItems = 'center';

  const prefix = document.createElement('span');
  prefix.style.paddingRight = 'var(--tm-space-md)';
  prefix.style.borderRight = '1px solid var(--tm-border-default)';
  prefix.style.fontSize = 'var(--tm-font-size-body-lg)';
  prefix.style.lineHeight = 'var(--tm-font-lineheight-md)';
  prefix.style.color = 'var(--tm-content-primary)';
  prefix.style.fontWeight = 'var(--tm-font-weight-medium)';
  prefix.textContent = '+91';
  control.appendChild(prefix);

  const input = document.createElement('input');
  input.id = 'tm-signin-mobile';
  input.type = 'tel';
  input.inputMode = 'tel';
  input.placeholder = MSG('signin.phonePlaceholder');
  input.style.flex = '1';
  input.style.padding = '0 var(--tm-space-md)';
  input.style.border = 'none';
  input.style.fontSize = 'var(--tm-font-size-body-lg)';
  input.style.background = 'transparent';
  input.setAttribute('aria-describedby', 'tm-signin-helper tm-signin-notice');
  if (stateKey === 'sending') input.readOnly = true;

  control.appendChild(input);
  field.appendChild(control);

  const helper = document.createElement('div');
  helper.id = 'tm-signin-helper';
  helper.className = 'tm-field__helper';
  helper.style.marginTop = '0';
  if (stateKey !== 'not-registered' && stateKey !== 'offline' && stateKey !== 'couldnt-send' && stateKey !== 'too-many-tries' && stateKey !== 'inactive') {
    helper.textContent = MSG('signin.smsHelper');
  }
  field.appendChild(helper);

  // Notices
  const noticeIds = ['tm-signin-notice', 'tm-signin-offline', 'tm-signin-error', 'tm-signin-too-many', 'tm-signin-inactive'];
  noticeIds.forEach(id => {
    const notice = document.createElement('div');
    notice.id = id;
    notice.className = 'tm-notice tm-notice--' + (id.includes('error') || id.includes('inactive') ? 'error' : id.includes('offline') ? 'warning' : id.includes('too-many') ? 'warning' : 'neutral');
    notice.style.marginTop = 'var(--tm-space-sm)';
    notice.hidden = true;
    notice.setAttribute('role', id.includes('notice') && !id.includes('offline') ? 'status' : 'alert');
    const icon = document.createElement('span');
    icon.className = 'tm-icon';
    icon.setAttribute('data-icon', id.includes('error') || id.includes('inactive') ? 'alert-circle' : id.includes('offline') ? 'alert-triangle' : id.includes('too-many') ? 'clock' : 'info-circle');
    icon.setAttribute('aria-hidden', 'true');
    notice.appendChild(icon);
    const text = document.createElement('span');
    notice.appendChild(text);
    field.appendChild(notice);
  });

  fieldsDiv.appendChild(field);

  const button = document.createElement('button');
  button.className = 'tm-btn tm-btn--primary tm-btn--lg tm-btn--block';
  button.style.marginTop = 'var(--tm-space-lg)';
  button.type = 'button';
  button.setAttribute('aria-busy', stateKey === 'sending');
  if (stateKey === 'sending' || stateKey === 'too-many-tries') button.disabled = true;

  const spinner = document.createElement('span');
  spinner.className = 'tm-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  spinner.hidden = stateKey !== 'sending';
  button.appendChild(spinner);

  const btnText = document.createElement('span');
  if (stateKey === 'sending') btnText.textContent = MSG('signin.submitSending');
  else if (stateKey === 'too-many-tries') btnText.textContent = MSG('signin.submitWait');
  else if (stateKey === 'inactive') btnText.textContent = MSG('signin.submitInactive');
  else btnText.textContent = MSG('signin.submitDefault');
  button.appendChild(btnText);
  fieldsDiv.appendChild(button);

  section.appendChild(fieldsDiv);

  // Sign up section
  const signup = document.createElement('div');
  signup.style.margin = '0 calc(-1 * var(--tm-space-page))';
  signup.style.padding = '0 var(--tm-space-page) var(--tm-space-xl)';
  signup.style.background = 'var(--tm-surface-primary)';
  signup.style.textAlign = 'center';
  signup.style.fontSize = 'var(--tm-font-size-body-md)';
  signup.style.color = 'var(--tm-content-secondary)';
  signup.textContent = MSG('signin.signup') + ' ';
  const link = document.createElement('span');
  link.style.color = 'var(--tm-content-brand)';
  link.style.fontWeight = 'var(--tm-font-weight-semibold)';
  link.style.cursor = 'pointer';
  link.textContent = MSG('signin.signupLink');
  signup.appendChild(link);
  section.appendChild(signup);

  host.appendChild(section);

  // Set state (picture-like behavior for demonstration)
  const inputVal = { default: '', 'keyboard-open': '98765', 'empty-tap': '', 'too-short': '98765432', 'wrong-first-digit': '1234567890', 'pasted-cleaned': '9876543210', sending: '9876543210', 'not-registered': '9876543210', offline: '9876543210', 'couldnt-send': '9876543210', 'too-many-tries': '9876543210', inactive: '9876543210' }[stateKey];
  input.value = inputVal;

  // Show appropriate notice
  const noticeMap = { 'not-registered': 'tm-signin-notice', offline: 'tm-signin-offline', 'couldnt-send': 'tm-signin-error', 'too-many-tries': 'tm-signin-too-many', inactive: 'tm-signin-inactive' };
  if (noticeMap[stateKey]) {
    const notice = host.querySelector(`#${noticeMap[stateKey]}`);
    if (notice) {
      notice.hidden = false;
      const text = notice.querySelector('span:last-child');
      const msgKeys = { 'not-registered': 'signin.notRegistered', offline: 'signin.offline', 'couldnt-send': 'signin.couldntSend', 'too-many-tries': 'signin.tooMany', inactive: 'signin.inactive' };
      text.textContent = MSG(msgKeys[stateKey]);
    }
  }

  // Event handlers
  input.addEventListener('input', (e) => {
    const val = e.target.value;
    const cleaned = val.replace(/[^\d]/g, '').slice(0, 10);
    if (val !== cleaned) input.value = cleaned;
  });

  button.addEventListener('click', () => {
    if (stateKey === 'sending' || stateKey === 'too-many-tries') return;
    const number = input.value.replace(/\s+/g, '');
    if (!number) { input.focus(); return; }
    // [MOCK ASSUMPTION: proceed to OTP]
    push(null, { s: 'otp_default' });
  });

  link.addEventListener('click', () => {
    window.open('https://pwa-doctor.truemeds.in/onboarding', '_blank');
  });

  return { journey: "signIn" };
}
