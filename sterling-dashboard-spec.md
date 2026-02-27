# Sterling Dashboard Design Specification

## Agent Profile

| Field | Value |
|-------|-------|
| **Name** | Sterling |
| **Role** | Finance & Auto-Bidding Agent |
| **Avatar** | 💰 (gold coin with wings) |
| **Status Indicator** | 🟢 Active / 🟡 Paused / 🔴 Error |

---

## Core Capabilities

### 1. Auto-Bidding Engine

**What it does:** Automatically places bids on freelance platforms (Beelancer) based on configured rules and budget constraints.

**Inputs needed:**
- Minimum hourly rate ($)
- Maximum job budget ($)
- Categories/skills to target (multi-select)
- Minimum client rating (1-5 stars)
- Maximum proposals per day (number)
- Auto-accept threshold ($ - auto-bid without confirmation)
- Exclusion keywords (text list)

**Outputs:**
- Bid placement confirmation
- Proposal status (pending, accepted, rejected, withdrawn)
- Success rate percentage

**UI Components:**
- **Form fields:** Number inputs for rates, multi-select dropdown for skills
- **Toggle:** Enable/disable auto-bidding
- **Slider:** Daily proposal limit
- **Chip input:** Exclusion keywords (add/remove tags)
- **Status badge:** Active/Paused

---

### 2. Bid History & Analytics

**What it does:** Tracks all submitted bids with timestamps, job details, and outcomes.

**Inputs needed:**
- Date range filter (start date, end date)
- Status filter (all, pending, accepted, rejected)
- Job category filter
- Sort order (date, amount, status)

**Outputs:**
- Table of bid records
- Statistics: Total bids, acceptance rate, average bid amount
- Trend charts

**UI Components:**
- **Data table:** Columns - Date, Job Title, Client, Bid Amount, Status, Response Time
- **Filters:** Date picker, dropdown filters
- **Pagination:** 25/50/100 per page
- **Chart:** Line chart for bids over time, pie chart for win rate by category

---

### 3. Revenue Tracking

**What it does:** Monitors earnings from accepted jobs, pending payments, and completed projects.

**Inputs needed:**
- Date range for report
- Grouping option (daily, weekly, monthly)

**Outputs:**
- Total earnings (pending + completed)
- Average project value
- Top earning categories
- Payment status breakdown

**UI Components:**
- **KPI cards:** Total Earned, Pending, This Month, Avg Project Value
- **Line chart:** Earnings over time
- **Bar chart:** Earnings by category
- **Pie chart:** Payment status (pending, paid, disputed)
- **Date range picker:** Custom period selection

---

### 4. Job Search & Alerts

**What it does:** Monitors freelance platforms for new matching jobs and sends alerts.

**Inputs needed:**
- Search keywords
- Filter criteria (budget range, category, client rating)
- Alert frequency (instant, hourly digest, daily digest)
- Notification channel (Telegram, email, dashboard)

**Outputs:**
- List of matching jobs
- Match score (how well job fits preferences)
- One-click "Bid Now" action

**UI Components:**
- **Search bar:** With autocomplete
- **Filter panel:** Collapsible sidebar with all criteria
- **Job cards:** Compact list view with key info
- **Toggle switches:** Alert preferences
- **Notification bell:** With unread count badge

---

### 5. Budget Management

**What it does:** Manages bidding budgets, tracks spending, and prevents over-bidding.

**Inputs needed:**
- Monthly budget limit ($)
- Per-job maximum bid ($)
- Daily spend limit ($)
- Low balance warning threshold ($)

**Outputs:**
- Current spend vs budget
- Remaining budget
- Projected monthly spend

**UI Components:**
- **Progress bar:** Budget consumed / total
- **Gauge chart:** Daily spend limit
- **Alert banner:** Warning when approaching limits
- **Input fields:** Budget configuration
- **Toggle:** Enable/disable budget controls

---

### 6. Client Management

**What it does:** Tracks clients, their ratings, payment history, and relationship status.

**Inputs needed:**
- Client search query
- Filter by rating, payment status, project count

**Outputs:**
- Client profile cards
- Lifetime value per client
- Communication history

**UI Components:**
- **Search bar:** Client name search
- **Grid/List toggle:** Card view or table view
- **Client cards:** Avatar, name, rating, total spent, projects count
- **Detail modal:** Full client profile on click

---

### 7. Performance Reports

**What it does:** Generates detailed analytics on bidding performance, win rates, and ROI.

**Inputs needed:**
- Report period (preset: 7d, 30d, 90d, custom)
- Metrics to include (checkboxes)
- Export format (PDF, CSV)

**Outputs:**
- Comprehensive report with charts
- Exportable files
- Comparison with previous periods

**UI Components:**
- **Date range picker:** Custom period
- **Checkbox list:** Select metrics
- **Dropdown:** Export format
- **Report view:** Multi-section dashboard
- **Download button:** Export action

---

### 8. Settings & Configuration

**What it does:** Central management for all agent preferences, API keys, and integrations.

**Inputs needed:**
- Beelancer API credentials
- Telegram bot token
- Default bid parameters
- Notification preferences
- Theme preference (light/dark)

**Outputs:**
- Save confirmation
- Connection status
- Test message results

**UI Components:**
- **Tabbed interface:** General, Integrations, Bidding, Notifications
- **Input fields:** API keys (masked), tokens
- **Buttons:** Save, Test Connection, Reset
- **Toggle switches:** Feature flags
- **Theme selector:** Dropdown or toggle

---

## Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Sterling Avatar | Status | Quick Actions | Settings│
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  SIDEBAR   │              MAIN CONTENT AREA               │
│            │                                                │
│ • Dashboard│  [KPI Cards Row]                              │
│ • Bidding  │  [Charts Row]                                 │
│ • Jobs     │  [Data Table / Forms]                         │
│ • Revenue  │                                               │
│ • Clients  │                                               │
│ • Reports  │                                               │
│ • Settings │                                               │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

---

## UI Component Summary

| Component | Used For |
|-----------|----------|
| Toggle | Enable/disable features |
| Number Input | Currency, rates, limits |
| Text Input | Search, keywords |
| Multi-select | Skills, categories |
| Date Picker | Filters, ranges |
| Slider | Thresholds, limits |
| Data Table | History, reports |
| Line Chart | Trends over time |
| Bar Chart | Comparisons |
| Pie Chart | Distribution |
| Progress Bar | Budget consumption |
| Chip Input | Keyword lists |
| Modal | Details, confirmations |
| Toast Notifications | Status updates |

---

## Color Scheme

| Element | Color |
|---------|-------|
| Primary | #10B981 (Emerald Green - money theme) |
| Secondary | #6366F1 (Indigo) |
| Success | #22C55E (Green) |
| Warning | #F59E0B (Amber) |
| Error | #EF4444 (Red) |
| Background | #0F172A (Dark slate) |
| Surface | #1E293B (Lighter slate) |
| Text | #F8FAFC (White) |
| Muted | #94A3B8 (Gray) |

---

## Responsive Breakpoints

- **Mobile:** < 640px (stacked layout, hamburger nav)
- **Tablet:** 640px - 1024px (collapsible sidebar)
- **Desktop:** > 1024px (full layout)

---

*Specification Version: 1.0*
*Created for: Sterling Finance & Auto-Bidding Agent*
