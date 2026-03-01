#!/bin/bash
# athena-status-report.sh - Athena System Status Report Generator
# Usage: athena-status-report.sh [--json] [--brief]
#   --json    Output JSON format only
#   --brief   Show brief status (no detailed metrics)

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [--json] [--brief]"
    echo "  --json    Output JSON format only"
    echo "  --brief   Show brief status (no detailed metrics)"
    exit 0
fi

GATEWAY_URL="${GATEWAY_URL:-http://127.0.0.1:18789}"
API_SERVER_URL="${API_SERVER_URL:-http://127.0.0.1:3847}"
OPENCLAW_BIN="${OPENCLAW_BIN:-openclaw}"
EXIT_OK=0; EXIT_WARNING=1; EXIT_CRITICAL=2

# Colors
C_R='\033[0m'; C_B='\033[1m'; C_G='\033[32m'; C_Y='\033[33m'; C_RD='\033[31m'; C_C='\033[36m'; C_GR='\033[90m'
[ ! -t 1 ] || [ "$NO_COLOR" = "1" ] && C_R='' C_B='' C_G='' C_Y='' C_RD='' C_C='' C_GR=''

OUTPUT_JSON=false; BRIEF_MODE=false
for arg in "$@"; do [ "$arg" = "--json" ] && OUTPUT_JSON=true; [ "$arg" = "--brief" ] && BRIEF_MODE=true; done

fetch_json() { curl -s --max-time "${2:-5}" "$1" 2>/dev/null || echo '{"error":"connection failed"}'; }

get_gateway_status() {
    local r=$(fetch_json "${GATEWAY_URL}/rpc?method=gateway.status" 5)
    echo "$r" | grep -q '"error"' && r=$($OPENCLAW_BIN gateway call status --json 2>/dev/null) || echo '{"error":"gateway unavailable"}'
    echo "$r"
}

get_system_metrics() {
    echo "{\"cpu_load\":\"$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')",\"memory\":\"$(free -m | awk '/Mem:/ {printf "%.1f/%.0f", $3/1024, $2/1024}')",\"disk\":\"$(df -h / | awk 'NR==2 {printf "%s/%s", $3, $2}')",\"uptime\":\"$(uptime -p 2>/dev/null || uptime | awk '{print $3,$4}')"\"}"
}

get_disk_usage() { df -h / | awk 'NR==2 {print $5}' | tr -d '%%'; }
get_memory_percent() { free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}'; }

get_recent_errors() {
    local e=""
    [ -d /root/.openclaw/logs ] && e=$(find /root/.openclaw/logs -name "*.log" -mmin -60 2>/dev/null | xargs grep -i "error\|exception\|fail" 2>/dev/null | tail -5)
    local je=$(journalctl -p err --since "1 hour ago" -n 5 2>/dev/null | tail -5) || true
    [ -n "$e" ] || [ -n "$je" ] && echo "$e $je" | tr '\n' ' ' | head -c 500 || echo "none"
}

check_gateway() {
    curl -s --max-time 3 "${GATEWAY_URL}/health" >/dev/null 2>&1 && echo "running" || ($OPENCLAW_BIN gateway status 2>/dev/null | grep -q "running\|active" && echo "running" || echo "stopped")
}

generate_json_report() {
    local gs=$(check_gateway) gs2=$(get_gateway_status) sm=$(get_system_metrics) du=$(get_disk_usage) mu=$(get_memory_percent) re=$(get_recent_errors)
    local cl=$(echo "$sm" | grep -o '"cpu_load":"[^"]*"' | cut -d'"' -f4)
    local mem=$(echo "$sm" | grep -o '"memory":"[^"]*"' | cut -d'"' -f4)
    local dsk=$(echo "$sm" | grep -o '"disk":"[^"]*"' | cut -d'"' -f4)
    local ut=$(echo "$sm" | grep -o '"uptime":"[^"]*"' | cut -d'"' -f4)
    local hs="healthy"
    [ "$gs" != "running" ] && hs="critical" || ([ "$du" -gt 90 ] || [ "$mu" -gt 90 ]) && hs="warning"
    cat <<EOJSON
{"timestamp":"$(date -Iseconds)","hostname":"$(hostname)","health":"$hs","gateway":{"status":"$gs","url":"$GATEWAY_URL"},"api_server":{"url":"$API_SERVER_URL"},"system":{"cpu_load":"$cl","memory_used_gb":"$mem","memory_percent":$mu,"disk_usage_percent":$du,"disk_used":"$dsk","uptime":"$ut"},"agents":$gs2,"recent_errors":"$re"}
EOJSON
}

