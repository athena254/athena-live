# Temp-Helper System

**Purpose:** Allow any agent to spawn ephemeral subagents for micro-tasks

## How It Works

### Option 2: On-Demand Spawning
Any agent can spawn a temp helper anytime:
```
@spawn temp for: "quick research on X"
```

### Option 3: Nested Depth
Temp-helpers can spawn their own temp-helpers:
```
temp-helper → spawns temp-sub-helper → task → cleanup
```

## Implementation

All agents in the allowAgents list can already:
1. Spawn each other on-demand
2. Spawn recursively (nested depth)

The system is already built-in to OpenClaw's sessions_spawn.

## Available Agents to Spawn
- delver, felicity, sterling, squire, themis, prometheus, nexus, cisco, ishtar
- chiron, iris, mnemosyne (NEW)

## Usage Examples
```
@sterling spawn temp: "check 3 new gigs and bid on best"
@felicity spawn temp: "fix this CSS bug"
@delver spawn temp: "find info on X, report back"
```

## Cleanup
- Temp agents auto-terminate after task completion
- No cleanup needed — OpenClaw handles it
