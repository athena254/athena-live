# Apollo - Client Relations Agent Dashboard Specification

## Agent Profile

| Field | Value |
|-------|-------|
| **Name** | Apollo |
| **Role** | Client Relations Agent |
| **Avatar** | `avatars/apollo.png` (default: customer service headset icon) |
| **Status** | Online/Away/Busy toggle |
| **Agent ID** | `apollo` |

---

## Status Indicator

**What it does:** Shows current availability state for client interactions

**Inputs:** Manual toggle or auto-set based on calendar/working hours

**Outputs:** Status string (`online` | `away` | `busy` | `offline`)

**UI Components:**
- Dropdown selector: Online | Away | Busy | Offline
- Auto-status toggle (sync with Google Calendar working hours)
- Status message input (optional custom message)

---

## Key Capabilities

### 1. Client Communication Hub

**What it does:** Unified inbox for all client messages across channels (Telegram, Email, Discord)

**Inputs:**
- Channel selection (Telegram/Email/Discord)
- Client selector (from contact list)
- Message composition (text input)
- Attachment upload (files, images)

**Outputs:**
- Sent message confirmation
- Message history display
- Delivery status (sent/delivered/read)

**UI Components:**
- Channel tabs: Telegram | Email | Discord
- Contact search dropdown with autocomplete
- Rich text composer (textarea + formatting toolbar)
- File attachment button with drag-drop zone
- Message history panel (scrollable, newest first)
- Quick reply templates dropdown

---

### 2. Satisfaction Tracking (NPS/CSAT)

**What it does:** Collect and track client satisfaction scores over time

**Inputs:**
- Survey trigger (manual or post-interaction auto-trigger)
- Rating selection (1-5 stars or 0-10 NPS scale)
- Optional feedback text

**Outputs:**
- Individual score record
- Aggregate metrics (average NPS, trend chart)
- Client satisfaction history

**UI Components:**
- Star rating widget (1-5 clickable stars)
- NPS slider (0-10)
- Feedback textarea (optional)
- "Send Survey" button
- Satisfaction trend chart (line graph over time)
- Score breakdown pie chart
- Client satisfaction data table (sortable by score/date)

---

### 3. Client Onboarding Flow

**What it does:** Guide new clients through initial setup and welcome process

**Inputs:**
- New client selection
- Onboarding step completion checkboxes
- Custom welcome message input
- Resource/link delivery

**Outputs:**
- Onboarding progress percentage
- Completed checklist
- Welcome message preview

**UI Components:**
- Onboarding checklist (checkboxes):
  - [ ] Welcome call scheduled
  - [ ] Account created
  - [ ] Features demo sent
  - [ ] First project initiated
  - [ ] Check-in scheduled (7-day)
- Progress bar (0-100%)
- "Start Onboarding" button
- "Mark Complete" button per step
- Template selector for welcome messages

---

### 4. Issue Tracking & Resolution

**What it does:** Log, track, and resolve client issues/escalations

**Inputs:**
- Issue title (text input)
- Issue description (textarea)
- Priority selector (Low/Medium/High/Critical)
- Client association
- Status updates

**Outputs:**
- Issue ticket number
- Status updates
- Resolution time metrics
- Escalation alerts

**UI Components:**
- "New Issue" button → opens modal form
- Issue form fields:
  - Title (text input)
  - Description (textarea)
  - Priority dropdown: Low | Medium | High | Critical
  - Client dropdown (searchable)
- Issue list table:
  - Columns: ID | Title | Client | Priority | Status | Created | Updated
  - Filters: All | Open | In Progress | Resolved | Closed
- Issue detail panel (slide-out)
- Status update dropdown: Open → In Progress → Resolved → Closed
- Priority badges (color-coded)

---

### 5. Follow-up Reminders

**What it does:** Schedule and manage client check-ins and follow-ups

**Inputs:**
- Client selection
- Reminder type (Check-in / Renewal / Feedback / Custom)
- Date/time picker
- Reminder message

**Outputs:**
- Scheduled reminder confirmation
- Upcoming reminders list
- Overdue alerts

**UI Components:**
- "Schedule Follow-up" button → opens modal
- Follow-up form:
  - Client dropdown (searchable)
  - Type dropdown: Check-in | Renewal | Feedback | Custom
  - Date picker
  - Time picker
  - Message textarea
- Calendar view (month/week toggle)
- Reminders list (upcoming 7 days)
- "Mark Done" button per reminder
- Snooze dropdown (1 hour | 1 day | 1 week)

