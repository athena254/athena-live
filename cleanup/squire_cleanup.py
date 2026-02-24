#!/usr/bin/env python3
import pathlib
import time
from datetime import datetime, timedelta

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEMORY = ROOT / 'memory'
LOG = MEMORY / 'qa-cleanup.log'
LOCK_PATTERN = MEMORY / '.agent-lock*'
MAX_AGE = timedelta(hours=1)

LOG.parent.mkdir(parents=True, exist_ok=True)

def log(msg):
    with LOG.open('a') as fh:
        fh.write(f"{datetime.utcnow().isoformat()}Z — {msg}\n")

def cleanup():
    removed = 0
    for path in LOCK_PATTERN.parent.glob(LOCK_PATTERN.name):
        if path.is_file():
            mtime = datetime.utcfromtimestamp(path.stat().st_mtime)
            if datetime.utcnow() - mtime > MAX_AGE:
                path.unlink()
                removed += 1
                log(f"Removed stale lock {path.name}")
    return removed

if __name__ == '__main__':
    removed = cleanup()
    print(f"Cleanup complete — {removed} stale locks removed")
