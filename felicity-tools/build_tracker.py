#!/usr/bin/env python3
import json
import pathlib
import datetime
import argparse

ROOT = pathlib.Path(__file__).resolve().parent
LOG = ROOT / 'build-log.json'

LOG.parent.mkdir(parents=True, exist_ok=True)
if not LOG.exists():
    LOG.write_text('[]')

parser = argparse.ArgumentParser(description='Felicity Build Tracker')
parser.add_argument('--note', '-n', help='Short description of the build')
parser.add_argument('--status', '-s', choices=['planning', 'doing', 'done'], default='done')
parser.add_argument('--list', '-l', action='store_true', help='List recent builds')
parser.add_argument('--count', '-c', type=int, default=5, help='List number of builds to show')
args = parser.parse_args()

if args.list:
    entries = json.loads(LOG.read_text())
    entries = entries[-args.count:]
    for entry in entries:
        print(f"[{entry['time']}] {entry['status'].upper()}: {entry['note']}")
else:
    if not args.note:
        raise SystemExit('Please provide --note describing the build')
    entry = {
        'time': datetime.datetime.utcnow().isoformat() + 'Z',
        'note': args.note,
        'status': args.status
    }
    entries = json.loads(LOG.read_text())
    entries.append(entry)
    LOG.write_text(json.dumps(entries, indent=2))
    print(f"Logged build: {entry['note']} ({entry['status']})")
