#!/bin/bash
# Kratos Crypto Data Fetcher
# Usage: ./crypto-fetch.sh [command] [args]

case "$1" in
  "price")
    # Get price for a token
    TOKEN="${2:-bitcoin}"
    curl -s "https://api.coingecko.com/api/v3/simple/price?ids=$TOKEN&vs_currencies=usd&include_24hr_change=true" | jq .
    ;;
  
  "top")
    # Top 20 by market cap
    curl -s "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20" | jq -r '.[] | "\(.market_cap_rank). \(.name) (\(.symbol | ascii_upcase)): $\(.current_price) (\(.price_change_percentage_24h)%)"'
    ;;
  
  "trending")
    # Trending tokens
    curl -s "https://api.coingecko.com/api/v3/search/trending" | jq -r '.coins[:5] | .[] | "\(.item.name) (\(.item.symbol)): Rank \(.item.market_cap_rank // "N/A")"'
    ;;
  
  "defi")
    # Top DeFi protocols by TVL
    curl -s "https://api.llama.fi/protocols" | jq -r '.[:10] | .[] | "\(.name): TVL $\(.tvl/1000000 | floor)M | Chain: \(.chain)"'
    ;;
  
  "yields")
    # Top yielding pools
    curl -s "https://yields.llama.fi/pools" | jq -r '.data[:10] | .[] | "\(.project) - \(.symbol): \(.apy | floor)% APY | TVL: $\(.tvlUsd/1000000 | floor)M"'
    ;;
  
  "gas")
    # Ethereum gas prices
    curl -s "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken" | jq '.result'
    ;;
  
  "fear")
    # Fear & Greed Index
    curl -s "https://api.alternative.me/fng/" | jq -r '.data[0] | "Fear & Greed: \(.value) (\(.value_classification))"'
    ;;
  
  "dex")
    # DEX pairs for a token
    ADDRESS="${2:-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2}"
    curl -s "https://api.dexscreener.com/latest/dex/tokens/$ADDRESS" | jq '.pairs[:3]'
    ;;
  
  *)
    echo "Kratos Crypto Fetcher"
    echo ""
    echo "Commands:"
    echo "  price [token]  - Get price (default: bitcoin)"
    echo "  top            - Top 20 by market cap"
    echo "  trending       - Trending tokens"
    echo "  defi           - Top DeFi protocols"
    echo "  yields         - Top yielding pools"
    echo "  gas            - Ethereum gas prices (needs API key)"
    echo "  fear           - Fear & Greed Index"
    echo "  dex [address]  - DEX pairs for token"
    ;;
esac
