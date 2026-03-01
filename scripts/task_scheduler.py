#!/usr/bin/env python3
"""
Athena Task Scheduler - Cron-like scheduling for automated task execution

Supports:
- Cron expressions (e.g., "0 9 * * *" for daily at 9am)
- One-time scheduled tasks
- Recurring tasks with intervals
- Task templates for common operations

Usage:
    python scripts/task_scheduler.py [--daemon] [--check]

Author: Ishtar (Night Cycle Research)
Date: 2026-02-28
"""

import json
import os
import sys
import time
import uuid
import logging
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('TaskScheduler')

# Paths
WORKSPACE = Path('/root/.openclaw/workspace')
SCHEDULES_FILE = WORKSPACE / 'memory' / 'scheduled-tasks.json'
QUEUE_FILE = WORKSPACE / 'memory' / 'agent-queue.json'


class ScheduleType(Enum):
    CRON = "cron"
    INTERVAL = "interval"
    ONCE = "once"


class TaskStatus(Enum):
    ENABLED = "enabled"
    DISABLED = "disabled"
    PAUSED = "paused"


@dataclass
class CronExpression:
    """Parse and evaluate cron expressions"""
    minute: str = "*"
    hour: str = "*"
    day_of_month: str = "*"
    month: str = "*"
    day_of_week: str = "*"

    @classmethod
    def parse(cls, expression: str) -> 'CronExpression':
        """Parse a cron expression string"""
        parts = expression.split()
        if len(parts) != 5:
            raise ValueError(f"Invalid cron expression: {expression}")
        
        return cls(
            minute=parts[0],
            hour=parts[1],
            day_of_month=parts[2],
            month=parts[3],
            day_of_week=parts[4]
        )

    def matches(self, dt: datetime) -> bool:
        """Check if a datetime matches this cron expression"""
        def match_field(value: int, pattern: str) -> bool:
            if pattern == '*':
                return True
            if '/' in pattern:
                # Step pattern
                base, step = pattern.split('/')
                step = int(step)
                if base == '*':
                    return value % step == 0
                return value >= int(base) and (value - int(base)) % step == 0
            if '-' in pattern:
                # Range pattern
                start, end = map(int, pattern.split('-'))
                return start <= value <= end
            if ',' in pattern:
                # List pattern
                return str(value) in pattern.split(',')
            # Exact match
            return value == int(pattern)

        return (
            match_field(dt.minute, self.minute) and
            match_field(dt.hour, self.hour) and
            match_field(dt.day, self.day_of_month) and
            match_field(dt.month, self.month) and
            match_field(dt.weekday(), self.day_of_week)
        )

    def __str__(self) -> str:
        return f"{self.minute} {self.hour} {self.day_of_month} {self.month} {self.day_of_week}"


@dataclass
class ScheduledTask:
    """A scheduled task definition"""
    id: str
    name: str
    description: str = ""
    schedule_type: str = "cron"  # cron, interval, once
    cron_expression: Optional[str] = None
    interval_seconds: Optional[int] = None
    scheduled_time: Optional[str] = None
    status: str = "enabled"
    task_template: Dict[str, Any] = field(default_factory=dict)
    last_run: Optional[str] = None
    next_run: Optional[str] = None
    run_count: int = 0
    max_runs: Optional[int] = None
    created: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    created_by: str = "system"
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def calculate_next_run(self) -> Optional[datetime]:
        """Calculate the next run time based on schedule type"""
        now = datetime.utcnow()

        if self.schedule_type == "cron" and self.cron_expression:
            cron = CronExpression.parse(self.cron_expression)
            # Check next 7 days in 1-minute increments
            for i in range(7 * 24 * 60):
                check_time = now + timedelta(minutes=i)
                if cron.matches(check_time):
                    return check_time

        elif self.schedule_type == "interval" and self.interval_seconds:
            if self.last_run:
                last = datetime.fromisoformat(self.last_run.replace('Z', '+00:00'))
                return last + timedelta(seconds=self.interval_seconds)
            return now + timedelta(seconds=self.interval_seconds)

        elif self.schedule_type == "once" and self.scheduled_time:
            scheduled = datetime.fromisoformat(self.scheduled_time.replace('Z', '+00:00'))
            if scheduled > now:
                return scheduled

        return None

    def should_run(self, now: datetime) -> bool:
        """Check if this task should run now"""
        if self.status != "enabled":
            return False

        if self.max_runs and self.run_count >= self.max_runs:
            return False

        if self.schedule_type == "cron" and self.cron_expression:
            cron = CronExpression.parse(self.cron_expression)
            # Check if current minute matches
            return cron.matches(now)

        elif self.schedule_type == "interval" and self.interval_seconds:
            if not self.last_run:
                return True
            last = datetime.fromisoformat(self.last_run.replace('Z', '+00:00'))
            next_run = last + timedelta(seconds=self.interval_seconds)
            return now >= next_run

        elif self.schedule_type == "once" and self.scheduled_time:
            scheduled = datetime.fromisoformat(self.scheduled_time.replace('Z', '+00:00'))
            # Run if within 1 minute of scheduled time
            return abs((now - scheduled).total_seconds()) < 60

        return False


