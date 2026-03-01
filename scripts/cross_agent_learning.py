#!/usr/bin/env python3
"""
Athena Cross-Agent Learning System

Enables knowledge sharing between agents:
- Shared knowledge base
- Experience logging and extraction
- Pattern recognition across agent outputs
- Learning transfer between similar tasks

Author: Ishtar (Night Cycle Research)
Date: 2026-02-28
"""

import json
import os
import sys
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, field, asdict
from enum import Enum
import re

# Paths
WORKSPACE = Path('/root/.openclaw/workspace')
KNOWLEDGE_FILE = WORKSPACE / 'memory' / 'knowledge-base.json'
AGENT_MEMORY = WORKSPACE / 'memory'
RESEARCH_LOG = WORKSPACE / 'memory' / 'ishtar-research-log.md'


class KnowledgeType(Enum):
    PATTERN = "pattern"
    BEST_PRACTICE = "best_practice"
    FAILURE_MODE = "failure_mode"
    SUCCESS_FACTOR = "success_factor"
    TEMPLATE = "template"
    INSIGHT = "insight"


class Domain(Enum):
    BIDDING = "bidding"
    RESEARCH = "research"
    COMMUNICATION = "communication"
    DEVELOPMENT = "development"
    MAINTENANCE = "maintenance"
    COORDINATION = "coordination"


@dataclass
class Experience:
    """An experience entry from an agent"""
    id: str
    agent: str
    task_type: str
    domain: str
    timestamp: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    success: bool
    duration_seconds: float
    lessons_learned: List[str] = field(default_factory=list)
    patterns_identified: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Learning:
    """A distilled learning from multiple experiences"""
    id: str
    domain: str
    pattern: str
    confidence: float
    supporting_experiences: List[str]
    applicability: List[str]
    counter_examples: List[str] = field(default_factory=list)
    created: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    last_validated: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


@dataclass
class SharedKnowledge:
    """Knowledge base structure"""
    metadata: Dict[str, Any]
    domains: Dict[str, Dict[str, Any]]
    experiences: List[Dict[str, Any]]
    learnings: Dict[str, Any]
    models: Dict[str, Any]


