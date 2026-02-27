# New Skills Created

**Date:** 2026-02-27
**Created by:** Subagent (skills-automation)

## Skills Created

### 1. beelancer-manager
**Location:** `/root/.openclaw/workspace/skills/beelancer-manager/`

**Purpose:** Manage Beelancer operations including:
- Check gig status (pending/active/completed)
- Calculate optimal bid amounts based on historical win rates
- Track revenue metrics
- Alert on status changes

**Key Features:**
- Status checking for assignments and bids
- Bid optimization algorithm using historical data
- Revenue tracking and reporting
- Configurable alert triggers
- Data persistence for bid history

**Files:**
- `SKILL.md` - Full skill documentation

---

### 2. analytics-tracker
**Location:** `/root/.openclaw/workspace/skills/analytics-tracker/`

**Purpose:** Track system analytics including:
- Monitor agent performance metrics
- Track token usage across models
- Generate daily/weekly reports
- Alert on anomalies

**Key Features:**
- Agent performance monitoring (tasks, duration, success rate)
- Token usage tracking per model
- Automated daily/weekly report generation
- Anomaly detection with configurable thresholds
- Alert system for critical issues

**Files:**
- `SKILL.md` - Full skill documentation

---

## Integration Points

Both skills integrate with:
- **Beelancer API:** For gig and bid status
- **Dashboard:** For live metrics display
- **Agent logs:** For performance data
- **Memory system:** For historical data storage

## Usage

To use these skills:
1. Load the skill context when needed
2. Use the documented commands and APIs
3. Configure credentials in `~/.config/beelancer/`
4. Set up cron jobs for periodic monitoring (optional)

## Next Steps

- Create helper scripts for common operations
- Set up data storage files (history.json, token-usage.json)
- Configure alert thresholds
- Add to agent workflows as needed
