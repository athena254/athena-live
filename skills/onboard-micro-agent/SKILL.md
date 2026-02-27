# Skill: Micro-Agent Onboarding Pipeline

**Skill Name:** onboard-micro-agent  
**Category:** Micro-Agent Integration  
**When to Use:** When adding new micro-agent from external GitHub repository

## What It Does
Takes GitHub repo URL, analyzes capabilities, builds custom dashboard, integrates into hub.

## Inputs Required
- GitHub repository URL
- Agent name
- Brief description

## Outputs
- Dashboard at `/athena-live/{agent}-mission.html`
- Card in micro-agents.html hub

## Steps (Execute in Order)

### Step 1: Clone & Analyze Repository
```bash
git clone --depth 1 {repo_url} /tmp/{agent}-repo
```
Explore:
- README.md for overview
- src/ directory for capabilities
- prompts/ for functions
- tools/ for actions

### Step 2: Extract Capabilities
Document:
- All functions/actions
- Input parameters
- Output formats
- Use cases

### Step 3: Create Design Spec
Write spec including:
- Agent profile (name, avatar, status)
- All capabilities with UI mappings
- Dashboard layout
- Required inputs/outputs

### Step 4: Pass to Felicity
Use exact prompt structure:
```
You are Felicity, expert frontend engineer. Build dashboard for {AgentName} Micro-Agent.

Repository: {repo_url}
What it does: {description}

Dashboard must include:
1. Status Panel
2. Run Controls  
3. Live Activity Feed
4. Output/Results Panel
5. Run History Log

Requirements:
- Dark theme
- "← Back to Micro-Agents Hub" button → micro-agents.html
- Save as: /athena-live/{agent}-mission.html

Output complete HTML.
```

### Step 5: Wire to Hub
Update micro-agents.html with new agent card linking to dashboard.

## Rules
- Complete Shannon fully before Katie
- Analyze repo BEFORE designing spec
- Every capability must map to UI element

## Difference from Subagents
- Micro-agents: External GitHub repos, distinct category
- Subagents: Internal OpenClaw agents

## Usage
```
@onboard-micro-agent https://github.com/user/repo "Agent Name"
```
