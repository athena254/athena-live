#!/usr/bin/env python3
import argparse
import shlex
from datetime import datetime
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="Prepare a TELOS update command and log it safely.")
    parser.add_argument("file", help="TELOS target file (e.g., BOOKS.md, GOALS.md")
    parser.add_argument("content", help="Content to append to the file")
    parser.add_argument("description", help="Change description for updates.md")
    parser.add_argument("--dry-run", action="store_true", help="Do not run the command, only log it")
    return parser.parse_args()

VALID_FILES = {
    "BELIEFS.md",
    "BOOKS.md",
    "CHALLENGES.md",
    "FRAMES.md",
    "GOALS.md",
    "LESSONS.md",
    "MISSION.md",
    "MODELS.md",
    "MOVIES.md",
    "NARRATIVES.md",
    "PREDICTIONS.md",
    "PROBLEMS.md",
    "PROJECTS.md",
    "STRATEGIES.md",
    "TELOS.md",
    "TRAUMAS.md",
    "WISDOM.md",
    "WRONG.md",
}

LOG_PATH = Path("/root/.openclaw/workspace/memory/ishtar-telos-update.log")


def main():
    args = parse_args()
    target = args.file.upper()
    if target not in VALID_FILES:
        print(f"ERROR: {target} is not a valid TELOS file. Valid entries: {', '.join(sorted(VALID_FILES))}")
        raise SystemExit(1)

    command = [
        "bun",
        Path("~/.claude/commands/update-telos.ts").expanduser().as_posix(),
        target,
        args.content,
        args.description,
    ]
    command_str = " ".join(shlex.quote(part) for part in command)

    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as log:
        log.write(f"{timestamp} | {target} | {args.description}\n")
        log.write(f"content: {args.content}\n")
        log.write(f"command: {command_str}\n")
        log.write("---\n")

    print("TELOS update helper prepared the following command:")
    print(command_str)
    if not args.dry_run:
        print("Note: execute the command above in your TELOS environment when ready.")
    else:
        print("Dry run mode active; command not executed.")


if __name__ == "__main__":
    main()
