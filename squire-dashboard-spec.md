# Squire Dashboard Design Specification

## Agent Profile

| Field | Value |
|-------|-------|
| **Name** | Squire |
| **Role** | Assistant & Operations |
| **Avatar** | 🛡️ (shield/medieval motif - represents protective, loyal service) |
| **Status** | Online/Active indicator (green dot) |

---

## Status Indicator

- **Display:** Circular badge with color-coded status
  - 🟢 Green: Online, ready
  - 🟡 Yellow: Processing task
  - 🔴 Red: Error/blocked
  - ⚪ Gray: Offline/idle
- **Location:** Top-right corner of dashboard header
- **States:**
  - `idle` - Waiting for input
  - `active` - Task in progress
  - `error` - Needs attention

---

## Key Capabilities & UI Components

---

### 1. System Health Checks

**What it does:** Check system status, OpenClaw gateway, node connections, and service health.

**Inputs needed:**
- Check type selection (dropdown): All / Gateway / Nodes / Services
- Optional: Specific node ID (text input)

**Outputs:**
- Status report (healthy/degraded/down)
- Service uptime metrics
- Node connection status list

**UI Components:**
- Dropdown: Check type selector
- Button: "Run Health Check"
- Data Table: Results with status icons
- Badge: Overall health indicator (green/yellow/red)

---

### 2. Memory Management

**What it does:** Read, write, and manage memory files (daily notes, MEMORY.md, workspace docs).

**Inputs needed:**
- Memory type selection (dropdown): Daily / Long-term / Workspace / Search
- Date picker (for daily memory)
- Search query (text input)
- Content editor (textarea for writing)

**Outputs:**
- Memory content display
- Search results list
- Write confirmation

**UI Components:**
- Tab navigation: Read / Write / Search
- Date picker: Calendar widget
- Text input: Search query
- Textarea: Content editor with markdown support
- Button: Save / Delete
- Card: Display memory entries

---

### 3. Task & Operations Manager

**What it does:** Create, track, and manage operational tasks and workflows.

**Inputs needed:**
- Task title (text input)
- Task description (textarea)
- Priority (dropdown): Low / Medium / High / Critical
- Due date (date picker)
- Category (dropdown): Maintenance / Communication / Documentation / Automation

**Outputs:**
- Task list with status
- Task completion confirmation
- Overdue alerts

**UI Components:**
- Form: New task creation
- Kanban board: Task columns (Pending / In Progress / Done)
- List view: Sortable task table
- Badge: Priority indicators
- Button: Mark complete / Edit / Delete

---

### 4. Communication Hub

**What it does:** Send messages, manage contacts, handle notifications.

**Inputs needed:**
- Recipient (text input / contact picker)
- Message content (textarea)
- Channel (dropdown): Telegram / Discord / Email
- Attachment (file upload)

**Outputs:**
- Send confirmation
- Message history
- Delivery status

**UI Components:**
- Dropdown: Channel selector
- Contact autocomplete: Recipient picker
- Textarea: Message composition
- Button: Send / Attach file
- Chat history: Message thread view
- Badge: Unread count

---

### 5. File & Workspace Manager

**What it does:** Browse, read, write, and organize workspace files.

**Inputs needed:**
- File path (text input / file browser)
- Content (textarea for editing)
- Operation type (dropdown): Read / Write / Edit / Delete

**Outputs:**
- File content display
- Operation success/failure
- File tree navigation

**UI Components:**
- File browser: Tree view with folders
- Text input: Path/filename
- Monaco editor: Code/markdown editing
- Button: Save / Cancel / Delete
- Breadcrumb: Current path navigation

---

### 6. Calendar Integration

**What it does:** Check calendar events, schedule meetings, set reminders.

**Inputs needed:**
- Date range (date picker)
- Event title (text input)
- Event time (time picker)
- Attendees (multi-select)

**Outputs:**
- Calendar view with events
- Event details
- Reminder notifications

**UI Components:**
- Calendar grid: Month/week/day views
- Button: Add event
- Modal: Event creation form
- List: Upcoming events
- Badge: Event reminders

---

### 7. Weather & Location

**What it does:** Get weather forecasts for user location or specified cities.

**Inputs needed:**
- Location (text input / current location button)
- Forecast type (dropdown): Current / Hourly / 3-day / 7-day

**Outputs:**
- Temperature, conditions, humidity
- Forecast data
- Weather icons

**UI Components:**
- Text input: City/location
- Button: Use current location
- Dropdown: Forecast duration
- Card: Current weather display
- Chart: Temperature graph

---

### 8. Git Operations

**What it does:** Commit changes, manage branches, view status, handle merges.

**Inputs needed:**
- Repository path (text input / selector)
- Commit message (textarea)
- Branch name (dropdown/text input)
- Operation type (dropdown): Status / Commit / Branch / Merge

**Outputs:**
- Git status output
- Commit confirmation
- Branch list
- Merge results

**UI Components:**
- Dropdown: Operation type
- Text input: Branch name / Commit message
- Button: Execute git operation
- Terminal output: Command results
- Tree view: Branch visualization

---

### 9. Code Review

**What it does:** Review code for quality, security, and best practices.

**Inputs needed:**
- Repository/path (text input)
- Files to review (multi-select / glob pattern)
- Review type (dropdown): Full / Quick / Security / Best Practices

**Outputs:**
- Issues found (severity + description)
- Line-by-line comments
- Summary report