@dataclass
class SchedulerState:
    """State of the scheduler"""
    tasks: Dict[str, ScheduledTask] = field(default_factory=dict)
    run_history: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=lambda: {
        "created": datetime.utcnow().isoformat() + "Z",
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "version": "1.0"
    })

    def add_task(self, task: ScheduledTask):
        self.tasks[task.id] = task
        self.metadata["last_updated"] = datetime.utcnow().isoformat() + "Z"

    def remove_task(self, task_id: str) -> bool:
        if task_id in self.tasks:
            del self.tasks[task_id]
            self.metadata["last_updated"] = datetime.utcnow().isoformat() + "Z"
            return True
        return False

    def get_task(self, task_id: str) -> Optional[ScheduledTask]:
        return self.tasks.get(task_id)

    def list_tasks(self, status: Optional[str] = None) -> List[ScheduledTask]:
        tasks = list(self.tasks.values())
        if status:
            tasks = [t for t in tasks if t.status == status]
        return sorted(tasks, key=lambda t: t.next_run or "9999")


class TaskScheduler:
    """Main scheduler class"""

    # Predefined task templates
    TEMPLATES = {
        "health_check": {
            "type": "MAINTENANCE",
            "priority": "LOW",
            "assignee": "athena",
            "input": {"action": "health_check"},
            "description": "System health check"
        },
        "backup": {
            "type": "MAINTENANCE",
            "priority": "MEDIUM",
            "assignee": "squire",
            "input": {"action": "backup"},
            "description": "System backup"
        },
        "metrics_collect": {
            "type": "MAINTENANCE",
            "priority": "LOW",
            "assignee": "athena",
            "input": {"action": "collect_metrics"},
            "description": "Collect system metrics"
        },
        "bidding_cycle": {
            "type": "BIDDING",
            "priority": "HIGH",
            "assignee": "sterling",
            "input": {"action": "bid_cycle"},
            "description": "Run Beelancer bidding cycle"
        },
        "inbox_check": {
            "type": "COMMUNICATION",
            "priority": "MEDIUM",
            "assignee": "felicity",
            "input": {"action": "check_inbox"},
            "description": "Check email inbox"
        },
        "report_generation": {
            "type": "REPORT",
            "priority": "LOW",
            "assignee": "ishtar",
            "input": {"action": "generate_report"},
            "description": "Generate periodic report"
        }
    }

    def __init__(self, schedules_file: Path = SCHEDULES_FILE):
        self.schedules_file = schedules_file
        self.state = self._load_state()
        self.running = False

    def _load_state(self) -> SchedulerState:
        """Load scheduler state from file"""
        if self.schedules_file.exists():
            try:
                with open(self.schedules_file, 'r') as f:
                    data = json.load(f)
                
                state = SchedulerState()
                for task_id, task_data in data.get('tasks', {}).items():
                    state.tasks[task_id] = ScheduledTask(**task_data)
                state.run_history = data.get('run_history', [])
                state.metadata = data.get('metadata', state.metadata)
                return state
            except Exception as e:
                logger.error(f"Error loading scheduler state: {e}")

        return SchedulerState()

    def _save_state(self):
        """Save scheduler state to file"""
        self.schedules_file.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            "tasks": {tid: asdict(t) for tid, t in self.state.tasks.items()},
            "run_history": self.state.run_history[-100:],  # Keep last 100
            "metadata": self.state.metadata
        }
        
        with open(self.schedules_file, 'w') as f:
            json.dump(data, f, indent=2)

    def create_task(
        self,
        name: str,
        schedule_type: str,
        schedule_value: str,
        task_template: Dict[str, Any],
        description: str = "",
        created_by: str = "system",
        tags: List[str] = None,
        max_runs: Optional[int] = None
    ) -> ScheduledTask:
        """Create a new scheduled task"""
        task_id = f"schedule_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        task = ScheduledTask(
            id=task_id,
            name=name,
            description=description,
            schedule_type=schedule_type,
            task_template=task_template,
            created_by=created_by,
            tags=tags or [],
            max_runs=max_runs
        )

        # Set schedule based on type
        if schedule_type == "cron":
            # Validate cron expression
            CronExpression.parse(schedule_value)
            task.cron_expression = schedule_value
        elif schedule_type == "interval":
            task.interval_seconds = int(schedule_value)
        elif schedule_type == "once":
            task.scheduled_time = schedule_value

        # Calculate next run
        task.next_run = task.calculate_next_run()
        if task.next_run:
            task.next_run = task.next_run.isoformat() + "Z"

        self.state.add_task(task)
        self._save_state()

        logger.info(f"Created scheduled task: {task_id} - {name}")
        return task

    def create_from_template(
        self,
        template_name: str,
        schedule_type: str,
        schedule_value: str,
        **kwargs
    ) -> ScheduledTask:
        """Create a task from a predefined template"""
        if template_name not in self.TEMPLATES:
            raise ValueError(f"Unknown template: {template_name}")

        template = self.TEMPLATES[template_name].copy()
        template.update(kwargs)
        
        return self.create_task(
            name=kwargs.get('name', f"{template_name}_task"),
            schedule_type=schedule_type,
            schedule_value=schedule_value,
            task_template=template,
            description=template.get('description', ''),
            created_by=kwargs.get('created_by', 'system')
        )

    def enable_task(self, task_id: str) -> bool:
        """Enable a scheduled task"""
        task = self.state.get_task(task_id)
        if task:
            task.status = "enabled"
            task.next_run = task.calculate_next_run()
            if task.next_run:
                task.next_run = task.next_run.isoformat() + "Z"
            self._save_state()
            return True
        return False

    def disable_task(self, task_id: str) -> bool:
        """Disable a scheduled task"""
        task = self.state.get_task(task_id)
        if task:
            task.status = "disabled"
            self._save_state()
            return True
        return False

    def pause_task(self, task_id: str) -> bool:
        """Pause a scheduled task"""
        task = self.state.get_task(task_id)
        if task:
            task.status = "paused"
            self._save_state()
            return True
        return False

    def delete_task(self, task_id: str) -> bool:
        """Delete a scheduled task"""
        result = self.state.remove_task(task_id)
        if result:
            self._save_state()
        return result

    def queue_task(self, task: ScheduledTask) -> str:
        """Queue a task for execution"""
        # Load current queue
        queue_data = {"version": "1.1", "tasks": [], "stats": {}}
        if QUEUE_FILE.exists():
            try:
                with open(QUEUE_FILE, 'r') as f:
                    queue_data = json.load(f)
            except:
                pass

        # Create queue task from template
        task_id = f"task_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        queue_task = {
            "id": task_id,
            "type": task.task_template.get("type", "SCHEDULED"),
            "status": "PENDING",
            "priority": task.task_template.get("priority", "MEDIUM"),
            "created": datetime.utcnow().isoformat() + "Z",
            "deadline": None,
            "assignee": task.task_template.get("assignee", "athena"),
            "requester": f"scheduler:{task.id}",
            "input": task.task_template.get("input", {}),
            "output": None,
            "error": None,
            "retryCount": 0,
            "maxRetries": 3,
            "dependencies": [],
            "tags": task.tags + ["scheduled"],
            "context": {
                "source": "scheduler",
                "schedule_id": task.id,
                "schedule_name": task.name
            },
            "history": [{
                "at": datetime.utcnow().isoformat() + "Z",
                "event": "CREATED",
                "by": "scheduler"
            }]
        }

        queue_data["tasks"].append(queue_task)

        with open(QUEUE_FILE, 'w') as f:
            json.dump(queue_data, f, indent=2)

        logger.info(f"Queued task: {task_id} from schedule: {task.name}")
        return task_id

    def check_and_run(self) -> List[str]:
        """Check all scheduled tasks and run any that are due"""
        now = datetime.utcnow()
        queued_tasks = []

        for task in self.state.tasks.values():
            if task.should_run(now):
                try:
                    # Queue the task
                    queue_id = self.queue_task(task)

                    # Update task state
                    task.last_run = now.isoformat() + "Z"
                    task.run_count += 1
                    task.next_run = task.calculate_next_run()
                    if task.next_run:
                        task.next_run = task.next_run.isoformat() + "Z"

                    # Record in history
                    self.state.run_history.append({
                        "schedule_id": task.id,
                        "task_name": task.name,
                        "queued_task_id": queue_id,
                        "run_at": now.isoformat() + "Z",
                        "run_count": task.run_count
                    })

                    queued_tasks.append(queue_id)

                    # Check if one-time task should be disabled
                    if task.schedule_type == "once":
                        task.status = "disabled"

                except Exception as e:
                    logger.error(f"Error running scheduled task {task.id}: {e}")

        if queued_tasks:
            self._save_state()

        return queued_tasks

    def run_daemon(self, interval: int = 60):
        """Run as a daemon, checking every `interval` seconds"""
        logger.info(f"Starting scheduler daemon (interval: {interval}s)")
        self.running = True

        while self.running:
            try:
                queued = self.check_and_run()
                if queued:
                    logger.info(f"Queued {len(queued)} tasks")
            except Exception as e:
                logger.error(f"Scheduler error: {e}")

            time.sleep(interval)

    def stop(self):
        """Stop the daemon"""
        self.running = False
        logger.info("Scheduler stopped")

    def get_status(self) -> Dict[str, Any]:
        """Get scheduler status"""
        now = datetime.utcnow()
        
        enabled_tasks = [t for t in self.state.tasks.values() if t.status == "enabled"]
        next_runs = sorted(
            [t for t in enabled_tasks if t.next_run],
            key=lambda t: t.next_run
        )

        return {
            "running": self.running,
            "total_tasks": len(self.state.tasks),
            "enabled_tasks": len(enabled_tasks),
            "disabled_tasks": len([t for t in self.state.tasks.values() if t.status == "disabled"]),
            "paused_tasks": len([t for t in self.state.tasks.values() if t.status == "paused"]),
            "next_runs": [
                {"id": t.id, "name": t.name, "next_run": t.next_run}
                for t in next_runs[:5]
            ],
            "recent_runs": self.state.run_history[-5:],
            "templates_available": list(self.TEMPLATES.keys())
        }