generate_human_report() {
    local gs du mu cl mem dsk ut sm
    gs=$(check_gateway); du=$(get_disk_usage); mu=$(get_memory_percent)
    sm=$(get_system_metrics); cl=$(echo "$sm" | grep -o '"cpu_load":"[^"]*"' | cut -d'"' -f4)
    mem=$(echo "$sm" | grep -o '"memory":"[^"]*"' | cut -d'"' -f4)
    dsk=$(echo "$sm" | grep -o '"disk":"[^"]*"' | cut -d'"' -f4)
    ut=$(echo "$sm" | grep -o '"uptime":"[^"]*"' | cut -d'"' -f4)
    echo ""; echo -e "${C_B}${C_C}╔══════════════════════════════════════════════════════════╗${C_R}"; echo -e "${C_B}${C_C}║           ATHENA SYSTEM STATUS REPORT                      ║${C_R}"; echo -e "${C_B}${C_C}╚══════════════════════════════════════════════════════════╝${C_R}"
    echo ""; echo -e "${C_GR}Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')${C_R}"; echo -e "${C_GR}Host: $(hostname)${C_R}"; echo ""
    echo -e "${C_B}━━━ SYSTEM HEALTH ━━━${C_R}"
    [ "$gs" = "running" ] && echo -e "  Gateway:    ${C_G}● Running${C_R}" || echo -e "  Gateway:    ${C_RD}● Stopped${C_R}"
    echo -e "  CPU Load:   ${C_C}$cl${C_R}"
    [ "$mu" -gt 90 ] && echo -e "  Memory:     ${C_RD}$mem (${mu}%)${C_R}" || ([ "$mu" -gt 75 ] && echo -e "  Memory:     ${C_Y}$mem (${mu}%)${C_R}" || echo -e "  Memory:     ${C_G}$mem (${mu}%)${C_R}")
    [ "$du" -gt 90 ] && echo -e "  Disk:        ${C_RD}$dsk (${du}%)${C_R}" || ([ "$du" -gt 75 ] && echo -e "  Disk:        ${C_Y}$dsk (${du}%)${C_R}" || echo -e "  Disk:        ${C_G}$dsk (${du}%)${C_R}")
    echo -e "  Uptime:     ${C_C}$ut${C_R}"; echo ""
    if [ "$BRIEF_MODE" = true ]; then gs2=$(get_gateway_status); echo "$gs2" | grep -q '"active"' && echo -e "${C_B}━━━ ACTIVE AGENTS ━━━${C_R}" && echo "$gs2" | grep -o '"name":"[^"]*"' | head -10 | sed 's/"name":"/  • /g' | sed 's/"//g'; return; fi
    echo -e "${C_B}━━━ API SERVICES ━━━${C_R}"; as=$(fetch_json "${API_SERVER_URL}/api/live-status" 5); echo "$as" | grep -q '"error"' && echo -e "  API Server:  ${C_Y}● Unreachable${C_R}" || echo -e "  API Server:  ${C_G}● Online${C_R}"; echo ""
    echo -e "${C_B}━━━ AGENT SESSIONS ━━━${C_R}"; gs2=$(get_gateway_status)
    if echo "$gs2" | grep -q '"error"'; then echo -e "  ${C_Y}Unable to fetch agent status${C_R}"; else ac=$(echo "$gs2" | grep -o '"name":"[^"]*"' | wc -l); echo -e "  Total Agents: ${C_C}$ac${C_R}"; echo "$gs2" | grep -q '"status":"active"' && echo -e "\n  ${C_G}Active:${C_R}" && echo "$gs2" | grep -B1 '"status":"active"' | grep -o '"name":"[^"]*"' | sed 's/"name":"/    • /g' | sed 's/"//g'; echo "$gs2" | grep -q '"status":"idle"' && echo -e "\n  ${C_GR}Idle:${C_R}" && echo "$gs2" | grep -B1 '"status":"idle"' | grep -o '"name":"[^"]*"' | sed 's/"name":"/    • /g' | sed 's/"//g'; fi; echo ""
    echo -e "${C_B}━━━ RECENT ERRORS (Last Hour) ━━━${C_R}"; re=$(get_recent_errors); [ "$re" = "none" ] || [ -z "$re" ] && echo -e "  ${C_G}No recent errors${C_R}" || echo "$re" | fold -s -w 80 | sed 's/^/  /g'; echo ""
    echo -e "${C_B}━━━ STATUS ━━━${C_R}"; [ "$gs" = "running" ] && [ "$du" -lt 90 ] && [ "$mu" -lt 90 ] && echo -e "  ${C_G}● All systems operational${C_R}" || ([ "$gs" != "running" ] && echo -e "  ${C_RD}● Gateway is not running - run 'openclaw gateway start'${C_R}" || echo -e "  ${C_Y}● Some metrics are elevated${C_R}"); echo ""
}

get_exit_code() {
    local gs du mu; gs=$(check_gateway); du=$(get_disk_usage); mu=$(get_memory_percent)
    [ "$gs" != "running" ] && return $EXIT_CRITICAL || ([ "$du" -gt 90 ] || [ "$mu" -gt 95 ]) && return $EXIT_CRITICAL || ([ "$du" -gt 75 ] || [ "$mu" -gt 85 ]) && return $EXIT_WARNING || return $EXIT_OK
}

main() { [ "$OUTPUT_JSON" = true ] && generate_json_report || generate_human_report; get_exit_code; return $?; }
main "$@"
