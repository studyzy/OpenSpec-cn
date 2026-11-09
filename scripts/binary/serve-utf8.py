# Serves a directory over HTTP the way GitHub's raw endpoint does: script and
# text files are labelled `text/plain; charset=utf-8`.
#
# `python -m http.server` sends a bare `text/plain` (and
# `application/octet-stream` for .ps1), and Windows PowerShell 5.1's `irm` then
# decodes install.ps1 as ANSI. That file is UTF-8 and carries Chinese, so the
# text is mangled before iex ever sees it. The real download has the charset,
# so the test server must not introduce the difference.
import functools
import http.server
import sys

DIRECTORY = sys.argv[1] if len(sys.argv) > 1 else '.'
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8000

TEXT_SUFFIXES = ('.ps1', '.sh', '.txt', '.md', '.atom')


class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        name = str(path).rsplit('/', 1)[-1]
        # SHA256SUMS and releases.atom have no suffix that mimetypes knows.
        if name.endswith(TEXT_SUFFIXES) or '.' not in name:
            return 'text/plain; charset=utf-8'
        guessed = super().guess_type(path)
        return guessed[0] if isinstance(guessed, tuple) else guessed


if __name__ == '__main__':
    handler = functools.partial(Handler, directory=DIRECTORY)
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler).serve_forever()