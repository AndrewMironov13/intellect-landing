#!/usr/bin/env python3
"""Пререндер SPA для краулеров без JavaScript.
Запускать ЛОКАЛЬНО после изменения контента: `npm run prerender`. Результат prerender/root.html
коммитится, а сборка на хостинге (без Chrome) просто вшивает его через vite-плагин.
Поднимает статический сервер на dist/, открывает страницу в headless Chrome с
prefers-reduced-motion (анимации входа отключены, весь контент видим), ждёт
догрузку отложенных картинок и вшивает innerHTML #root в dist/index.html.
Для живых пользователей React перерисует дерево сам; hero до этого спрятан
правилом `html.js [data-prerender] .hero`, чтобы текст не мигал дважды.
    python3 scripts/prerender.py [dist] [base_path]
"""
import asyncio, json, os, shutil, signal, socket, subprocess, sys, tempfile, time, urllib.request
try:
    import websockets
except ImportError:
    sys.exit('нужен websockets: pip3 install websockets')

DIST = sys.argv[1] if len(sys.argv) > 1 else 'dist'
BASE = (sys.argv[2] if len(sys.argv) > 2 else os.environ.get('VITE_BASE', '/')).rstrip('/') + '/'
CHROME = next((p for p in ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', shutil.which('google-chrome') or '', shutil.which('chromium') or ''] if p and os.path.exists(p)), None)
if not CHROME: sys.exit('Chrome не найден')

def free_port():
    with socket.socket() as s: s.bind(('127.0.0.1', 0)); return s.getsockname()[1]

def page_target(port, tries=60):
    for _ in range(tries):
        try:
            for t in json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json')):
                if t.get('type') == 'page' and t.get('url', '').startswith(('http', 'about:')): return t
        except Exception: pass
        time.sleep(0.2)
    return None

async def main():
    http_port, cdp_port = free_port(), free_port()
    root = os.path.abspath(DIST)
    # base_path вида /repo/ обслуживаем как подпапку: временная директория-обёртка
    serve_dir = root
    if BASE != '/':
        serve_dir = tempfile.mkdtemp(prefix='prerender-'); os.symlink(root, os.path.join(serve_dir, BASE.strip('/')))
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(http_port), '--bind', '127.0.0.1', '--directory', serve_dir], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='prerender-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', f'--remote-debugging-port={cdp_port}', f'--user-data-dir={prof}', '--window-size=1440,900', '--hide-scrollbars', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        t = page_target(cdp_port)
        if not t: sys.exit('CDP: вкладка не найдена')
        async with websockets.connect(t['webSocketDebuggerUrl'], max_size=64 * 2**20) as ws:
            n = 0
            async def cmd(method, **params):
                nonlocal n; n += 1
                await ws.send(json.dumps({'id': n, 'method': method, 'params': params}))
                while True:
                    m = json.loads(await ws.recv())
                    if m.get('id') == n: return m.get('result', {})
            await cmd('Page.enable'); await cmd('Runtime.enable')
            await cmd('Emulation.setDeviceMetricsOverride', width=1440, height=900, deviceScaleFactor=1, mobile=False)
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-reduced-motion', 'value': 'reduce'}])
            await cmd('Page.navigate', url=f'http://127.0.0.1:{http_port}{BASE}')
            await asyncio.sleep(5)  # отложенные картинки ставят src через 3,5 с
            r = await cmd('Runtime.evaluate', expression="(()=>{const r=document.getElementById('root'); if(!r||!r.children.length) return ''; return r.innerHTML})()", returnByValue=True)
            html = r.get('result', {}).get('value', '')
            if not html or 'Оклейка' not in html: sys.exit('пререндер: страница не отрендерилась')
    finally:
        chrome.send_signal(signal.SIGTERM); srv.send_signal(signal.SIGTERM)
        chrome.wait(timeout=5); srv.wait(timeout=5)
        shutil.rmtree(prof, ignore_errors=True)
        if serve_dir != root: shutil.rmtree(serve_dir, ignore_errors=True)
    # фрагмент не зависит от base-пути хостинга: base заменяем токеном, плагин подставит свой
    base_prefix = BASE.rstrip('/')
    frag = html.replace(f'src="{base_prefix}/', 'src="__BASE__/').replace(f'href="{base_prefix}/', 'href="__BASE__/') if base_prefix else html.replace('src="/', 'src="__BASE__/').replace('href="/', 'href="__BASE__/')
    os.makedirs('prerender', exist_ok=True)
    open(os.path.join('prerender', 'root.html'), 'w', encoding='utf-8').write(frag)
    idx = os.path.join(root, 'index.html'); s = open(idx, encoding='utf-8').read()
    if '<div id="root"></div>' in s:
        s = s.replace('<div id="root"></div>', f'<div id="root"><div data-prerender>{html}</div></div>')
        open(idx, 'w', encoding='utf-8').write(s)
    print(f'пререндер: {len(html)//1024} КБ → prerender/root.html (и вшито в {idx})')

asyncio.run(main())
