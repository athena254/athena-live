#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import sys

def find_telos_dir(base: Path) -> Path:
    candidates = [
        base / "Personal_AI_Infrastructure" / "Releases" / "v3.0" / ".claude" / "skills" / "PAI" / "USER" / "TELOS",
        base / "Personal_AI_Infrastructure" / "Releases" / "v2.5" / ".claude" / "skills" / "PAI" / "USER" / "TELOS",
        base / "Personal_AI_Infrastructure" / "Releases" / "v2.4" / ".claude" / "skills" / "CORE" / "USER" / "TELOS",
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_dir():
            return candidate
    raise FileNotFoundError("TELOS directory not found in PAI releases")


def summarize_file(path: Path, line_limit: int = 3):
    lines = []
    try:
        with path.open("r", encoding="utf-8", errors="ignore") as fh:
            for raw in fh:
                text = raw.strip()
                if not text:
                    continue
                lines.append(text)
                if len(lines) >= line_limit:
                    break
    except Exception:
        lines = ["<unable to read>"]
    return lines or ["<empty file>"]


def main():
    base = Path("/root/.openclaw/workspace")
    try:
        telos_dir = find_telos_dir(base)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

    summary_path = base / "memory" / "telos-snapshot.md"
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    header = f"## {timestamp} (TELOS snapshot)"

    files = sorted([p for p in telos_dir.glob("*.md") if p.is_file()])
    if not files:
        print("No TELOS markdown files found.")
        return

    buffer = [header, f"- Source directory: {telos_dir}", "- File summaries:"]
    for f in files:
        summary_lines = summarize_file(f)
        buffer.append(f"  - {f.name}:")
        for line in summary_lines:
            buffer.append(f"    - {line}")
    buffer.append("")

    content = "\n".join(buffer)
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    with summary_path.open("a", encoding="utf-8") as out:
        out.write(content)

    print(content)


if __name__ == "__main__":
    main()
