---
name: ishtar-hooks
description: Ishtar's personal hooks - session_start, task_complete, bootstrap
version: 1.0.0
author: Athena
events:
  - session_start
  - task_complete
  - agent_bootstrap
---

# Ishtar Hooks

## session_start
On session start, loads:
- ~/.openclaw/agents/ishtar/SOUL.md
- ~/.openclaw/workspace/memory/ishtar-telos-context/
- ~/.openclaw/workspace/memory/ishtar-companion-config.md

## task_complete
On task completion, sends WhatsApp message in warm companion voice.

## agent_bootstrap
On bootstrap, injects identity files into system prompt.
