# Skill: System Sync

**Skill Name:** system-sync  
**Category:** System Maintenance  
**When to Use:** At end of major build sessions to preserve all work

## What It Does
Syncs complete system state across files, database, GitHub, and memory.

## Inputs Required
- Session summary
- Files changed
- New components

## Outputs
- Skills in library
- Updated configs
- Database records
- GitHub commit
- Memory entry

## Steps (Execute in Order)

### Phase 1: Skill Creation
Extract workflows into named skills:
- dashboard-improve
- build-agent-dashboard  
- onboard-micro-agent
- felicity-handoff

Store each in: `/workspace/skills/{skill-name}/SKILL.md`

### Phase 2: File Updates
Update all architecture files:
- AGENT-ROSTER.md - all 14 agents
- MEMORY.md - latest state
- Skills library index

### Phase 3: Database Update
Write to database:
- Agent profiles
- Dashboard locations
- Skill definitions
- Today's build session log

### Phase 4: GitHub Sync
```bash
cd /workspace
git add -A
git commit -m "Build session $(date +%Y-%m-%d): [summary]"
git push [remote] [branch]
```

### Phase 5: Memory Update
Write comprehensive memory entry:
- What system looked like before
- Decisions made and why
- Every component built
- Micro-agents vs subagents
- Capability profiles
- File locations
- Skills created

Tag: dashboards, micro-agents, skills, system-architecture

## Rules
- Do phases IN ORDER
- Nothing gets lost
- Commit message summarizes everything

## Usage
```
@system-sync "Built 14 agent dashboards, micro-agents hub"
```
