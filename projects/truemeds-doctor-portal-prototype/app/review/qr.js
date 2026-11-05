// QR code from the vendored qrcode-generator (window.qrcode). No CDN (checklist 5.12).
export function qrSvg(text) {
  if (typeof window.qrcode !== "function") return "<p>QR library not loaded.</p>";
  const qr = window.qrcode(0, "M");
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ scalable: true, margin: 2 });
}
