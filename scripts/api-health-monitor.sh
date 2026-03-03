#!/bin/bash
# API Health Monitor - Live Status Check
# Run this to get a quick status of all APIs

echo "============================================="
echo "  ATHENA API HEALTH MONITOR"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC')"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check API
check_api() {
    local name=$1
    local url=$2
    local auth_header=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" $auth_header 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ $name${NC} - HTTP $response"
        return 0
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${RED}❌ $name${NC} - Auth Failed (HTTP $response)"
        return 1
    elif [ "$response" = "000" ]; then
        echo -e "${RED}❌ $name${NC} - Unreachable"
        return 1
    else
        echo -e "${YELLOW}⚠️  $name${NC} - HTTP $response"
        return 2
    fi
}

# API Keys
NVIDIA_KEY=$(cat ~/.config/nvidia/api-key 2>/dev/null)
OPENROUTER_KEY=$(cat ~/.config/openrouter/credentials.json 2>/dev/null | jq -r '.api_key' 2>/dev/null)
GROQ_KEY=$(cat ~/.config/groq/credentials.json 2>/dev/null | jq -r '.api_key' 2>/dev/null)
GOOGLE_KEY=$(cat ~/.config/google/api-key 2>/dev/null)
MINIMAX_KEY=$(cat ~/.config/minimax/api-key 2>/dev/null)
BEELANCER_KEY=$(jq -r '.api_key' ~/.config/beelancer/credentials.json 2>/dev/null)

echo "━━━ LLM APIs ━━━"
[ -n "$NVIDIA_KEY" ] && check_api "NVIDIA Qwen" "https://integrate.api.nvidia.com/v1/models" "-H Authorization: Bearer $NVIDIA_KEY"
[ -n "$OPENROUTER_KEY" ] && check_api "OpenRouter" "https://openrouter.ai/api/v1/models" "-H Authorization: Bearer $OPENROUTER_KEY"
[ -n "$GROQ_KEY" ] && check_api "GROQ Llama" "https://api.groq.com/openai/v1/models" "-H Authorization: Bearer $GROQ_KEY"
[ -n "$GOOGLE_KEY" ] && check_api "Google Gemini" "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_KEY" ""
[ -n "$MINIMAX_KEY" ] && check_api "MiniMax" "https://api.minimax.chat/v1/text/chatcompletion_v2" "-H Authorization: Bearer $MINIMAX_KEY"

echo ""
echo "━━━ Service APIs ━━━"
check_api "Beelancer" "https://beelancer.com/api/gigs" "-H Authorization: Bearer $BEELANCER_KEY"
check_api "GitHub" "https://api.github.com/user" "-H Authorization: Bearer $(gh auth token 2>/dev/null)"

echo ""
echo "━━━ System ━━━"
echo "Memory: $(free -m | awk '/^Mem:/ {printf "%.1f%%", $3/$2*100}')"
echo "Swap: $(free -m | awk '/^Swap:/ {printf "%.1f%%", $3/$2*100}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $5}')"
echo "Uptime: $(uptime -p)"
echo ""
