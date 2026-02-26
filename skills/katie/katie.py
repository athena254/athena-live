#!/usr/bin/env python3
"""
Katie - Meta-Agent Orchestrator for Athena

Inspired by CAI (Cybersecurity AI) framework:
https://github.com/aliasrobotics/cai

This module provides dynamic agent spawning and orchestration
capabilities using OpenClaw's session tools.
"""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

# Configuration paths
SKILL_DIR = Path(__file__).parent
TEMPLATES_PATH = SKILL_DIR / "agent-templates.json"
PATTERNS_PATH = SKILL_DIR / "patterns.json"
ACTIVE_AGENTS_PATH = SKILL_DIR / "active-agents.json"


def load_templates() -> dict:
    """Load agent templates from JSON configuration."""
    with open(TEMPLATES_PATH, 'r') as f:
        return json.load(f)


def load_patterns() -> dict:
    """Load pattern definitions from JSON configuration."""
    with open(PATTERNS_PATH, 'r') as f:
        return json.load(f)


def load_active_agents() -> dict:
    """Load currently active agents from state file."""
    if ACTIVE_AGENTS_PATH.exists():
        with open(ACTIVE_AGENTS_PATH, 'r') as f:
            return json.load(f)
    return {"agents": [], "last_updated": None}


def save_active_agents(state: dict) -> None:
    """Save active agents state to file."""
    state["last_updated"] = datetime.utcnow().isoformat() + "Z"
    with open(ACTIVE_AGENTS_PATH, 'w') as f:
        json.dump(state, f, indent=2)


def get_available_templates() -> list:
    """Get list of available agent templates."""
    templates = load_templates()
    return [
        {
            "id": key,
            "name": template["name"],
            "description": template["description"],
            "category": template["category"]
        }
        for key, template in templates["templates"].items()
    ]


def get_available_patterns() -> list:
    """Get list of available orchestration patterns."""
    patterns = load_patterns()
    return [
        {
            "id": key,
            "name": pattern["name"],
            "description": pattern["description"],
            "type": pattern["type"]
        }
        for key, pattern in patterns["patterns"].items()
    ]


def generate_agent_id(prefix: str) -> str:
    """Generate unique agent ID with prefix."""
    short_id = str(uuid.uuid4())[:8]
    return f"{prefix}-{short_id}"


def create_agent_task(
    template_id: str,
    custom_instructions: Optional[str] = None,
    model: Optional[str] = None
) -> dict:
    """
    Create agent spawning task configuration.
    
    Returns a dictionary that can be used with sessions_spawn.
    """
    templates = load_templates()
    
    if template_id not in templates["templates"]:
        raise ValueError(f"Unknown template: {template_id}")
    
    template = templates["templates"][template_id]
    
    # Build the full prompt
    instructions = custom_instructions or template["instructions"]
    
    # Determine model
    model_preference = model or template.get("model_preference", "GLM-5")
    
    task_config = {
        "template_id": template_id,
        "name": template["name"],
        "description": template["description"],
        "category": template["category"],
        "kill_chain_phase": template.get("kill_chain_phase"),
        "instructions": instructions,
        "model": model_preference,
        "timeout_minutes": template.get("timeout_minutes", 30),
        "agent_id": generate_agent_id(template.get("agent_id_prefix", "agent")),
        "tools": template.get("tools", []),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    return task_config


def create_workflow_task(
    workflow_name: str,
    target: str,
    custom_params: Optional[dict] = None
) -> dict:
    """
    Create a multi-agent workflow task.
    
    Returns workflow configuration with pattern and agents.
    """
    patterns = load_patterns()
    templates = load_templates()
    
    # Find workflow
    workflow = patterns["recommended_workflows"].get(workflow_name)
    if not workflow:
        raise ValueError(f"Unknown workflow: {workflow_name}")
    
    pattern_def = patterns["patterns"].get(workflow["pattern"])
    
    # Build workflow config
    workflow_config = {
        "workflow_name": workflow_name,
        "pattern": workflow["pattern"],
        "pattern_description": pattern_def["description"],
        "target": target,
        "phases": workflow["phases"],
        "agents": [],
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    # Create agent configs for each phase
    for i, agent_template_id in enumerate(workflow["agents"]):
        template = templates["templates"].get(agent_template_id)
        if template:
            workflow_config["agents"].append({
                "phase": workflow["phases"][i] if i < len(workflow["phases"]) else None,
                "template_id": agent_template_id,
                "name": template["name"],
                "role": template["description"]
            })
    
    # Apply custom params if provided
    if custom_params:
        workflow_config["custom_params"] = custom_params
    
    return workflow_config


def estimate_cost(workflow_name: str, model: str = "GLM-5") -> dict:
    """
    Estimate time and token cost for a workflow.
    
    Returns approximate costs based on template timeouts.
    """
    patterns = load_patterns()
    templates = load_templates()
    
    workflow = patterns["recommended_workflows"].get(workflow_name)
    if not workflow:
        return {"error": "Unknown workflow"}
    
    total_minutes = 0
    agent_count = len(workflow["agents"])
    
    for agent_template_id in workflow["agents"]:
        template = templates["templates"].get(agent_template_id)
        if template:
            total_minutes += template.get("timeout_minutes", 30)
    
    # Estimate tokens (rough approximation)
    tokens_per_minute = 50000  # Average for active reasoning
    estimated_tokens = total_minutes * tokens_per_minute
    
    return {
        "workflow": workflow_name,
        "pattern": workflow["pattern"],
        "agents": agent_count,
        "estimated_minutes": total_minutes,
        "estimated_tokens": estimated_tokens,
        "model": model
    }


def get_status() -> dict:
    """Get Katie orchestrator status."""
    active = load_active_agents()
    templates = load_templates()
    patterns = load_patterns()
    
    return {
        "status": "operational",
        "available_templates": len(templates["templates"]),
        "available_patterns": len(patterns["patterns"]),
        "available_workflows": len(patterns["recommended_workflows"]),
        "active_agents": len(active["agents"]),
        "last_updated": active.get("last_updated")
    }


# CLI interface for direct execution
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Katie - Meta-Agent Orchestrator")
    parser.add_argument("command", choices=["list-templates", "list-patterns", "list-workflows", "status", "estimate"])
    parser.add_argument("--workflow", help="Workflow name for estimate")
    parser.add_argument("--model", default="GLM-5", help="Model for estimate")
    
    args = parser.parse_args()
    
    if args.command == "list-templates":
        templates = get_available_templates()
        print(json.dumps(templates, indent=2))
    elif args.command == "list-patterns":
        patterns = get_available_patterns()
        print(json.dumps(patterns, indent=2))
    elif args.command == "list-workflows":
        patterns = load_patterns()
        print(json.dumps(patterns["recommended_workflows"], indent=2))
    elif args.command == "status":
        print(json.dumps(get_status(), indent=2))
    elif args.command == "estimate":
        if args.workflow:
            print(json.dumps(estimate_cost(args.workflow, args.model), indent=2))
        else:
            print("Error: --workflow required for estimate")
