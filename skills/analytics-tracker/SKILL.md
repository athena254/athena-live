# Analytics Tracker Skill

## Purpose
Track system analytics: monitor agent performance, track token usage, generate reports, and alert on anomalies.

## Configuration

**Data Sources:**
- Agent logs: `/root/.openclaw/workspace/memory/`
- Token usage: `~/.config/athena/token-usage.json`
- Dashboard metrics: `/root/.openclaw/workspace/athena-live/api/`

**Alert Config:** `~/.config/athena/analytics-alerts.json`

## Available Actions

### 1. Monitor Agent Performance
Track performance metrics for each Athena agent.

**Metrics to Track:**
- Tasks completed per agent
- Average task duration
- Success rate
- Error rate
- Response time
- Model usage per agent

```bash
# Example: Get agent stats from logs
grep -r "agent:" /root/.openclaw/workspace/memory/2026-02-*.md | \
  awk '{print $2}' | sort | uniq -c | sort -rn
```

### 2. Track Token Usage
Monitor token consumption across all models.

**Track:**
- Total tokens per model (GPT, GLM, Claude, etc.)
- Daily/weekly/monthly usage
- Cost estimation
- Rate limit proximity

```bash
# Parse token usage from logs
grep "tokens" /root/.openclaw/workspace/memory/*.md | \
  awk '{sum += $NF} END {print "Total:", sum}'
```

### 3. Generate Reports
Create daily/weekly performance reports.

**Daily Report Includes:**
- Tasks completed
- Token usage breakdown
- Agent uptime
- Errors encountered
- Revenue (if applicable)

**Weekly Report Includes:**
- All daily metrics
- Week-over-week comparison
- Trend analysis
- Recommendations

```bash
# Generate daily report
analytics-tracker report --period daily --date 2026-02-27

# Generate weekly report
analytics-tracker report --period weekly --week 8
```

### 4. Alert on Anomalies
Detect and alert on unusual patterns.

**Anomaly Detection Rules:**
- Token usage > 150% of daily average
- Error rate > 10%
- Agent offline > 1 hour
- Response time > 2x average
- Unusual activity patterns

**Alert Channels:**
- Telegram: Direct message
- Dashboard: Anomaly indicator
- Log: Record for review

## Data Storage

**Token Usage Log:** `~/.config/athena/token-usage.json`
```json
{
  "daily": {
    "2026-02-27": {
      "glm-5": 150000,
      "gpt-4": 50000,
      "claude-3": 25000
    }
  },
  "cost": {
    "2026-02-27": {
      "glm-5": 0.75,
      "gpt-4": 2.00,
      "claude-3": 1.25
    }
  }
}
```

**Agent Performance:** `~/.config/athena/agent-stats.json`
```json
{
  "agents": {
    "athena": {
      "tasks_completed": 150,
      "uptime": "99.5%",
      "avg_duration": "45s"
    },
    "sterling": {
      "tasks_completed": 45,
      "uptime": "98%",
      "avg_duration": "120s"
    }
  }
}
```

## Usage Examples

### Check Current Token Usage
```bash
analytics-tracker tokens --today
```

### Agent Performance Summary
```bash
analytics-tracker agents --summary
```

### Generate and Send Report
```bash
analytics-tracker report --period daily | send-to telegram
```

### Check for Anomalies
```bash
analytics-tracker anomalies
```

## Report Templates

### Daily Summary Template
```
📊 Athena Daily Report - {DATE}

🤖 Agents:
- Total Tasks: {count}
- Success Rate: {rate}%
- Active Agents: {active}

💰 Tokens:
- Today: {tokens_today}
- Cost: ${cost_today}
- Top Model: {top_model}

⚠️ Alerts: {alert_count}
```

### Weekly Summary Template
```
📈 Athena Weekly Report - Week {week}

📊 Tasks: {total} (↑{change}% vs last week)
💰 Tokens: {total_week} (${cost_week})
🎯 Top Agent: {top_agent}
⚠️ Issues: {issue_count}
```

## Integration

- **Dashboard:** Display real-time metrics
- **Memory:** Store historical data
- **All Agents:** Report their own metrics
- **User:** Receive daily briefings

## Alert Thresholds (Configurable)

| Metric | Warning | Critical |
|--------|---------|----------|
| Token usage | >120% avg | >150% avg |
| Error rate | >5% | >10% |
| Response time | >2x avg | >3x avg |
| Agent offline | >30min | >1hr |

## Cron Schedule

Recommended monitoring intervals:
- **Token check:** Every hour
- **Performance check:** Every 30 min
- **Anomaly scan:** Every 15 min
- **Daily report:** 00:00 UTC
- **Weekly report:** Monday 00:00 UTC
