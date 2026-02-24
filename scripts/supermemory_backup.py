#!/usr/bin/env python3
import json
import pathlib
import datetime
import textwrap
import urllib.request
import urllib.error
import os
import re

WORKSPACE = pathlib.Path(__file__).resolve().parent.parent
MEMORY_DIR = WORKSPACE / 'memory'
CREDENTIALS = pathlib.Path.home() / '.config' / 'supermemory' / 'credentials.json'

if not CREDENTIALS.exists():
    raise SystemExit('Supermemory credentials not found')

with CREDENTIALS.open() as fh:
    data = json.load(fh)
    api_key = data.get('api_key')
    if not api_key:
        raise SystemExit('api_key missing in Supermemory credentials')

state_file = MEMORY_DIR / 'supermemory_state.json'
if state_file.exists():
    with state_file.open() as fh:
        state = json.load(fh)
else:
    state = {}

chunks = []
for path in [WORKSPACE / 'MEMORY.md'] + sorted(MEMORY_DIR.glob('*.md')):
    path_str = str(path)
    try:
        lines = path.read_text().splitlines()
    except FileNotFoundError:
        continue
    start = state.get(path_str, {}).get('lines', 0)
    if start >= len(lines):
        continue
    new_text = '\n'.join(lines[start:]).strip()
    if not new_text:
        state[path_str] = {'lines': len(lines)}
        continue
    base_title = path.name
    chunk_size = 8000
    parts = [new_text[i:i+chunk_size] for i in range(0, len(new_text), chunk_size)]
    for idx, part in enumerate(parts, 1):
        header = f"=== {base_title} (chunk {idx}/{len(parts)}) ({datetime.datetime.utcnow().isoformat()} UTC) ==="
        chunks.append((base_title, idx, len(parts), header, part.strip()))
    state[path_str] = {'lines': len(lines)}

requests = []
for base_title, idx, total, header, content in chunks:
    body = f"{header}\n\n{content}"
    safe_tag = re.sub(r'[^A-Za-z0-9_-]+', '-', base_title).strip('-').lower() or 'document'
    payload = json.dumps({
        'content': f"[Athena Backup {datetime.datetime.utcnow().isoformat()} UTC]\n\n{body}",
        'containerTags': ['athena-memory', safe_tag],
        'title': f'Athena backup {base_title} chunk {idx} - {datetime.datetime.utcnow().date()}'
    }).encode('utf-8')
    requests.append(payload)

with state_file.open('w') as fh:
    json.dump(state, fh)

if not requests:
    print('Supermemory backup skipped – no new content since last run.')
    raise SystemExit(0)

last_success = False
for payload in requests:
    req = urllib.request.Request(
        'https://api.supermemory.ai/v3/documents',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'Athena-Supermemory-Backup/1.0'
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
            last_success = True
    except urllib.error.HTTPError as exc:
        body = exc.read().decode('utf-8', errors='ignore')
        raise SystemExit(f'Backup failed: {exc.code} {exc.reason} - {body}')
    except urllib.error.URLError as exc:
        raise SystemExit(f'Backup failed: {exc}')

if last_success:
    print('Supermemory backup complete')
else:
    raise SystemExit('Supermemory backup failed: no payloads sent')
