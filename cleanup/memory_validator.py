#!/usr/bin/env python3
import pathlib
import json
from datetime import datetime, timezone

MEMORY_DIR = pathlib.Path(__file__).resolve().parent.parent / 'memory'
REPORT = MEMORY_DIR / 'validation-report.json'

results = {
    'timestamp': datetime.now(timezone.utc).isoformat() + 'Z',
    'files': []
}

for path in sorted(MEMORY_DIR.glob('*.md')):
    text = path.read_text().strip()
    lines = text.splitlines()
    issues = []
    if not text:
        issues.append('Empty file')
    elif not lines[0].startswith('#'):
        issues.append('Missing header')
    if len(lines) > 1 and 'UTC' not in lines[1]:
        issues.append('Second line lacks timezone indicator')
    results['files'].append({'path': str(path), 'issues': issues})

REPORT.write_text(json.dumps(results, indent=2))
print('Memory validation complete — report saved to validation-report.json')
