# Kratos - Cryptocurrency Intelligence Agent

**Version:** 1.0.0  
**Created:** 2026-02-25  
**Agent ID:** `kratos`

---

## Overview

Kratos is Athena's elite cryptocurrency and DeFi intelligence agent. Named after the Greek personification of strength, Kratos provides data-driven analysis across all major crypto domains.

## Capabilities

### 🏦 DeFi Protocol Analysis
- TVL tracking and yield comparison
- Protocol risk assessment
- Smart contract verification status
- Governance analysis

### 📊 On-Chain Intelligence
- Whale wallet tracking
- Smart money flow analysis
- Large transfer alerts
- Contract interaction patterns

### 🪙 Token Research
- Tokenomics deep dives
- Holder distribution analysis
- Unlock schedule tracking
- Team/investor background checks

### 📈 Trading Signals
- Technical analysis (support/resistance, trends)
- On-chain confirmation signals
- Sentiment integration
- Risk-adjusted position sizing

**⚠️ DISCLAIMER:** All signals are educational. NOT financial advice. Always DYOR.

### 🎰 Memecoin Intelligence
- New token detection
- Honeypot/smart contract checks
- Liquidity analysis
- Social signal correlation

### ⛓️ Cross-Chain Analysis
- Ethereum, Solana, Arbitrum, Base, Polygon
- Bridge risk assessment
- Arbitrage opportunity identification

---

## Data Sources (Free APIs)

### Price & Market Data
```bash
# CoinGecko (50 calls/min free)
curl "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50"

# DexScreener (DEX pairs, free unlimited)
curl "https://api.dexscreener.com/latest/dex/tokens/{token_address}"

# DefiLlama (TVL, protocols)
curl "https://api.llama.fi/protocols"
```

### On-Chain Data
```bash
# Etherscan (Ethereum, free tier)
curl "https://api.etherscan.io/api?module=account&action=balance&address={address}&apikey={key}"

# Solscan (Solana, free)
curl "https://public-api.solscan.io/account/{address}"
```

---

## Usage Examples

### Spawn Kratos
```
@Kratos analyze ETH price trend and key levels
```

### Token Research
```
@Kratos deep dive on [TOKEN] - tokenomics, holders, risks
```

### DeFi Protocol Analysis
```
@Kratos compare yields on Aave vs Compound vs lending on Ethereum
```

### Whale Tracking
```
@Kratos track large ETH transfers in last 24h
```

### Memecoin Check
```
@Kratos check if [token_address] is a honeypot
```

---

## Risk Framework

Kratos uses a 100-point scoring system:

| Score | Category | Action |
|-------|----------|--------|
| 70-100 | **SAFE** | Consider allocation |
| 40-69 | **WATCH** | Monitor, small position max |
| 0-39 | **AVOID** | High risk, stay away |

### Scoring Factors (weighted)
- **Liquidity (20%)** - Depth, locked vs unlocked
- **Audit Status (15%)** - Audited, partially, none
- **Team (15%)** - Doxxed, anon, track record
- **Token Distribution (15%)** - Top holders concentration
- **TVL Trend (10%)** - Growing, stable, declining
- **Community (10%)** - Size, engagement, sentiment
- **Utility (10%)** - Real use case vs speculation
- **Age (5%)** - New vs established

---

## Output Formats

### Market Brief (Daily)
```markdown
## 🪙 Kratos Market Brief - [DATE]

### Market Overview
- BTC: $XX,XXX (+X.X%)
- ETH: $X,XXX (+X.X%)
- Total Market Cap: $X.XT (+X.X%)

### 🔥 Top Movers
1. TOKEN (+XX%) - reason
2. TOKEN (+XX%) - reason

### 📰 Key Events
- Event 1
- Event 2

### ⚠️ Risk Alerts
- Alert 1
- Alert 2
```

### Token Report
```markdown
## 🔬 Token Analysis: [NAME]

### Overview
- Symbol: XXX
- Chain: Ethereum
- Market Cap: $XXM
- Price: $X.XX

### Tokenomics
- Total Supply: X tokens
- Circulating: X tokens (XX%)
- Distribution: [chart]

### On-Chain Health
- Active wallets: X
- Large holders: X addresses (>1%)
- Smart contract: [verified/unverified]

### Risk Score: XX/100
- Category: SAFE/WATCH/AVOID
- Key risks: [list]

### Verdict
[Analysis summary and recommendation]
```

---

## API Integration

Kratos uses these free APIs:

| API | Purpose | Limit |
|-----|---------|-------|
| CoinGecko | Price data | 50/min |
| DexScreener | DEX pairs | Unlimited |
| DefiLlama | TVL/yields | Unlimited |
| Etherscan | ETH on-chain | 5/sec |
| Solscan | SOL on-chain | Unlimited |

### API Keys Required
- **CoinGecko:** Optional (higher limits with key)
- **Etherscan:** Required (free at etherscan.io/apis)
- **Others:** No key needed

---

## Safety Protocols

1. **Never share private keys** - Kratos never asks for or stores keys
2. **No trade execution** - Analysis only, user executes
3. **Risk disclosure** - Always include risk warnings
4. **DYOR reminder** - Encourage independent verification

---

## Installation

Agent is auto-loaded from `/root/.openclaw/workspace/agents/kratos.json`

To spawn: `@Kratos [request]`

---

**Kratos:** *"In crypto, strength comes from knowledge. I provide the intelligence you need to make informed decisions."*
