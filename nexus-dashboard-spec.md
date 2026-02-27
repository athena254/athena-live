# Nexus Dashboard Design Specification

## Agent Identity

| Field | Value |
|-------|-------|
| **Name** | Nexus |
| **Role** | Intelligence Synthesizer |
| **Avatar** | `avatars/nexus.svg` (abstract neural network / constellation design) |
| **Emoji** | 🔮 |
| **Vibe** | Analytical, perceptive, synthesis-focused |

---

## Status Indicator

| State | Color | Description |
|-------|-------|-------------|
| 🟢 Active | Green | Processing intelligence, synthesis in progress |
| 🟡 Synthesizing | Amber | Combining data from multiple sources |
| 🔵 Idle | Blue | Ready for new intelligence queries |
| ⚠️ Deep Analysis | Purple | Running complex pattern recognition |

---

## Key Capabilities & UI Components

### 1. Knowledge Synthesis Engine

**What it does:** Combines information from multiple sources (files, web, memory, conversations) into unified insights.

**Inputs needed:**
- Source selection (file paths, URLs, memories, or "all sources")
- Synthesis depth (brief summary / detailed analysis / comprehensive)
- Topic or question

**Outputs:**
- Synthesized response combining all sources
- Source attribution list
- Confidence score

**UI Components:**
- Multi-select dropdown for source types (Files, Web, Memory, Chat History)
- Text input for synthesis topic/question
- Slider for synthesis depth (1-5)
- Card display for results with source tags
- Confidence meter (progress bar)

---

### 2. Pattern Recognition Engine

**What it does:** Identifies recurring patterns, trends, anomalies, and relationships across data.

**Inputs needed:**
- Data source (uploaded file, workspace files, memory timeline)
- Pattern type (temporal, behavioral, semantic, anomalous)
- Time range (optional)

**Outputs:**
- Identified patterns with visualizations
- Anomaly alerts
- Trend graphs
- Relationship maps

**UI Components:**
- File upload dropzone
- Pattern type selector (cards with icons)
- Date range picker
- **Chart area** - line graphs for temporal, heatmaps for behavioral
- **Data table** for detailed pattern listings
- Anomaly alert badges (red highlight)

---

### 3. Cross-Domain Analysis

**What it does:** Analyzes topics across different domains (tech, finance, science, etc.) to find connections.

**Inputs needed:**
- Primary topic
- Domain scope (single / multi)
- Comparison targets (optional)

**Outputs:**
- Domain mapping visualization
- Connection strength indicators
- Cross-domain insights list

**UI Components:**
- Search input with autocomplete for topics
- Multi-select domain chips (Tech, Finance, Science, Health, etc.)
- Interactive domain map (node graph)
- Connection strength slider
- Insight cards with domain tags

---

### 4. Insight Generator

**What it does:** Produces actionable insights from raw data or conversations.

**Inputs needed:**
- Input data (text, file, or "analyze recent memory")
- Insight type (actionable, observational, predictive)
- Format preference (brief / detailed)

**Outputs:**
- Generated insights
- Supporting evidence
- Recommended actions (if actionable)

**UI Components:**
- Large text area for input data
- Toggle for input source (manual / from memory)
- Insight type radio buttons
- Format toggle (brief/detailed)
- Insight cards with "action items" checklist
- Copy-to-clipboard button

---

### 5. Relationship Mapper

**What it does:** Maps relationships between entities (people, concepts, files, events).

**Inputs needed:**
- Entity seed (person, concept, or "analyze workspace")
- Relationship depth (direct / extended / full graph)
- Filter by type

**Outputs:**
- Entity relationship graph
- Key intermediaries
- Connection strength matrix

**UI Components:**
- Entity search with suggestions
- Depth selector (radio: Direct → Extended → Full)
- Entity type filters (People, Concepts, Files, Events)
- **Interactive node graph** (zoomable, pannable)
- Entity detail panels (slide-out)
- Connection list (sidebar)

---

### 6. Timeline Analyzer

**What it does:** Constructs and analyzes timelines from events in memory or provided data.

**Inputs needed:**
- Time range or "all time"
- Event categories to include
- Granularity (day / week / month / year)

**Outputs:**
- Visual timeline
- Event clustering
- Gap analysis
- Milestone markers

**UI Components:**
- Date range picker
- Category filter checkboxes
- Granularity selector
- Horizontal timeline (zoomable)
- Event detail tooltips
- Milestone flags

---

### 7. Anomaly Detector

**What it does:** Flags unusual patterns, outliers, or unexpected changes.

**Inputs needed:**
- Data source
- Sensitivity (low / medium / high)
- Anomaly types to detect

**Outputs:**
- Anomaly list with severity
- Root cause indicators
- Suggested investigations

**UI Components:**
- Data source selector
- Sensitivity slider
- Anomaly type multi-select
- **Alert list** with severity badges (🔴 High 🟡 Medium 🟢 Low)
- Drill-down buttons
- Investigation suggestions panel

---

### 8. Query Interface

**What it does:** Natural language interface for all Nexus capabilities.

**Inputs needed:**
- Natural language query
- Optional context filters

**Outputs:**
- Direct answer
- Suggested follow-ups
- Relevant visualizations

**UI Components:**
- Large chat-style input (like Claude/ChatGPT)
- Context chips (filter by source, date, type)
- Suggested prompts (quick buttons)
- Streaming response display
- Follow-up suggestion cards

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar] Nexus          [Status] [Settings] [?]           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              🔍 Query Interface                      │   │
│  │  [                                          ] [Ask]  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  [Synthesis] [Patterns] [Analysis] [Insights] [Relations]   │
│  [Timeline] [Anomalies]                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   MAIN CONTENT AREA                         │
│              (switches based on selected tab)               │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │                      │  │                          │    │
│  │   Visualization      │  │   Results / Details      │    │
│  │   (Charts, Graphs)   │  │   (Cards, Tables, Lists)  │    │
│  │                      │  │                          │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Recent Activity]                    [Quick Actions: + ]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Synthesize Memory | "synthesize" + topic | Combined view of relevant memories |
| Find Patterns | "find patterns in [data]" | Pattern analysis view |
| Map Relationships | "how does X relate to Y" | Relationship graph |
| Analyze Timeline | "what happened [timeframe]" | Timeline view |
| Detect Anomalies | "find anomalies" | Anomaly alerts |

---

## Interaction Patterns

1. **Tab-based navigation** - Primary capabilities as tabs
2. **Context-aware suggestions** - AI-suggested next actions
3. **Drill-down** - Click any result to see details
4. **Export** - Download results as JSON/Markdown/PNG
5. **Share** - Send to other agents or channels

---

## Color Scheme

| Element | Color |
|---------|-------|
| Primary | #6366F1 (Indigo) |
| Secondary | #8B5CF6 (Violet) |
| Accent | #EC4899 (Pink) |
| Background | #0F172A (Dark slate) |
| Surface | #1E293B (Slate) |
| Text Primary | #F8FAFC |
| Text Secondary | #94A3B8 |
| Success | #10B981 |
| Warning | #F59E0B |
| Error | #EF4444 |

---

*Design complete. Ready for implementation.*