---

### 6. Client Directory

**What it does:** Manage client contact information and profiles

**Inputs:**
- Add/Edit client form
- Client search query
- Filter criteria

**Outputs:**
- Client list display
- Individual client profile
- Contact details export

**UI Components:**
- "Add Client" button
- Search bar (name, email, company)
- Filter dropdowns: Status (Active/Inactive), Tags, Date Added
- Client cards grid view OR table view toggle
- Client card displays:
  - Avatar/Initials
  - Name, Company, Email
  - Status badge
  - Last contact date
  - Quick action buttons (Message, Schedule, View)
- Client detail modal/page:
  - Contact info section (editable)
  - Interaction history timeline
  - Notes section
  - Tags editor

---

### 7. Interaction History Log

**What it does:** Complete audit trail of all client communications

**Inputs:**
- Date range filter
- Client filter
- Channel filter
- Search query

**Outputs:**
- Filtered interaction list
- Export to CSV/PDF

**UI Components:**
- Filter bar:
  - Date range picker (from/to)
  - Client dropdown (searchable)
  - Channel dropdown: All | Telegram | Email | Discord
  - Type dropdown: All | Message | Call | Meeting | Survey
- Interaction table:
  - Columns: Date | Client | Channel | Type | Summary | Sentiment
- "Export" button (CSV/PDF)
- Click row → expands to show full message content

---

### 8. Analytics Dashboard

**What it does:** Visualize client relations metrics and trends

**Inputs:**
- Date range selector
- Metric toggles

**Outputs:**
- Charts and graphs
- KPI cards with values

**UI Components:**
- Date range picker (preset: 7d, 30d, 90d, custom)
- KPI cards row:
  - Total Active Clients (number)
  - New Clients This Month (number + trend arrow)
  - Avg Satisfaction Score (number)
  - Open Issues (number)
- Charts:
  - Client growth line chart (new clients over time)
  - NPS distribution pie chart
  - Issues by priority bar chart
  - Response time trend line chart
- "Refresh" button
- "Download Report" button

---

### 9. Quick Actions Panel

**What it does:** Fast access to common tasks

**Inputs:** Button clicks

**Outputs:** Action confirmation / Navigation

**UI Components:**
- Icon buttons grid:
  - 📝 New Message
  - 📋 New Issue
  - 📅 Schedule Follow-up
  - ⭐ Send Survey
  - 👤 Add Client
  - 📊 View Analytics

---

### 10. Template Library

**What it does:** Store and manage reusable message templates

**Inputs:**
- Template name
- Template content
- Category selection

**Outputs:**
- Template list
- Copy-to-clipboard action

**UI Components:**
- "New Template" button
- Template list:
  - Category accordion (Welcome, Follow-up, Issue Response, Closing)
  - Template name + preview
  - Edit | Delete | Copy buttons
- Template editor modal:
  - Name input
  - Category dropdown
  - Content textarea (supports {{variable}} placeholders)
  - Variables legend: {{client_name}}, {{company}}, {{date}}

---

## Summary: UI Components Reference

| Component | Used In |
|-----------|---------|
| Status dropdown | Status Indicator |
| Toggle switch | Auto-status |
| Channel tabs | Communication Hub |
| Contact search + dropdown | Communication Hub, Onboarding, Issues, Follow-ups |
| Rich text composer | Communication Hub |
| File upload + drag-drop | Communication Hub |
| Message history panel | Communication Hub |
| Star rating widget | Satisfaction Tracking |
| NPS slider | Satisfaction Tracking |
| Line chart | Satisfaction Tracking, Analytics |
| Pie chart | Satisfaction Tracking, Analytics |
| Progress bar | Onboarding |
| Checklist | Onboarding |
| Form modal | Issues, Follow-ups, Client Add/Edit |
| Data table | Issues, Clients, Interaction History |
| Date/time picker | Follow-ups, Filters |
| Filter bar | Issues, Clients, Interaction History |
| KPI cards | Analytics |
| Icon buttons | Quick Actions |
| Accordion | Templates |

---

## Design Tokens

| Token | Value |
|-------|-------|
| Primary color | `#6366F1` (Indigo) |
| Success color | `#10B981` |
| Warning color | `#F59E0B` |
| Error color | `#EF4444` |
| Background | `#F8FAFC` |
| Card background | `#FFFFFF` |
| Text primary | `#1E293B` |
| Text secondary | `#64748B` |
| Border | `#E2E8F0` |

---

*Generated for Apollo Client Relations Agent*