**UI Components:**
- Text input: Repository path
- Dropdown: Review type
- Checkbox list: File selection
- Button: Start Review
- Accordion: Issue categories
- Table: Issues with severity badges
- Button: Export report

---

### 10. Automation Workflows

**What it does:** Create, manage, and trigger automation workflows.

**Inputs needed:**
- Workflow name (text input)
- Trigger type (dropdown): Manual / Schedule / Event
- Actions (multi-step builder)
- Schedule (cron expression / time picker)

**Outputs:**
- Workflow execution status
- Action results
- Execution history

**UI Components:**
- Form: Workflow builder
- Dropdown: Trigger type
- Builder: Action sequence (drag-drop)
- Button: Save / Test / Run
- Timeline: Execution history
- Status badges: Success/Failed/Running

---

### 11. GitHub Integration

**What it does:** Manage issues, PRs, CI runs via gh CLI.

**Inputs needed:**
- Repository (text input with autocomplete)
- Operation (dropdown): Issues / PRs / CI / Reviews
- Filters (multi-select): State / Labels / Assignee

**Outputs:**
- Issue/PR list with details
- CI status
- Review comments

**UI Components:**
- Autocomplete: Repository selector
- Tab navigation: Issues / PRs / CI
- Filter chips: Labels, state
- Table: Item list with status
- Button: Create issue / Open PR
- Badge: CI status

---

### 12. Browser Control

**What it does:** Take screenshots, navigate pages, automate browser tasks.

**Inputs needed:**
- URL (text input)
- Action (dropdown): Navigate / Screenshot / Snapshot / Execute
- JavaScript (code editor for custom actions)

**Outputs:**
- Screenshot/image
- Page snapshot (DOM)
- Action results

**UI Components:**
- Text input: URL bar
- Dropdown: Action selector
- Button: Go / Capture / Execute
- Image viewer: Screenshot display
- Tree view: Page snapshot
- Code editor: JS input

---

### 13. Node Management

**What it does:** Discover, pair, and control paired devices/nodes.

**Inputs needed:**
- Node ID (text input)
- Action (dropdown): Status / Camera / Screen / Location / Notify
- Parameters (context-specific inputs)

**Outputs:**
- Node status
- Camera snaps/clips
- Screen recordings
- Location data

**UI Components:**
- Grid: Paired nodes
- Button: Pair new node
- Dropdown: Action per node
- Gallery: Camera captures
- Map: Location view
- Button: Request location

---

### 14. Skill Management

**What it does:** Browse, install, update skills from ClawHub.

**Inputs needed:**
- Search query (text input)
- Skill category (dropdown)
- Operation (dropdown): Search / Install / Update

**Outputs:**
- Available skills list
- Installation status
- Update availability

**UI Components:**
- Search bar: Skill search
- Grid: Skill cards with icons
- Button: Install / Update
- Badge: Version / New
- Progress bar: Installation

---

### 15. Quick Actions Panel

**What it does:** Fast access to common operations.

**Inputs needed:** None (predefined actions)

**Outputs:** Immediate execution results

**UI Components:**
- Grid of icon buttons:
  - 🚀 Quick health check
  - 📝 New memory entry
  - 📅 Today's calendar
  - 🌤️ Weather check
  - 💾 Backup workspace
  - 📊 System stats

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Squire Dashboard              [Status ●] [User Avatar] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────────┐ │
│ │             │ │                                             │ │
│ │  Sidebar    │ │              Main Content Area              │ │
│ │             │ │                                             │ │
│ │ - Home      │ │  (Changes based on selected section)        │ │
│ │ - Health    │ │                                             │ │
│ │ - Memory    │ │                                             │ │
│ │ - Tasks     │ │                                             │ │
│ │ - Comms     │ │                                             │ │
│ │ - Files     │ │                                             │ │
│ │ - Calendar │ │                                             │ │
│ │ - Git       │ │                                             │ │
│ │ - Review    │ │                                             │ │
│ │ - Automate  │ │                                             │ │
│ │ - GitHub    │ │                                             │ │
│ │ - Browser   │ │                                             │ │
│ │ - Nodes     │ │                                             │ │
│ │ - Skills    │ │                                             │ │
│ │             │ │                                             │ │
│ └─────────────┘ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Quick Actions: [🚀] [📝] [📅] [🌤️] [💾] [📊]     [Notifications]│
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Scheme & Styling

- **Primary:** #4A90D9 (Trustworthy blue)
- **Secondary:** #2D3748 (Dark slate)
- **Accent:** #48BB78 (Success green)
- **Warning:** #ECC94B (Amber)
- **Error:** #F56565 (Red)
- **Background:** #1A202C (Dark mode default)
- **Cards:** #2D3748 with subtle border
- **Text:** #E2E8F0 (Light gray)

---

## Interaction Patterns

1. **Real-time feedback:** Loading spinners, progress bars
2. **Toast notifications:** Success/error messages
3. **Modal dialogs:** Confirmations, forms
4. **Drag-and-drop:** Task boards, file uploads
5. **Keyboard shortcuts:** Cmd/Ctrl + K for command palette
6. **Responsive:** Works on desktop and tablet

---

## Implementation Notes

- Use React 19 + Vite (existing stack)
- State management: React Context or Zustand
- API calls via OpenClaw's existing tool system
- WebSocket for real-time updates (gateway status)
- LocalStorage for user preferences
