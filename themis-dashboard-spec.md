# THEMIS Dashboard Design Specification

## Agent Profile

| Field | Value |
|-------|-------|
| **Name** | THEMIS |
| **Role** | Council & Deliberation Agent |
| **Avatar** | ⚖️ (scales of justice emoji, or custom: a wise figure with ancient Greek robes holding scales) |
| **Status Indicator** | 🟢 Online / 🟡 Deliberating / 🔴 Away |

---

## Key Capabilities

### 1. Council Deliberation

**What it does:** Facilitates structured group discussions by presenting topics, managing speakers, tracking key points, and guiding the conversation toward productive outcomes.

**Inputs needed:**
- Discussion topic (text input)
- Participants list (multi-select from contacts/groups)
- Deliberation mode (dropdown: Formal, Informal, Socratic, Round Robin)
- Time limits per speaker (number input)
- Max rounds (number input)

**Outputs/returns:**
- Discussion transcript
- Key points extracted
- Sentiment analysis summary
- Action items identified

**UI Components:**
- Large text input for topic
- Multi-select dropdown for participants
- Radio buttons for deliberation mode
- Number stepper for time/rounds
- Live transcript panel (scrollable text area)
- "Start Deliberation" button (primary action)

---

### 2. Consensus Building

**What it does:** Helps groups move from discussion to agreement by identifying areas of agreement/disagreement, tracking concessions, and measuring convergence toward consensus.

**Inputs needed:**
- Proposal text (large text input)
- Stakeholder positions (array of inputs)
- Consensus threshold (slider: 50%-100%)
- Voting visibility (toggle: Anonymous / Open)

**Outputs/returns:**
- Agreement score (percentage)
- Areas of consensus (list)
- Areas of contention (list)
- Convergence trajectory (chart)
- Final consensus statement

**UI Components:**
- Text area for proposal
- Card-based stakeholder input sections
- Slider for threshold (with percentage label)
- Toggle switch for anonymity
- Progress ring showing consensus score
- Split view: Agreement vs. Disagreement columns
- "Measure Consensus" button

---

### 3. Debate Orchestration

**What it does:** Manages structured debates with formal rules, timed rounds, argument tracking, and impartial moderation.

**Inputs needed:**
- Debate topic (text input)
- Pro/Con teams (multi-select participants)
- Format (dropdown: Lincoln-Douglas, Parliamentary, Oxford, Custom)
- Round duration (number input, seconds)
- Number of rounds (number input)
- Argument evidence requirement (toggle: Required / Optional)

**Outputs/returns:**
- Debate timeline/rundown
- Argument exchanges log
- Rebuttal matching
- Winner determination (based on scoring criteria)
- Full debate transcript

**UI Components:**
- Topic input field
- Split panel: Pro (left) / Con (right)
- Dropdown for debate format
- Timer display (large, prominent countdown)
- Round indicator (e.g., "Round 2 of 4")
- Argument cards with evidence badges
- Scoring tracker per team
- "Start Debate", "Next Round", "End Debate" buttons

---

### 4. Argument Mapping

**What it does:** Visualizes the logical structure of arguments - claims, evidence, assumptions, and counter-arguments in an interactive diagram.

**Inputs needed:**
- Initial claim (text input)
- Support/Oppose selections (interactive)
- Evidence attachments (file upload)
- Link to parent argument (auto-tracked)

**Outputs/returns:**
- Interactive argument tree (visual)
- Strength assessment per argument
- Unaddressed assumptions highlighted
- Gap analysis

**UI Components:**
- Canvas area for argument map (zoomable/pannable)
- Node-based argument cards (claim + evidence)
- Connection lines with labels (supports/opposes/contradicts)
- Color coding: Green (supported), Red (opposed), Gray (neutral)
- "Add Argument" floating action button
- Evidence attachment chips
- Strength indicator (small bar on each node)

---

### 5. Polling & Voting

**What it does:** Creates and manages polls, votes, and ballots with various question types and voting systems.

