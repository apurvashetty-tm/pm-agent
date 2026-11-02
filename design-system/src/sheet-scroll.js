/* Round 6 (RULES §9.4): a sheet's pinned actions show their hairline + soft upward shadow only while content scrolls under them.
   Sets .is-stuck on .tm-sheet__actions when the sheet is not scrolled to its end. Plain script, no dependencies; load it after truemeds.css. */
(function () {
  function sync(sheet) {
    var actions = sheet.querySelector(':scope > .tm-sheet__actions');
    if (!actions) return;
    var under = sheet.scrollTop + sheet.clientHeight < sheet.scrollHeight - 1;   // content below the visible end = content under the pinned actions
    actions.classList.toggle('is-stuck', under && sheet.getClientRects().length > 0);
  }
  function syncAll() {
    document.querySelectorAll('.tm-sheet').forEach(sync);
  }
  document.addEventListener('scroll', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('tm-sheet')) sync(e.target);
  }, true);
  var pending = false;
  function queue() {   // sheets open, close and re-render through class and content changes
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; syncAll(); });
  }
  if (window.MutationObserver) new MutationObserver(queue).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
  window.addEventListener('resize', queue);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncAll); else syncAll();
})();
