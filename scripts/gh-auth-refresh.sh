#!/bin/bash
# GitHub Authentication Refresh Helper
# Usage: ./gh-auth-refresh.sh [--check|--refresh|--logout]

set -e

show_status() {
    echo "=== GitHub Auth Status ==="
    if gh auth status 2>/dev/null; then
        echo "✓ Authenticated successfully"
        return 0
    else
        echo "✗ Not authenticated or token expired"
        return 1
    fi
}

refresh_auth() {
    echo "=== Refreshing GitHub Authentication ==="
    gh auth login -h github.com
    echo ""
    show_status
}

logout_auth() {
    echo "=== Logging out of GitHub ==="
    gh auth logout -h github.com -u DisMuriuki --yes
}

case "${1:-}" in
    --check) show_status ;;
    --refresh) refresh_auth ;;
    --logout) logout_auth ;;
    *) echo "Usage: $0 [--check|--refresh|--logout]" ;;
esac
