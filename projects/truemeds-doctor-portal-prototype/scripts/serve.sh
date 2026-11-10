#!/bin/sh
# Serves the doctor-portal prototype (app/) on this Mac so a phone on the same Wi-Fi can open the Test on phone link (D-97 item 3).
#   sh projects/truemeds-doctor-portal-prototype/scripts/serve.sh [port]      (default 8080)
# Runs copy-shared.sh, prints the URLs, then serves app/ with python3's http.server (SimpleHTTPRequestHandler). The one change
# from a plain `python3 -m http.server`: the app page it sends carries the Mac's network address
# (<meta name="tm-network-origin">), which the review panel uses for the QR / play link. Stop with Ctrl-C.
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
APP=$(cd "$HERE/../app" && pwd)
PORT="${1:-8080}"
sh "$HERE/copy-shared.sh"
IP=""
for IF in en0 en1 en2 en3; do IP=$(ipconfig getifaddr "$IF" 2>/dev/null || true); [ -n "$IP" ] && break; done
[ -z "$IP" ] && IP=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
echo "On this Mac:   http://localhost:$PORT/"
if [ -n "$IP" ]; then echo "On the phone:  http://$IP:$PORT/   (phone and Mac on the same Wi-Fi)"
else echo "No network address found: the phone link will point at localhost. Join a Wi-Fi network and start again."; fi
cd "$APP"
exec python3 - "$PORT" "$IP" <<'PY'
import sys, http.server, socketserver
port, ip = int(sys.argv[1]), sys.argv[2]
META = (f'<meta name="tm-network-origin" content="http://{ip}:{port}">' if ip else '').encode()
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if META and path in ('/', '/index.html'):
            body = open('index.html', 'rb').read().replace(b'</head>', META + b'\n</head>', 1)
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(body))); self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(body)
            return
        super().do_GET()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('0.0.0.0', port), H) as s:
    s.serve_forever()
PY
