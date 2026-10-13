#!/usr/bin/env python3
"""Pone una versión nueva (fecha + contador) en version.json, sw.js e index.html.
Se ejecuta antes de cada publicación: así el móvil detecta que hay cambios y muestra el aviso."""
import datetime, json, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
old = json.loads((root / 'version.json').read_text())['version']
today = datetime.date.today().strftime('%Y.%m.%d')
n = int(old.split('-')[1]) + 1 if old.startswith(today + '-') else 1
v = f'{today}-{n}'
(root / 'version.json').write_text(json.dumps({'version': v}) + '\n')
sw = root / 'sw.js'; sw.write_text(re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{v}';", sw.read_text()))
ix = root / 'index.html'; t = ix.read_text()
t = re.sub(r'<meta name="app-version" content="[^"]*">', f'<meta name="app-version" content="{v}">', t)
t = re.sub(r'((?:href|src)="(?:css|js)/[^"?]+)(?:\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={v}"', t)
ix.write_text(t)
print(v)
