"""Servidor local opcional, sem dependências. Execute: python servir.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import mimetypes
import webbrowser

mimetypes.add_type('text/javascript', '.js')
root = Path(__file__).resolve().parent


class SemCache(SimpleHTTPRequestHandler):
    """Evita que o navegador reutilize versões antigas dos arquivos durante o desenvolvimento."""

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()


for port in range(8000, 8011):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), partial(SemCache, directory=str(root)))
        break
    except OSError:
        continue
else:
    raise SystemExit('Portas 8000 a 8010 ocupadas. Use o Live Server do VS Code.')
url = f'http://127.0.0.1:{port}'
print(f'Biblioteca Aurora: {url}\nPasta servida: {root}\nEncerre com Ctrl+C.')
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()