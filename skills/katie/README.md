# Katie - Quick Reference

## List Available Templates
```bash
python3 /root/.openclaw/workspace/skills/katie/katie.py list-templates
```

## List Available Patterns
```bash
python3 /root/.openclaw/workspace/skills/katie/katie.py list-patterns
```

## List Recommended Workflows
```bash
python3 /root/.openclaw/workspace/skills/katie/katie.py list-workflows
```

## Check Status
```bash
python3 /root/.openclaw/workspace/skills/katie/katie.py status
```

## Estimate Workflow Cost
```bash
python3 /root/.openclaw/workspace/skills/katie/katie.py estimate --workflow full_pentest
python3 /root/.openclaw/workspace/skills/katie/katie.py estimate --workflow bug_bounty --model qwen_nvidia
```

## Available Templates (15)

| Template ID | Name | Category |
|-------------|------|----------|
| recon_scout | Recon Scout | cybersecurity |
| exploit_artist | Exploit Artist | cybersecurity |
| blue_guardian | Blue Guardian | cybersecurity |
| red_raider | Red Raider | cybersecurity |
| bug_hunter | Bug Hunter | cybersecurity |
| api_tester | API Tester | cybersecurity |
| web_pentester | Web Pentester | cybersecurity |
| flag_discriminator | Flag Discriminator | cybersecurity |
| code_artisan | Code Artisan | development |
| test_engineer | Test Engineer | development |
| doc_writer | Doc Writer | development |
| deep_diver | Deep Diver | research |
| data_miner | Data Miner | research |
| analyst | Analyst | research |
| financial_analyst | Financial Analyst | finance |

## Available Patterns (6)

| Pattern | Type | Use Case |
|---------|------|----------|
| swarm | Decentralized | CTF, Bug Bounty |
| hierarchical | Centralized | Full Pentest |
| sequential | Pipeline | Recon→Exploit→Report |
| parallel | Independent | Multi-target scan |
| recursive | Self-refining | Code debugging |
| conditional | Dynamic | Decision-based routing |

## Recommended Workflows (5)

| Workflow | Pattern | Agents | Description |
|----------|---------|--------|-------------|
| full_pentest | hierarchical | 5 | Complete penetration test |
| bug_bounty | swarm | 4 | Bug bounty automation |
| ctf | swarm | 3 | CTF challenge solving |
| code_review | sequential | 3 | Code review pipeline |
| research | parallel | 3 | Multi-source research |

## Python API Usage

```python
from katie import (
    get_available_templates,
    get_available_patterns,
    create_agent_task,
    create_workflow_task,
    estimate_cost,
    get_status
)

# Get all templates
templates = get_available_templates()

# Create a single agent task
task = create_agent_task("recon_scout", custom_instructions="Focus on DNS enumeration")

# Create a workflow
workflow = create_workflow_task("full_pentest", "target.com")

# Estimate cost
cost = estimate_cost("bug_bounty", model="GLM-5")
```

---

**Reference:** CAI Framework - https://github.com/aliasrobotics/cai
