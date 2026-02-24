# WORKFLOW_AUTO.md — Automation Workflow Registry

**Created:** 2026-02-23 UTC

## Purpose
Keep a living manifest of critical automation files so they can be reloaded quickly after compaction or restarts. Anyone auditing the workspace should find this file first.

## Essential Entries
1. **Morning report cron job** — ID `6348f75f-88c8-4857-8ba6-abab5570c1ca` runs every day at 04:00 UTC (7 AM EAT) in the isolated session. It pulls weather, news, memory/daily-tracker.json, and the Beelancer snapshot, then announces the briefing. Keep the payload text current in this doc for reference.
2. **Daily tracker JSON** — Located at `memory/daily-tracker.json`. Holds `user_tasks`, `athena_tasks`, `constraints`, and `completed_today`. The morning report expects it; if it vanishes, regenerate a placeholder from this file.
3. **Athena Live refresh** — `athena-live/api/refresh-data.mjs` runs every 5 minutes. The scheduler should log success here when it completes.

## Recovery Steps
- If `WORKFLOW_AUTO.md` disappears, recreate it from this template and add the key automation entries immediately.
- If `memory/daily-tracker.json` goes missing, populate it with the latest task breakdown (copy from `memory/2026-02-23.md` or the state you have right now).
- After recreating, re-run morning report and refresh cron to confirm the scheduler sees the file.

## Accountability
Copy this file into your daily build log (memory/daily-build-today.md) whenever you update automation entries so we always have a backup.
