# Athena Build Checklist

## Nightly Build Cycle Protocol
1. **Build & Document:** Run the mission-control build (`npm run build`) for Athena Mission Control and Athena Cyberdash, capturing the git diff + key updates in a short entry (timestamp + summary) in `memory/nightly-build-log.md`.  
2. **Push & Deploy:** Sync the built assets to the respective GitHub Pages branch (`gh-pages` for Athena Mission Control, a new branch like `cyberdash-gh-pages` for Athena Cyberdash). Record the deployed commit + URL.  
3. **Inspect & Improve:** After deployment, review telemetry (pending bids, helper logs, council status) and identify one improvement (new widget, data hook, automation tweak). Log it as the next action.  
4. **Repeat:** Immediately start step 1 again—this is your nightly "build --> review --> improve" loop until the next checkpoint.

## Mission Control Focus
- Confirm APIs (`api/*.json`) continue to feed Athena Mission Control with real-time data. Add new endpoints if required (e.g., `/api/council.json`).  
- Keep THEMIS/text verdicts surfaced via a new panel, ensuring the mission control shows their current debate topic.  
- Maintain the `build-log` entry each cycle with screenshot links or summary of changes.

## Athena Cyberdash Focus
- Replace hard-coded data with fetch calls to the shared APIs above. Use the same hooks as Athena Mission Control when possible.  
- Add an "Auto-Refresh" toggle and `refreshInterval` controls so it mirrors Athena Mission Control’s behavior.  
- Wire the Subagent Monitor & Quick Actions to the live status feed (match the agent names, tasks, statuses).  
- Determine deployment path (e.g., branch `cyberdash-gh-pages`) and prepare a script to deploy distilled assets after each build.

## Reminders & Alternation
- Use the existing half-hour cron check-ins as a reminder to document progress.  
- Add a nightly cron reminder (`/root/.openclaw/workspace/nightly-check-in.md`) at 22:00 UTC to trigger the build log update and review new tasks.  
- Alternate focus between dashboards: after documenting Athena Mission Control, pivot to Cyberdash improvements, then back to Mission Control for the next build.

## Tracking Log (Update after every build)
- Timestamp: __
- Dashboard built: [Athena Mission Control / Athena Cyberdash]
- Key updates: [short bullet list]
- Next action: [what you'll tackle in the next loop]
- Deployed to: [branch/URL]
