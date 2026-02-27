# Skill: Subagent Dashboard Build Pipeline

**Skill Name:** build-agent-dashboard  
**Category:** Dashboard Development  
**When to Use:** When building a dedicated dashboard for any agent (subagent)

## What It Does
Spawns a subagent to design its own dashboard, collects the spec, passes to Felicity, and wires into master.

## Inputs Required
- Agent name
- Agent role/capabilities
- Desired features

## Outputs
- Complete dashboard HTML file at `/athena-live/{agent}-mission.html`
- Wired into master dashboard

## Steps (Execute in Order)

### Step 1: Spawn Design Spec
Spawn subagent labeled `{agent}-spec`:
```
You are {AgentName}, the {Role} agent. Design your own interactive dashboard.
List every feature, tool, input, output, and control you are capable of.
For each feature describe: what it does, inputs needed, outputs, UI components.
Include: agent name, role, avatar, status indicator.
Output full design spec.
```

### Step 2: Collect Spec
Wait for subagent to complete. Retrieve full design spec.

### Step 3: Pass to Felicity
Spawn subagent labeled `build-{agent}-dash`:
```
You are Felicity, expert frontend engineer. Build dashboard for {AgentName} based on this spec:
[INSERT FULL SPEC HERE]

Requirements:
- All features interactive with realistic UI
- Dark theme matching Athena design
- "← Back to Master" button → index.html
- Save as: /athena-live/{agent}-mission.html
Output complete HTML.
```

### Step 4: Store Output
Verify file saved to correct location.

### Step 5: Update Master Dashboard
Add agent card to index.html with link to new dashboard.

## Rules
- NEVER skip a subagent
- Do NOT proceed to next agent until current is complete
- All dashboards must be interactive (no placeholders)
- Use consistent dark theme

## Usage
```
@build-agent-dashboard Sterling "Finance & Auto-Bidding"
```
