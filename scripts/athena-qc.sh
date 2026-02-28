#!/bin/bash
# Athena Quick Command - Shell wrapper
# Add to ~/.bashrc: alias athena='/root/.openclaw/workspace/scripts/athena-qc.sh'
# Or run: source /root/.openclaw/workspace/scripts/athena-qc.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/athena-qc.js" "$@"
