# Discord Mission Control Setup

## Channels
Create these channels in your Discord mission-control server and use the provided descriptions for context:

### #mission-control
> "Mission Control chatter: daily dashboards, progress snapshots, API endpoints (`athena-live/api/*.json`), and build highlights. Drop console links or quick status updates here."

### #beelancer-alerts
> "Sterling’s bidding pulse. Post pending/active counts, successes, and rate-limit notes. Silent unless something changes or an acceptance lands."

### #telos-stream
> "TELOS stream pulls + update helper coordination. Share pull status, helper run logs, merge notes, and blockers."

### #cron-reports
> "Automated reports and reminders. Morning/evening reports, water-bill reminder, morning build digest drops here. Keep posts threaded for follow-ups."

### #system-health
> "Gateway status, model/rate-limit warnings, outages, or unexpected drops. Good place to log the WhatsApp/Telegram reconnections."

### #off-duty
> "Sarcastic puns, build memes, warm fuzzies, or anything you want to drop when the system hums."

Pin https://athena254.github.io/athena-live/ inside #mission-control.

## Webhook Payload Samples
Copy/paste these JSON payloads when wiring your webhooks or bots.

### Mission Control update
```json
{
  "username": "Mission Control",
  "avatar_url": "https://example.com/mission-control-icon.png",
  "embeds": [
    {
      "title": "Mission Control refresh",
      "description": "6 API endpoints synced. 10 agents · 10 models · Dashboard live.",
      "url": "https://athena254.github.io/athena-live/",
      "fields": [
        { "name": "Refresh interval", "value": "30s (configurable)", "inline": true },
        { "name": "Next helper run", "value": "in 00:29:12", "inline": true }
      ],
      "color": 3066993,
      "timestamp": "2026-02-25T10:11:00Z"
    }
  ]
}
```

### Beelancer alert
```json
{
  "username": "Sterling",
  "content": "Beelancer status update",
  "embeds": [
    {
      "title": "Pending bids: 10 · Active gigs: 0",
      "description": "Sterling auto-bidder running silently. No acceptances yet.",
      "color": 15105570,
      "timestamp": "2026-02-25T10:11:00Z"
    }
  ]
}
```

### TELOS stream pull
```json
{
  "username": "TELOS Stream",
  "content": "Pull queue update",
  "embeds": [
    {
      "title": "Remaining pulls",
      "description": "1. mission-control DASHBOARD · 2. telos-update-helper · 3. analytics-pack",
      "fields": [
        { "name": "Next action", "value": "Refresh helper script & confirm schema", "inline": false }
      ],
      "color": 3447003,
      "timestamp": "2026-02-25T10:11:00Z"
    }
  ]
}
```

### Cron report reminder (4 PM water bill / morning / evening)
```json
{
  "username": "Cron",
  "content": "🚨 Reminder: 4:00 PM EAT – pay the water bill now. 🚨",
  "color": 15844367,
  "timestamp": "2026-02-25T13:00:00Z"
}
```
(Replace the `content` and `timestamp` fields for the morning/evening reports or other reminders.)

### System health blip
```json
{
  "username": "System Health",
  "content": "WhatsApp gateway reconnected after brief 499 drop.",
  "color": 16776960,
  "timestamp": "2026-02-25T12:36:45Z"
}
```

## Action Items
1. Create the above channels in Discord.
2. Create webhooks (or use a bot) that post JSON payloads into the right channels (Cron → #cron-reports, Mission Control refreshes → #mission-control, etc.).
3. Pin the dashboard link and the channel descriptions so the crew always knows where to drop what.
4. Optional: script the helper/TELOS pulls to post status updates via the TELOS webhook.

Need me to stash this file in `memory/` or update any existing docs with the same instructions? 
