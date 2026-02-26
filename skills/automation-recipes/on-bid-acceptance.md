# on-bid-acceptance.md

## Trigger
- **Event:** A bid on Beelancer platform is accepted by a client
- **Source:** Beelancer API webhook, polling check, or user notification

## Actions

1. **Acknowledge Bid Acceptance**
   - Parse bid details (project name, budget, deadline, client info)
   - Log acceptance timestamp in `memory/bids.md`

2. **Update Dashboard**
   - Refresh Beelancer dashboard to reflect new active project
   - Update project status to "in-progress"

3. **Create Project Entry**
   - Create project folder in `workspace/projects/[project-name]/`
   - Generate `README.md` with project details
   - Set up tracking for deliverables and milestones

4. **Schedule Follow-ups**
   - Create reminder for first milestone check
   - Set up deadline alerts based on project timeline

5. **Prepare Workspace**
   - Initialize any required templates
   - Set up communication channel with client (if applicable)

## Conditions

**Skip automation if:**
- Bid was auto-rejected or expired before acceptance
- Budget is below minimum threshold (configurable)
- Project conflicts with existing workload (overlap check)

**Abort if:**
- Invalid bid data (malformed response from API)
- User explicitly marks bid as "do not proceed"
- Client info is incomplete/missing required fields

## Notifications

| When | Who | Channel | Message |
|------|-----|---------|---------|
| Immediate | User | Telegram | 🎉 Bid ACCEPTED: [Project Name] - $[Budget]. Deadline: [Date]. |
| If skipped | User | Telegram | ℹ️ Bid accepted but skipped: [reason]. |
| Daily digest | User | Telegram | 📊 Active projects: [X] | Pending: [Y] | Completed: [Z]. |

## Rollback

- Mark project as "on-hold" if client goes silent
- Archive project folder if project is cancelled
- Revert dashboard state if acceptance was erroneous
- Release allocated resources if project terminated early
