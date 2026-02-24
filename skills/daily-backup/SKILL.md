# daily-backup Skill

Automated daily backup of Athena workspace to GitHub.

## Trigger

Runs automatically at midnight UTC via cron job "Daily Athena Backup to GitHub".

## What It Does

1. Checks `/root/.openclaw/` for changes
2. Stages all modified/new files (respects `.gitignore`)
3. Commits with timestamped message
4. Pushes to `github.com:athena254/Athena-backup`
5. Reports success/failure to user

## Usage

```bash
# Manual trigger
/root/.openclaw/workspace/skills/daily-backup/bin/backup
```

## Credentials Required

- SSH key: `~/.ssh/id_ed25519_athena` (must be added to GitHub)
- Git remote: `git@github.com:athena254/Athena-backup.git`

## Silent Mode

- Only notifies on failure or major changes (>100 files)
- Successful routine backups logged but not announced
