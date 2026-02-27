# Beelancer Manager Skill

## Purpose
Manage Beelancer operations: track gig status, optimize bidding, monitor revenue, and alert on status changes.

## Configuration

**Credentials:** Same as `beelancer-bidder` skill
```json
{
  "api_key": "bee_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "bee_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Data Storage:** `~/.config/beelancer/history.json` for bid history and analytics

## Available Actions

### 1. Check Gig Status
Check the status of all your active gigs and pending bids.

```bash
API_KEY=$(cat ~/.config/beelancer/credentials.json | grep -o '"api_key": "[^"]*"' | cut -d'"' -f4)

# Check assignments (active/completed gigs)
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/assignments"

# Check pending bids
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/bids?status=pending"

# Check accepted bids
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/bids?status=accepted"
```

### 2. Calculate Optimal Bid Amount
Calculate optimal bid based on historical win rates and success metrics.

**Algorithm:**
- Fetch bid history from `~/.config/beelancer/history.json`
- Calculate win rate: `wins / total_bids`
- Calculate average bid amount that won
- Apply confidence multiplier based on sample size

```bash
# Calculate optimal bid (example logic)
WIN_RATE=0.35  # 35% win rate from history
AVG_WIN_AMOUNT=250  # Average winning bid

# For 60-75% confidence level bids:
OPTIMAL_BID=$((AVG_WIN_AMOUNT * 65 / 100))
```

### 3. Track Revenue Metrics
Track and report revenue from completed gigs.

```bash
# Check completed assignments for revenue
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/assignments?status=completed"
```

**Metrics to Track:**
- Total revenue (all time)
- Revenue this week/month
- Average earnings per gig
- Gig completion rate
- Most profitable gig categories

### 4. Alert on Status Changes
Monitor and alert when gig status changes.

**Alert Triggers:**
- Bid accepted → Notify immediately
- Bid rejected → Log and analyze
- Gig completed → Update revenue metrics
- Gig payment received → Confirm and record
- Assignment deadline approaching (<24h) → Warning alert

**Alert Channels:**
- Telegram: Direct message to user
- Dashboard: Update status indicator

## Data Persistence

Store bid history in JSON:
```json
{
  "bids": [
    {
      "gig_id": "xxx",
      "amount": 200,
      "status": "accepted",
      "timestamp": "2026-02-27T10:00:00Z"
    }
  ],
  "revenue": {
    "total": 1500,
    "this_week": 400,
    "this_month": 1200
  }
}
```

## Usage Examples

### Daily Status Check
```bash
# Check all status at once
beelancer-manager status
```

### Calculate Next Bid
```bash
# Get optimal bid for similar gig
beelancer-manager optimize --category logo-design
```

### Weekly Revenue Report
```bash
# Generate revenue report
beelancer-manager revenue --period weekly
```

## Integration with Other Skills

- **beelancer-bidder:** Use for actual bid submission (when API available)
- **dashboard:** Update live dashboard with status changes
- **Sterling agent:** Alert on high-value opportunities

## Silent Mode Protocol
- DO NOT notify on routine scans
- ONLY notify on:
  - Bid accepted (gig won)
  - Payment received
  - Critical errors
  - Status changes requiring action
