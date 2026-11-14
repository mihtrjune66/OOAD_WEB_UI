"""Trang xem database SQLite trực tiếp (chỉ đọc), tự cập nhật mỗi 2 giây.

Chạy (từ thư mục gốc repo):  python tools/xem_db.py [đường_dẫn_file.db] [cổng]
Mở:                          http://127.0.0.1:8765
Mặc định đọc backend_admin/fashion_ooad.db – đúng file mà server FastAPI đang dùng.
"""
import json
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

DB_FILE = Path(sys.argv[1] if len(sys.argv) > 1 else
               Path(__file__).resolve().parent.parent / "backend_admin" / "fashion_ooad.db")
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8765


def query(table=None):
    # mode=ro: mở file ở chế độ CHỈ ĐỌC, không bao giờ ghi vào database
    con = sqlite3.connect(f"file:{DB_FILE}?mode=ro", uri=True)
    try:
        tables = [r[0] for r in con.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
        counts = {t: con.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0] for t in tables}
        result = {"tables": tables, "counts": counts}
        if table in tables:
            sql = f'SELECT * FROM "{table}"'
            cur = con.execute(sql)
            result.update(table=table, sql=sql,
                          columns=[d[0] for d in cur.description],
                          rows=[list(r) for r in cur.fetchall()])
        return result
    finally:
        con.close()


PAGE = r"""<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Xem Database</title>
<style>
:root{--bg:#f7f7f8;--card:#fff;--text:#111;--muted:#666;--line:#e3e3e6;--accent:#111;--new:#fff3b0}
body{margin:0;font-family:Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--text)}
header{padding:14px 20px;background:var(--accent);color:#fff;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
header h1{font-size:18px;margin:0}
#status{font-size:13px;opacity:.85}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#3ddc84;margin-right:6px}
.wrap{display:flex;gap:16px;padding:16px 20px}
nav{min-width:210px}
nav button{display:flex;justify-content:space-between;width:100%;padding:8px 10px;margin-bottom:4px;border:1px solid var(--line);
  background:var(--card);border-radius:8px;cursor:pointer;font-size:13px;text-align:left}
nav button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
nav button.chg{outline:2px solid #f0b400}
main{flex:1;min-width:0}
code{display:block;background:#1e1e1e;color:#9cdcfe;padding:10px 12px;border-radius:8px;font-size:13px;margin-bottom:10px}
.tbl{overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap;max-width:360px;overflow:hidden;text-overflow:ellipsis}
th{background:#fafafa;position:sticky;top:0}
tr.new td{background:var(--new);transition:background 4s}
#log{font-size:13px;color:var(--muted);margin-top:12px}
@media(max-width:700px){.wrap{flex-direction:column}nav{min-width:0}}
</style></head><body>
<header><h1>🗄️ Xem Database trực tiếp</h1><span id="status"></span>
<label style="font-size:13px"><input type="checkbox" id="pause"> Tạm dừng</label></header>
<div class="wrap"><nav id="nav"></nav><main>
<code id="sql"></code><div class="tbl"><table id="t"></table></div><div id="log"></div></main></div>
<script>
let cur = new URLSearchParams(location.search).get('t') || 'KHACH_HANG';
let seen = {}, prevCounts = null, logs = [];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function pick(t){ cur = t; seen[cur] = null; history.replaceState(null,'','?t='+t); load(); }
async function load(){
  if (document.getElementById('pause').checked) return;
  try{
    const d = await (await fetch('/api?t='+encodeURIComponent(cur))).json();
    if (prevCounts) for (const t of d.tables) if (prevCounts[t] !== d.counts[t]) {
      logs.unshift(`${new Date().toLocaleTimeString()} – ${t}: ${prevCounts[t]} → ${d.counts[t]} dòng`); logs = logs.slice(0,8);
      document.querySelector(`[data-t="${t}"]`)?.classList.add('chg');
    }
    prevCounts = d.counts;
    document.getElementById('nav').innerHTML = d.tables.map(t =>
      `<button data-t="${t}" class="${t===cur?'on':''}" onclick="pick('${t}')"><span>${t}</span><b>${d.counts[t]}</b></button>`).join('');
    document.getElementById('sql').textContent = d.sql || '';
    const old = seen[cur]; const keys = new Set();
    const body = (d.rows||[]).map(r => { const k = JSON.stringify(r); keys.add(k);
      return `<tr class="${old && !old.has(k) ? 'new' : ''}">${r.map(v=>`<td title="${esc(v)}">${esc(v)}</td>`).join('')}</tr>`; }).join('');
    document.getElementById('t').innerHTML = `<tr>${(d.columns||[]).map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${body}`;
    seen[cur] = keys;
    document.getElementById('log').innerHTML = logs.length ? '<b>Thay đổi gần đây:</b><br>'+logs.join('<br>') : 'Chưa có thay đổi nào kể từ khi mở trang.';
    document.getElementById('status').innerHTML = `<span class="dot"></span>Cập nhật lúc ${new Date().toLocaleTimeString()} · ${d.rows?.length ?? 0} dòng`;
  }catch(e){ document.getElementById('status').textContent = '⚠️ Không đọc được database: ' + e.message; }
}
load(); setInterval(load, 2000);
</script></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api":
            table = parse_qs(url.query).get("t", [None])[0]
            try:
                body, ctype, code = json.dumps(query(table), ensure_ascii=False, default=str), "application/json", 200
            except Exception as e:  # file đang bị khóa/không tồn tại
                body, ctype, code = json.dumps({"error": str(e)}), "application/json", 500
        elif url.path == "/":
            body, ctype, code = PAGE, "text/html", 200
        else:
            body, ctype, code = "Not found", "text/plain", 404
        data = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", f"{ctype}; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):  # không in log mỗi lần trang tự tải lại
        pass


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # console Windows in được tiếng Việt
    if not DB_FILE.exists():
        sys.exit(f"Không tìm thấy file database: {DB_FILE}")
    print(f"Đang xem: {DB_FILE}\nMở trình duyệt: http://127.0.0.1:{PORT}  (Ctrl+C để tắt)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