**Inputs needed:**
- Question(s) (text input, supports multiple)
- Poll type (dropdown: Single Choice, Multiple Choice, Ranked Choice, Scale/1-10, Yes/No)
- Options (dynamic list input)
- Duration (time picker)
- Allow abstention (toggle)
- Show results during vote (toggle)

**Outputs/returns:**
- Vote counts per option
- Percentage distribution
- Winner(s) determined
- Detailed ballot breakdown (optional)
- Exportable results

**UI Components:**
- Question input with "Add Question" button
- Dropdown for poll type
- Dynamic option list (add/remove inputs)
- Date/time picker for duration
- Toggle switches for abstention/results visibility
- Live results chart (bar/pie depending on type)
- "Launch Poll" button

---

### 6. Summary Generation

**What it does:** Synthesizes lengthy discussions, debates, or document collections into concise, actionable summaries.

**Inputs needed:**
- Source material (auto-detected from current deliberation or manual upload)
- Summary type (dropdown: Executive, Detailed, Bullet Points, Key Decisions Only)
- Length preference (slider: Brief / Medium / Comprehensive)
- Focus areas (optional multi-select tags)

**Outputs/returns:**
- Formatted summary text
- Key takeaways (bullet list)
- Action items extracted
- Timeline of events/positions
- Sentiment overview

**UI Components:**
- Source selector (dropdown or file picker)
- Radio buttons for summary type
- Slider for length
- Tag input for focus areas
- Preview panel
- "Generate Summary" button
- Copy / Export buttons

---

### 7. Role Assignment

**What it does:** Assigns and manages roles in deliberations (facilitator, timekeeper, note-taker, devil's advocate, etc.) and rotates them as needed.

**Inputs needed:**
- Available roles (predefined list + custom)
- Participants (multi-select)
- Role distribution method (dropdown: Manual, Random, Round-robin)
- Rotation trigger (dropdown: Manual, Time-based, Topic change)

**Outputs/returns:**
- Role assignment matrix
- Current role holder
- Rotation schedule

**UI Components:**
- Role list with icons
- Participant chips (drag-and-drop to assign)
- Dropdown for distribution method
- Dropdown for rotation trigger
- Current assignments display
- "Assign Roles" / "Rotate" buttons

---

## Global Dashboard Components

### Header Bar
- THEMIS avatar + name
- Status dropdown (Online / Deliberating / Away)
- Settings gear icon

### Sidebar Navigation
- 📋 Active Deliberations
- 📊 Past Sessions
- 📈 Analytics
- ⚙️ Configuration

### Activity Feed
- Recent actions (new votes, summaries generated, etc.)
- Timestamp + action description

### Quick Actions Panel
- "New Deliberation" button
- "New Poll" button
- "New Debate" button

### Status Bar (bottom)
- Current session info
- Active participants count
- Time elapsed in current deliberation

---

## Input/Output Summary Table

| Capability | Primary Input | Primary Output | Key UI Elements |
|------------|---------------|----------------|-----------------|
| Council Deliberation | Topic + Participants | Transcript + Key Points | Text input, Multi-select, Transcript panel |
| Consensus Building | Proposal + Positions | Agreement Score + Areas | Cards, Slider, Progress ring |
| Debate Orchestration | Topic + Teams + Format | Winner + Transcript | Split panel, Timer, Argument cards |
| Argument Mapping | Claims + Evidence | Interactive Tree | Canvas, Nodes, Connections |
| Polling & Voting | Questions + Options | Results + Charts | Dynamic forms, Charts |
| Summary Generation | Source + Type | Summary Text | Preview, Export buttons |
| Role Assignment | Roles + Participants | Assignment Matrix | Drag-drop, Chips |

---

## Design Notes

- **Color Scheme:** Deep navy (#1a237e) primary, gold (#ffc107) accents for ancient Greek/wisdom theme
- **Typography:** Serif headers (Merriweather), Sans-serif body (Inter)
- **Layout:** Three-column layout - Navigation left, Main content center, Activity/Quick actions right
- **Animations:** Smooth transitions between deliberation phases, subtle pulse on active timer
