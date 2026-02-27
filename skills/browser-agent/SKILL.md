# Browser Agent Skill

**Purpose:** Handle browser automation, Chrome extension management, and Beelancer manual bidding tasks.

## Tools

- **Browser Control:** Full browser automation via OpenClaw browser tool
- **Navigation:** URL routing, tab management
- **Form Filling:** Input handling, button clicks, dropdowns
- **Screenshot/Snapshot:** Visual verification

## Commands state

### attach-extension
Attach to an existing Chrome tab via the Browser Relay extension.
```
attach-extension
```
- Uses `browser` tool with `profile="chrome"`
- Requires user to click the OpenClaw Browser Relay toolbar icon on the target tab
- Badge must show "ON" for successful attachment

### open-beelancer
Navigate to Beelancer and prepare for bidding operations.
```
open-beelancer
```
- Opens https://beelancer.work in browser
- Takes snapshot to verify page load
- Returns gig listings for review

### submit-bid
Submit a manual bid on a Beelancer gig.
```
submit-bid --gig-id <id> --amount <amount> --cover-letter <text>
```
- Navigates to specific gig page
- Fills in bid amount and cover letter
- Submits the bid form
- Returns confirmation or error

### check-gig-status
Check status of pending or active gigs.
```
check-gig-status
```
- Navigates to Beelancer dashboard
- Retrieves status of all active bids
- Returns summary: pending, accepted, rejected, completed

## Usage

This skill is used by the Browser agent for:
- Manual bidding when auto-bidder cannot (rate limits, captchas)
- Chrome extension relay management
- Gig status verification
- Form-based interactions requiring browser automation

## Integration

- **Auto-bid fallback:** Sterling can invoke Browser for manual bid submission
- **Extension management:** Required for browser automation on Beelancer
- **Status verification:** Cross-check auto-bidder results with actual gig status
