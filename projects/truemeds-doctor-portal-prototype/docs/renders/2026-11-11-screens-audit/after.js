(screen) => {
  // Screens audit — agreed DOM moves for the after pictures only (tools/capture.py after). Copy comes from after-copy.json.
  if (screen === 'home') {
    const sheet = document.querySelector('.tm-sheet');
    // Sheet subtitle sits 8 under its title, inside the header (title + subtitle are one block, as in the band).
    const head = sheet && sheet.querySelector('.tm-sheet__header'), sub = sheet && sheet.querySelector('.tm-sheet__body > .tm-sheet__subtitle:first-child');
    if (head && sub && !head.querySelector('.tm-sheet__titles')) {
      const box = document.createElement('div'); box.className = 'tm-sheet__titles';
      box.append(head.querySelector('.tm-sheet__title'), sub); head.prepend(box);
    }
    const picker = sheet && sheet.querySelector('.picker');
    if (picker && !picker.querySelector('.qp')) {   // the same picker as Home v3 setup: "Quick picks" over the chips
      const qp = document.createElement('p'); qp.className = 'adjust qp'; qp.textContent = 'Quick picks';
      picker.prepend(qp);
    }
    const fb = sheet && sheet.querySelector('.sheet-feedback');
    const acts = sheet && sheet.querySelector('.tm-sheet__actions');
    if (fb && acts) acts.prepend(fb);   // the result notice sits in the pinned actions, 16 above Add (A-12 / A-19)
  }
  if (screen === 'faster-signin-offer') {   // point 1 says the benefit once, by method (the subtitle already says "instead of an OTP")
    const t = document.querySelector('.points li:first-child .pt-t');
    const ic = (document.getElementById('hero-icon') || {}).dataset || {};
    const how = { fingerprint: 'one touch', 'face-id': 'a glance', face: 'a glance', lock: 'your PIN or pattern' }[ic.icon] || 'one touch';
    if (t) t.textContent = 'Sign in with ' + how;
  }
  if (screen === 'home-v3') {   // "Minimum 15 minutes" back on the Custom row (D-40)
    document.querySelectorAll('.frame .group .lbl').forEach(l => {
      if (l.textContent.trim() !== 'Custom' || l.querySelector('.help')) return;
      l.classList.add('with-help'); l.innerHTML = 'Custom<span class="help">Minimum 15 minutes</span>';
    });
  }
}
