# Hermes Dashboard Design Specification

## Agent Profile

| Field | Value |
|-------|-------|
| **Name** | Hermes |
| **Role** | Outreach & Marketing Agent |
| **Avatar** | `avatars/hermes.png` (winged messenger icon) |
| **Status Indicator** | 🟢 Online / 🟡 Busy / ⚪ Offline |

---

## Key Capabilities

### 1. Lead Generation

| Aspect | Details |
|--------|---------|
| **What it does** | Discovers and captures potential leads from various sources (LinkedIn, Twitter, web directories, CSV imports) |
| **Inputs** | Target industry, job titles, company size, location, source platform, quantity needed |
| **Outputs** | Lead list with name, email, company, title, LinkedIn URL, source |
| **UI Components** | Multi-select dropdown (industries), number input (quantity), text input (job titles), toggle (include verified emails), "Generate Leads" button, data table (results) |

### 2. Email Outreach Campaigns

| Aspect | Details |
|--------|---------|
| **What it does** | Creates and sends personalized email sequences to leads |
| **Inputs** | Campaign name, subject lines, email templates (with variables), sending schedule, lead list |
| **Outputs** | Campaign status, send count, open rate, click rate, bounce rate |
| **UI Components** | Text input (campaign name), rich text editor (email template), date picker (schedule), file upload (lead CSV), "Launch Campaign" button, metrics cards (opens, clicks, bounces), timeline chart (performance over time) |

### 3. Social Media Management

| Aspect | Details |
|--------|---------|
| **What it does** | Schedules and publishes posts across Twitter, LinkedIn, Instagram |
| **Inputs** | Platform selection, post content, media attachments, scheduled time, hashtags |
| **Outputs** | Post status, engagement metrics (likes, comments, shares, retweets) |
| **UI Components** | Multi-select checkboxes (platforms), text area (post content), image uploader, date/time picker, character counter, "Schedule Post" button, calendar view (scheduled posts), analytics charts |

### 4. Cold Messaging (Twitter/LinkedIn DMs)

| Aspect | Details |
|--------|---------|
| **What it does** | Sends personalized direct messages to prospects on social platforms |
| **Inputs** | Platform (Twitter/LinkedIn), message template, lead list, follow-up delay |
| **Outputs** | Message delivery status, response rate, conversation threads |
| **UI Components** | Radio buttons (platform), text area (message template), file upload (prospects), toggle (auto follow-up), "Start Outreach" button, conversation thread viewer |

### 5. Campaign Analytics & Reporting

| Aspect | Details |
|--------|---------|
| **What it does** | Aggregates and visualizes performance metrics across all campaigns |
| **Inputs** | Date range, campaign filter, metric selection |
| **Outputs** | Charts (line, bar, pie), exportable reports (PDF/CSV), KPI summaries |
| **UI Components** | Date range picker, dropdown (campaign), toggle (metrics), "Export Report" button, line chart (trends), bar chart (comparison), pie chart (distribution), data table (detailed metrics) |

### 6. A/B Testing

| Aspect | Details |
|--------|---------|
| **What it does** | Tests different subject lines, copy variations, and sends the winner automatically |
| **Inputs** | Test name, variable type (subject/body/send time), variants (2+), sample size, winner criteria |
| **Outputs** | Test results, statistical significance, recommended variant |
| **UI Components** | Text input (test name), dropdown (variable type), multi-input fields (variants), number input (sample %), "Run Test" button, results comparison table, winner badge |

### 7. Audience Segmentation

| Aspect | Details |
|--------|---------|
| **What it does** | Groups leads based on criteria for targeted messaging |
| **Inputs** | Segment name, criteria (industry, company size, behavior, engagement) |
| **Outputs** | Segment list with lead counts, saved segments for campaign use |
| **UI Components** | Text input (segment name), condition builder (if/then logic), preview count, "Create Segment" button, segment cards with lead counts |

### 8. Template Library

| Aspect | Details |
|--------|---------|
| **What it does** | Stores and manages reusable email/DM templates with personalization variables |
| **Inputs** | Template name, content, category, variables used |
| **Outputs** | Saved templates, template preview with sample data |
| **UI Components** | List view (templates), search bar, "New Template" button, rich text editor, variable inserter (dropdown), preview pane |

### 9. Competitor Monitoring

| Aspect | Details |
|--------|---------|
| **What it does** | Tracks competitor social activity, content, and marketing moves |
| **Inputs** | Competitor handles/URLs, monitoring frequency |
| **Outputs** | Activity feed, content alerts, engagement summary |
| **UI Components** | Input field (competitor handles), refresh interval dropdown, activity feed, "Add Competitor" button |

### 10. Reply Handling & Auto-Response

| Aspect | Details |
|--------|---------|
| **What it does** | Detects replies from outreach and triggers appropriate auto-responses |
| **Inputs** | Response rules, keywords, escalation triggers |
| **Outputs** | Reply notifications, conversation status, auto-response stats |
| **UI Components** | Rule builder (if reply contains → send response), toggle (auto-respond on/off), notification bell, conversation list |

---

## Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HERMES 🟢              [Campaigns] [Analytics] [Templates] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ Total Leads │ │ Open Rate   │ │ Responses   │ │ Active │ │
│  │    1,247    │ │    34.2%    │ │    156     │ │   3    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐ ┌──────────────────────────┐  │
│  │   QUICK ACTIONS          │ │   ACTIVE CAMPAIGNS      │  │
│  │   [+ New Campaign]       │ │   • Q1 Outreach    ▶     │  │
│  │   [Generate Leads]       │ │   • Product Launch  ▶   │  │
│  │   [Schedule Post]        │ │   • Partner Search  ▶   │  │
│  │   [View Templates]       │ │                          │  │
│  └──────────────────────────┘ └──────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  PERFORMANCE CHART (Line Graph: Leads + Engagement over 30d)│
│  ████████████████████████████████████████████████████████   │
├─────────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                                           │
│  • Email sent to john@company.com ✓                         │
│  • New lead captured: Sarah M. (Tech)                      │
│  • Campaign "Q1 Outreach" opened: 45%                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Input Component Summary

| Component Type | Used For |
|----------------|----------|
| Text Input | Names, handles, campaign titles, search |
| Text Area | Message content, email templates |
| Rich Text Editor | Email templates with formatting |
| Multi-select Dropdown | Industries, platforms, metrics |
| Checkboxes | Platform selection, options |
| Radio Buttons | Single selection (platform type) |
| Number Input | Quantities, sample sizes, percentages |
| Date Picker | Scheduling, date ranges |
| Date/Time Picker | Post scheduling |
| Toggle | Features on Switch/off |
| File Upload | CSV imports, media |
| Button | Actions (Launch, Generate, Export) |
| Data Table | Leads list, campaign results |
| Cards | Quick stats, segments |
| Charts | Analytics visualization |

---

## Status Indicators

- **🟢 Online** - Ready to execute campaigns
- **🟡 Busy** - Campaign running / processing
- **⚪ Offline** - Paused / error state
- **🔴 Error** - Requires attention (shows error message)

---

## Notification Preferences

| Event | Notification |
|-------|--------------|
| Campaign complete | Campaign summary card |
| New lead captured | Lead count update |
| Reply received | DM/push notification |
| A/B test winner | Alert with results |
| Error occurred | Error card with retry action |

---

*Dashboard v1.0 | Hermes Marketing Agent*