class CrossAgentLearning:
    """Main cross-agent learning system"""

    # Agent domain mapping
    AGENT_DOMAINS = {
        "sterling": ["bidding", "finance"],
        "ishtar": ["research", "development"],
        "athena": ["coordination", "maintenance"],
        "felicity": ["communication"],
        "prometheus": ["development", "research"],
        "squire": ["maintenance"],
        "delver": ["research"],
        "cisco": ["maintenance", "coordination"],
        "themis": ["coordination", "research"]
    }

    def __init__(self, knowledge_file: Path = KNOWLEDGE_FILE):
        self.knowledge_file = knowledge_file
        self.knowledge = self._load_knowledge()

    def _load_knowledge(self) -> SharedKnowledge:
        """Load knowledge base from file"""
        if self.knowledge_file.exists():
            try:
                with open(self.knowledge_file, 'r') as f:
                    data = json.load(f)
                return SharedKnowledge(**data)
            except Exception as e:
                print(f"Error loading knowledge: {e}")

        # Create new knowledge base
        return SharedKnowledge(
            metadata={
                "version": "1.0",
                "created": datetime.utcnow().isoformat() + "Z",
                "last_updated": datetime.utcnow().isoformat() + "Z"
            },
            domains={domain.value: {
                "patterns": [],
                "best_practices": [],
                "failure_modes": [],
                "success_rates": {}
            } for domain in Domain},
            experiences=[],
            learnings={"shared": [], "by_agent": {}},
            models={}
        )

    def _save_knowledge(self):
        """Save knowledge base to file"""
        self.knowledge_file.parent.mkdir(parents=True, exist_ok=True)
        self.knowledge.metadata["last_updated"] = datetime.utcnow().isoformat() + "Z"
        
        with open(self.knowledge_file, 'w') as f:
            json.dump(asdict(self.knowledge), f, indent=2)

    def log_experience(self, experience: Experience):
        """Log an agent experience"""
        # Add to experiences
        self.knowledge.experiences.append(asdict(experience))
        
        # Keep last 1000 experiences
        if len(self.knowledge.experiences) > 1000:
            self.knowledge.experiences = self.knowledge.experiences[-1000:]

        # Update agent-specific learnings
        agent = experience.agent
        if agent not in self.knowledge.learnings["by_agent"]:
            self.knowledge.learnings["by_agent"][agent] = {
                "total_tasks": 0,
                "success_rate": 0,
                "domains": {},
                "patterns": []
            }

        agent_stats = self.knowledge.learnings["by_agent"][agent]
        agent_stats["total_tasks"] += 1
        
        # Update success rate
        total = agent_stats["total_tasks"]
        current_rate = agent_stats["success_rate"]
        new_success = 1 if experience.success else 0
        agent_stats["success_rate"] = (current_rate * (total - 1) + new_success) / total

        # Update domain stats
        domain = experience.domain
        if domain not in agent_stats["domains"]:
            agent_stats["domains"][domain] = {"count": 0, "success_rate": 0}
        
        domain_stats = agent_stats["domains"][domain]
        domain_count = domain_stats["count"] + 1
        domain_current = domain_stats["success_rate"]
        domain_stats["count"] = domain_count
        domain_stats["success_rate"] = (domain_current * (domain_count - 1) + new_success) / domain_count

        # Extract patterns from experience
        self._extract_patterns(experience)

        self._save_knowledge()

    def _extract_patterns(self, experience: Experience):
        """Extract patterns from an experience"""
        domain = experience.domain
        if domain not in self.knowledge.domains:
            return

        domain_data = self.knowledge.domains[domain]

        # Extract success patterns
        if experience.success and experience.lessons_learned:
            for lesson in experience.lessons_learned:
                pattern = {
                    "pattern": lesson,
                    "confidence": 0.7,
                    "source": experience.agent,
                    "task_type": experience.task_type,
                    "timestamp": experience.timestamp,
                    "examples": [experience.id]
                }
                
                # Check if similar pattern exists
                existing = self._find_similar_pattern(domain_data["patterns"], lesson)
                if existing:
                    existing["confidence"] = min(0.95, existing["confidence"] + 0.05)
                    existing["examples"].append(experience.id)
                else:
                    domain_data["patterns"].append(pattern)

        # Extract failure modes
        if not experience.success:
            failure_mode = {
                "mode": experience.metadata.get("error", "Unknown failure"),
                "context": experience.input,
                "agent": experience.agent,
                "timestamp": experience.timestamp
            }
            domain_data["failure_modes"].append(failure_mode)

    def _find_similar_pattern(self, patterns: List[Dict], new_pattern: str) -> Optional[Dict]:
        """Find a similar existing pattern"""
        new_words = set(new_pattern.lower().split())
        
        for pattern in patterns:
            existing_words = set(pattern["pattern"].lower().split())
            overlap = len(new_words & existing_words) / max(len(new_words), len(existing_words))
            if overlap > 0.7:
                return pattern
        
        return None

    def add_learning(self, learning: Learning):
        """Add a distilled learning to the knowledge base"""
        if learning.domain not in self.knowledge.domains:
            self.knowledge.domains[learning.domain] = {
                "patterns": [],
                "best_practices": [],
                "failure_modes": [],
                "success_rates": {}
            }

        # Add to shared learnings
        self.knowledge.learnings["shared"].append(asdict(learning))
        
        self._save_knowledge()

    def get_knowledge_for_agent(self, agent: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """Get relevant knowledge for an agent"""
        agent_domains = self.AGENT_DOMAINS.get(agent, ["coordination"])
        
        if domain:
            domains = [domain] if domain in agent_domains else agent_domains
        else:
            domains = agent_domains

        knowledge = {
            "agent": agent,
            "domains": {},
            "patterns": [],
            "best_practices": [],
            "failure_modes_to_avoid": []
        }

        for d in domains:
            if d in self.knowledge.domains:
                domain_data = self.knowledge.domains[d]
                knowledge["domains"][d] = domain_data
                knowledge["patterns"].extend(domain_data.get("patterns", []))
                knowledge["best_practices"].extend(domain_data.get("best_practices", []))
                knowledge["failure_modes_to_avoid"].extend(
                    domain_data.get("failure_modes", [])[-5:]  # Last 5 failures
                )

        return knowledge

    def transfer_learning(self, from_agent: str, to_agent: str, domain: str) -> Dict[str, Any]:
        """Transfer learning from one agent to another"""
        # Get source agent's patterns
        source_knowledge = self.knowledge.learnings["by_agent"].get(from_agent, {})
        domain_patterns = []
        
        if domain in self.knowledge.domains:
            for pattern in self.knowledge.domains[domain].get("patterns", []):
                if pattern.get("source") == from_agent:
                    domain_patterns.append(pattern)

        transferred = {
            "from": from_agent,
            "to": to_agent,
            "domain": domain,
            "patterns": domain_patterns,
            "recommendations": []
        }

        # Generate recommendations based on patterns
        for pattern in domain_patterns[:5]:
            if pattern["confidence"] > 0.8:
                transferred["recommendations"].append({
                    "pattern": pattern["pattern"],
                    "confidence": pattern["confidence"],
                    "suggestion": f"Apply pattern from {from_agent}: {pattern['pattern']}"
                })

        return transferred

    def analyze_agent_performance(self) -> Dict[str, Any]:
        """Analyze performance across all agents"""
        analysis = {
            "agents": {},
            "top_performers": [],
            "domains": {},
            "recommendations": []
        }

        for agent, stats in self.knowledge.learnings["by_agent"].items():
            analysis["agents"][agent] = {
                "total_tasks": stats.get("total_tasks", 0),
                "success_rate": stats.get("success_rate", 0),
                "domains": stats.get("domains", {})
            }

        # Find top performers
        sorted_agents = sorted(
            analysis["agents"].items(),
            key=lambda x: x[1]["success_rate"],
            reverse=True
        )
        analysis["top_performers"] = [a[0] for a in sorted_agents[:3]]

        # Domain analysis
        for domain, data in self.knowledge.domains.items():
            patterns = data.get("patterns", [])
            if patterns:
                avg_confidence = sum(p["confidence"] for p in patterns) / len(patterns)
                analysis["domains"][domain] = {
                    "pattern_count": len(patterns),
                    "avg_confidence": avg_confidence,
                    "failure_count": len(data.get("failure_modes", []))
                }

        # Generate recommendations
        for agent, stats in analysis["agents"].items():
            if stats["success_rate"] < 0.8 and stats["total_tasks"] > 5:
                # Find best agent to learn from
                for top_agent in analysis["top_performers"]:
                    if top_agent != agent:
                        shared_domains = set(self.AGENT_DOMAINS.get(agent, [])) & \
                                       set(self.AGENT_DOMAINS.get(top_agent, []))
                        if shared_domains:
                            analysis["recommendations"].append({
                                "agent": agent,
                                "learn_from": top_agent,
                                "domains": list(shared_domains),
                                "reason": f"Low success rate ({stats['success_rate']:.1%})"
                            })
                            break

        return analysis

    def get_shared_insights(self) -> List[Dict[str, Any]]:
        """Get insights that have been shared across agents"""
        insights = []
        
        for pattern in self.knowledge.learnings.get("shared", []):
            if len(pattern.get("supporting_experiences", [])) > 2:
                insights.append({
                    "pattern": pattern["pattern"],
                    "confidence": pattern["confidence"],
                    "domain": pattern["domain"],
                    "supporting_agents": list(set(
                        exp.split("_")[0] for exp in pattern.get("supporting_experiences", [])
                    ))
                })

        return sorted(insights, key=lambda x: x["confidence"], reverse=True)


def create_sample_experiences():
    """Create sample experiences for testing"""
    learning_system = CrossAgentLearning()
    
    # Sample experiences for different agents
    sample_data = [
        {
            "agent": "sterling",
            "task_type": "BID_SUBMISSION",
            "domain": "bidding",
            "success": True,
            "duration_seconds": 45,
            "lessons_learned": [
                "Lower bid amounts on weekends increase win rate",
                "Quick response time correlates with client engagement"
            ],
            "input": {"project_value": 500, "complexity": "medium"},
            "output": {"bid_amount": 250, "status": "won"}
        },
        {
            "agent": "ishtar",
            "task_type": "RESEARCH_DEEP",
            "domain": "research",
            "success": True,
            "duration_seconds": 3600,
            "lessons_learned": [
                "Breaking down complex topics improves output quality",
                "Cross-referencing multiple sources increases accuracy"
            ],
            "input": {"topic": "Multi-agent orchestration"},
            "output": {"findings": "...", "confidence": 0.92}
        },
        {
            "agent": "felicity",
            "task_type": "EMAIL_RESPONSE",
            "domain": "communication",
            "success": True,
            "duration_seconds": 120,
            "lessons_learned": [
                "Professional tone with personal touches improves response rate",
                "Clear subject lines increase open rates"
            ],
            "input": {"email_type": "follow_up"},
            "output": {"sent": True, "tone": "professional_friendly"}
        }
    ]

    for data in sample_data:
        exp = Experience(
            id=f"exp_{data['agent']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{hashlib.md5(str(data).encode()).hexdigest()[:8]}",
            agent=data["agent"],
            task_type=data["task_type"],
            domain=data["domain"],
            timestamp=datetime.utcnow().isoformat() + "Z",
            input=data["input"],
            output=data["output"],
            success=data["success"],
            duration_seconds=data["duration_seconds"],
            lessons_learned=data.get("lessons_learned", []),
            tags=[data["domain"], data["task_type"]]
        )
        learning_system.log_experience(exp)
        print(f"Logged experience: {exp.id}")

    print(f"\nTotal experiences: {len(learning_system.knowledge.experiences)}")
    
    # Analyze
    analysis = learning_system.analyze_agent_performance()
    print(f"\nAgent Analysis:")
    print(json.dumps(analysis, indent=2))


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Cross-Agent Learning System")
    parser.add_argument("--sample", action="store_true", help="Create sample experiences")
    parser.add_argument("--analyze", action="store_true", help="Analyze agent performance")
    parser.add_argument("--knowledge-for", type=str, help="Get knowledge for agent")
    parser.add_argument("--transfer", nargs=3, metavar=("FROM", "TO", "DOMAIN"), 
                       help="Transfer learning between agents")
    parser.add_argument("--insights", action="store_true", help="Get shared insights")

    args = parser.parse_args()

    learning_system = CrossAgentLearning()

    if args.sample:
        create_sample_experiences()

    if args.analyze:
        analysis = learning_system.analyze_agent_performance()
        print(json.dumps(analysis, indent=2))

    if args.knowledge_for:
        knowledge = learning_system.get_knowledge_for_agent(args.knowledge_for)
        print(json.dumps(knowledge, indent=2))

    if args.transfer:
        from_agent, to_agent, domain = args.transfer
        transfer = learning_system.transfer_learning(from_agent, to_agent, domain)
        print(json.dumps(transfer, indent=2))

    if args.insights:
        insights = learning_system.get_shared_insights()
        print(json.dumps(insights, indent=2))


if __name__ == "__main__":
    main()