def setup_default_schedules(scheduler: TaskScheduler):
    """Set up default scheduled tasks"""
    defaults = [
        # Hourly metrics collection
        {
            "template": "metrics_collect",
            "schedule_type": "cron",
            "schedule_value": "0 * * * *",  # Every hour
            "name": "hourly_metrics"
        },
        # Daily backup at midnight
        {
            "template": "backup",
            "schedule_type": "cron",
            "schedule_value": "0 0 * * *",  # Daily at midnight
            "name": "daily_backup"
        },
        # Bidding cycle every 30 minutes
        {
            "template": "bidding_cycle",
            "schedule_type": "interval",
            "schedule_value": "1800",  # 30 minutes
            "name": "bidding_cycle"
        },
        # Weekly health check
        {
            "template": "health_check",
            "schedule_type": "cron",
            "schedule_value": "0 9 * * 1",  # Mondays at 9am
            "name": "weekly_health_check"
        }
    ]

    for default in defaults:
        # Check if already exists
        existing = [t for t in scheduler.state.tasks.values() 
                    if t.name == default["name"]]
        if not existing:
            scheduler.create_from_template(**default)
            logger.info(f"Created default schedule: {default['name']}")


def main():
    parser = argparse.ArgumentParser(description="Athena Task Scheduler")
    parser.add_argument("--daemon", action="store_true", help="Run as daemon")
    parser.add_argument("--check", action="store_true", help="Check and run due tasks once")
    parser.add_argument("--status", action="store_true", help="Show scheduler status")
    parser.add_argument("--setup-defaults", action="store_true", help="Set up default schedules")
    parser.add_argument("--list", action="store_true", help="List all scheduled tasks")
    parser.add_argument("--interval", type=int, default=60, help="Daemon check interval in seconds")

    args = parser.parse_args()

    scheduler = TaskScheduler()

    if args.setup_defaults:
        setup_default_schedules(scheduler)
        print("Default schedules created")
        return

    if args.status:
        status = scheduler.get_status()
        print(json.dumps(status, indent=2))
        return

    if args.list:
        tasks = scheduler.state.list_tasks()
        for task in tasks:
            print(f"{task.id}: {task.name} [{task.status}] next: {task.next_run}")
        return

    if args.check:
        queued = scheduler.check_and_run()
        print(f"Queued {len(queued)} tasks")
        return

    if args.daemon:
        try:
            scheduler.run_daemon(args.interval)
        except KeyboardInterrupt:
            scheduler.stop()
        return

    # Default: show help
    parser.print_help()


if __name__ == "__main__":
    main()
