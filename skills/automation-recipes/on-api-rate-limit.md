# on-api-rate-limit.md

## Trigger
- **Event:** API request returns 429 (Too Many Requests) or rate limit error
- **Source:** HTTP response header `X-RateLimit-Remaining: 0`, explicit error response

## Actions

1. **Identify the API**
   - Determine which service triggered the limit (OpenAI, Beelancer, etc.)
   - Check rate limit headers for reset time

2. **Halt API Requests**
   - Set flag to pause all requests to that API
   - Queue pending requests with retry intent

3. **Wait for Reset**
   - Calculate wait time from `Retry-After` header or rate limit window
   - Set timer/timeout for automatic resume

4. **Implement Backoff**
   - On retry: use exponential backoff (start with 2s, double each failure)
   - Cap backoff at 60 seconds max
   - Log each retry attempt

5. **Switch Providers (if configured)**
   - If backup API available, route requests there
   - Update configuration to use fallback

6. **Log Incident**
   - Record: API name, time of limit, duration, impact
   - Update `memory/api-issues.md`

## Conditions

**Skip automation if:**
- Rate limit is from a non-critical API (optional features)
- Already in backoff/retry mode for this API
- Manual override flag is set

**Abort if:**
- Rate limit persists beyond 1 hour (possible credential issue)
- All configured APIs for a feature are rate-limited
- 3 consecutive rate limits on same API (escalate to user)

## Notifications

| When | Who | Channel | Message |
|------|-----|---------|---------|
| Immediate | User | Telegram | ⏳ Rate limit hit on [API]. Pausing for [X] minutes. |
| If escalated | User | Telegram | 🚨 API [API] rate limited 3x. Manual check needed. |
| Resolution | - | - | (No notification - silent resume) |

## Rollback

- Clear pause flag after successful request
- Reset backoff counter on successful API call
- Revert to primary API if fallback was used
- Clear queued requests that became stale
