# Athena Toolkit Utilities

A collection of maintenance and monitoring scripts for the Athena multi-agent system.

## Scripts

### 1. Agent Heartbeat Monitor (`agent-heartbeat-monitor.js`)

Tracks all agent sessions and monitors their activity status.

```bash
# Quick status check
node agent-heartbeat-monitor.js

# Watch mode (continuous monitoring)
node agent-heartbeat-monitor.js --watch

# JSON output for automation
node agent-heartbeat-monitor.js --json

# Only show alerts for inactive agents
node agent-heartbeat-monitor.js --alerts

# Custom inactivity threshold (in minutes)
node agent-heartbeat-monitor.js --threshold=10

# Custom check interval in watch mode (in seconds)
node agent-heartbeat-monitor.js --watch --interval=60
```

**Features:**
- Shows all agent sessions with activity status
- Color-coded output (green=active, yellow=idle, red=alert)
- Watch mode for continuous monitoring
- JSON output for integration with other tools
- Configurable inactivity threshold

---

### 2. Memory Compression (`memory-compression.js`)

Summarizes old memory files to save space while preserving key information.

```bash
# Compress memory files older than 7 days
node memory-compression.js

# Dry run (show what would be compressed)
node memory-compression.js --dry-run

# Custom age threshold (in days)
node memory-compression.js --days=14

# Custom output directory
node memory-compression.js --output-dir=/path/to/summaries

# Verbose output
node memory-compression.js --verbose
```

**Features:**
- Finds memory files in sandboxes and /root/.openclaw/memory
- Generates compact summaries with key sections
- Preserves date, stats, and section previews
- Dry-run mode for safety
- Saves disk space while maintaining searchability

---

### 3. Credential Health Check (`credential-health-check.js`)

Validates API keys and credentials used by Athena agents.

```bash
# Run all checks
node credential-health-check.js

# JSON output
node credential-health-check.js --json

# Check specific providers
node credential-health-check.js --providers=github,tavily

# Verbose output
node credential-health-check.js --verbose
```

**Features:**
- Validates configured API keys
- Checks OAuth configurations
- Verifies GitHub CLI authentication
- Scans for exposed secrets in config
- Lists credential files
- Provides health summary

---

### 4. Session Cleanup (`session-cleanup.js`)

Removes stale sessions and cleans up old session data.

```bash
# Dry run to see what would be cleaned
node session-cleanup.js --dry-run

# Clean sessions older than 24 hours
node session-cleanup.js

# Custom age threshold (in hours)
node session-cleanup.js --age=48

# Clean specific agents only
node session-cleanup.js --agents=sterling,felicity

# Archive sessions before deletion
node session-cleanup.js --archive

# JSON output
node session-cleanup.js --json
```

**Features:**
- Finds sessions older than threshold
- Groups by agent for easy review
- Archives sessions before deletion (optional)
- Dry-run mode for safety
- Detailed reporting

---

## Common Options

| Option | Description |
|--------|-------------|
| `--json` | Output JSON format |
| `--dry-run` | Preview without making changes |
| `--verbose` | Show detailed output |

## Examples

### Daily Health Check

```bash
# Quick status of all agents
node agent-heartbeat-monitor.js

# Check credentials
node credential-health-check.js

# Clean old sessions
node session-cleanup.js --dry-run
```

### Automation Integration

```bash
# Cron job for daily cleanup (runs at 3 AM)
0 3 * * * cd /root/.openclaw/workspace/scripts && node session-cleanup.js --age=48

# Health check with JSON output for monitoring
0 * * * * cd /root/.openclaw/workspace/scripts && node credential-health-check.js --json > /var/log/athena-credentials.json
```

### Watch Mode for Monitoring

```bash
# Monitor agents in real-time
node agent-heartbeat-monitor.js --watch --alerts
```

---

## Notes

- All scripts connect to the Gateway at `http://127.0.0.1:18789`
- Default inactivity threshold: 5 minutes
- Default session age for cleanup: 24 hours
- Archive directory: `/root/.openclaw/workspace/session-archives`

## Troubleshooting

**"Cannot connect to gateway"**
- Ensure OpenClaw gateway is running: `openclaw gateway status`
- Check if port 18789 is accessible

**Credential check failures**
- Verify credentials in `/root/.openclaw/openclaw.json`
- Run `gh auth status` for GitHub CLI checks
- Ensure OAuth tokens are properly configured
