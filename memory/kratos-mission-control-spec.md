# 🪙 Kratos Mission Control Spec

**Agent:** Kratos - Cryptocurrency & DeFi Intelligence  
**Model:** GLM-5 Key #1 (fallback: qwen_nvidia)  
**Voice:** Ryan (British male, analytical)  
**Role:** Crypto analysis, DeFi research, on-chain intelligence, trading signals  
**Protocol:** Analysis only - NO trade execution

---

## 🎯 Overview

Real-time crypto intelligence dashboard for monitoring DeFi protocols, tracking whale movements, analyzing tokens, and generating trading signals across multiple chains.

---

## 📊 Main Dashboard View

### Hero Metrics (Top Bar)
- **Total Portfolio Value:** $XXX,XXX
- **24h Change:** +X.XX%
- **Active Alerts:** X
- **Risk Score:** XX/100

### Real-Time Price Feeds
- BTC: $XX,XXX (+X.XX%)
- ETH: $X,XXX (+X.XX%)
- SOL: $XXX (+X.XX%)
- BNB: $XXX (+X.XX%)

---

## 🖥️ Top Panels

### 1. **DeFi Yields Panel**
- **Source:** DefiLlama API
- **Refresh:** Every 5 minutes
- **Display:** Top 15 pools by APY
- **Columns:** Protocol, Pool, APY, TVL, Chain, Risk Level
- **Click Action:** Opens detailed pool analysis

### 2. **Whale Watch Panel**
- **Source:** Etherscan, Solscan, BscScan
- **Refresh:** Every 2 minutes
- **Display:** Last 20 large transactions (>$100K)
- **Columns:** Token, Amount, From → To, Time, Chain
- **Click Action:** Opens wallet tracker

### 3. **Token Scanner Panel**
- **Source:** DexScreener, CoinGecko
- **Refresh:** Every 3 minutes
- **Display:** Trending tokens (24h volume)
- **Columns:** Token, Price, 24h Vol, Liquidity, Risk Score
- **Click Action:** Opens full token analysis

### 4. **Cross-Chain Arbitrage Panel**
- **Source:** DexScreener, 1inch
- **Refresh:** Every 1 minute
- **Display:** Price differences across DEXs
- **Columns:** Token, Buy DEX, Sell DEX, Spread %, Est. Profit
- **Click Action:** Opens arbitrage calculator

---

## 🔘 Action Buttons

### Primary Actions

| Button | Action | API | Output |
|--------|--------|-----|--------|
| **🔍 Scan Token** | Analyze contract for risks | Etherscan, TokenSniffer | Risk score (0-100), honeypot check, holder distribution |
| **💰 Check DeFi Yields** | Fetch top yield pools | DefiLlama | Top 20 pools sorted by APY |
| **🐋 Track Whale** | Monitor specific address | Etherscan/Solscan | Transaction history, holdings, labels |
| **📊 Analyze Protocol** | Deep dive into DeFi protocol | DefiLlama, DeFi Safety | TVL, audits, risks, smart contracts |
| **🚨 Set Alert** | Create price/alert trigger | Internal | Alert saved, will notify on trigger |
| **⚡ Find Arbitrage** | Scan for cross-chain opportunities | DexScreener, 1inch | Profitable arbitrage paths |

### Secondary Actions

| Button | Action | API | Output |
|--------|--------|-----|--------|
| **📈 Trading Signal** | Generate technical analysis | CoinGecko, TradingView patterns | Entry, exit, stop-loss, confidence |
| **🔍 Memecoin Check** | Honeypot + rug pull analysis | TokenSniffer, GoPlus | Security audit, liquidity lock status |
| **🧮 Risk Calculator** | Calculate position risk | Internal | Position size, R:R ratio, liquidation price |
| **📰 Crypto News** | Latest crypto news | CryptoPanic API | Top 20 headlines, sentiment analysis |

---

## 📉 Data Panels (Detailed View)

### Token Analysis Panel
```
Token: XXX
Contract: 0x...
Chain: Ethereum
Price: $X.XX
Market Cap: $XXXM
24h Volume: $XXXM
Liquidity: $XXXM
Holders: X,XXX

Risk Score: 75/100 (Watch)
- Honeypot: ✅ No
- Mintable: ⚠️ Yes
- Renounced: ❌ No
- Top 10 Holders: XX%

Recommendation: CAUTION - High centralization
```

### DeFi Protocol Panel
```
Protocol: Aave V3
Chain: Multi-chain
TVL: $X.XXB
24h Change: +X.XX%
Users: XXXK

Risk Factors:
- Smart Contract: Low (audited by OpenZeppelin)
- Oracle Risk: Low (Chainlink)
- Governance Risk: Medium (multisig)

APYs:
- USDC Supply: 4.2%
- ETH Borrow: 1.8%
```

### Whale Tracker Panel
```
Address: 0x... (labeled: "Binance Hot Wallet")
Balance: $XXXM
Last 24h Activity:
- Received: X ETH from 0x...
- Sent: X ETH to 0x...
- Swapped: X ETH → X USDC

Labels: Exchange, High Activity
```

---

## 🚨 Alert System

### Alert Types
1. **Price Alerts** - Token hits target price
2. **Whale Alerts** - Large transaction detected
3. **Yield Alerts** - APY drops/spikes significantly
4. **Risk Alerts** - Token risk score changes
5. **Arbitrage Alerts** - Profitable opportunity found

### Priority Levels
- 🔴 **Critical** - Immediate action needed (large whale movement, security threat)
- 🟠 **High** - Important opportunity or risk
- 🟡 **Medium** - Worth noting, no urgency
- 🟢 **Low** - Informational only

### Notification Preferences
- Telegram: Critical + High
- WhatsApp: Critical only
- Dashboard: All alerts
- Sound: Critical only

---

## 🧰 Analysis Tools

### 1. Token Analyzer
**Input:** Contract address or token symbol  
**Process:**
1. Fetch contract data (Etherscan/Solscan)
2. Check honeypot status (TokenSniffer)
3. Analyze holder distribution
4. Check liquidity locks
5. Calculate risk score

**Output:** Detailed report with risk score and recommendation

### 2. DeFi Protocol Scanner
**Input:** Protocol name or contract  
**Process:**
1. Fetch TVL from DefiLlama
2. Check audit status
3. Analyze smart contract risk
4. Review governance structure
5. Check oracle dependencies

**Output:** Protocol safety report with risk factors

### 3. Whale Tracker
**Input:** Wallet address  
**Process:**
1. Fetch transaction history
2. Identify patterns
3. Label wallet type
4. Track holdings
5. Monitor real-time

**Output:** Wallet profile + real-time monitoring

### 4. Risk Assessment Calculator
**Input:** Token or protocol  
**Process:**
1. Smart contract analysis
2. Liquidity depth check
3. Holder concentration
4. Audit verification
5. Historical volatility

**Output:** Risk score (0-100) with breakdown

---

## 🎨 UI Design

### Color Scheme
- **Background:** Dark (#0F172A)
- **Primary:** Gold (#F59E0B)
- **Success:** Green (#10B981) - Safe zone
- **Warning:** Amber (#FBBF24) - Watch zone
- **Danger:** Red (#EF4444) - Avoid zone
- **Accent:** Purple (#8B5CF6) - Interactive elements

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  KRATOS MISSION CONTROL          [Portfolio] [Settings] │
├─────────────────────────────────────────────────────────┤
│  BTC $67,432  │  ETH $3,456  │  SOL $142  │  Alerts: 3  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ DEFI YIELDS ─────────┐  ┌─ WHALE WATCH ──────────┐  │
│  │ Protocol │ APY │ TVL ││  │ Token │ Amount │ Chain │  │
│  │ Aave     │ 5.2%│ $2B ││  │ ETH   │ $2.3M │ ETH   │  │
│  │ Lido     │ 4.1%│ $8B ││  │ SOL   │ $1.1M │ SOL   │  │
│  └────────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌─ ACTION BUTTONS ────────────────────────────────────┐ │
│  │ [🔍 Scan Token] [💰 Check Yields] [🐋 Track Whale] │ │
│  │ [📊 Analyze Protocol] [⚡ Find Arbitrage]           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ TOKEN SCANNER ────────┐  ┌─ ARBITRAGE ─────────────┐ │
│  │ Token │ Risk │ 24h Vol ││  │ Spread │ Profit │ Route │ │
│  │ PEPE  │ 65   │ $120M   ││  │ 2.3%   │ $500   │ UNI  │ │
│  │ WIF   │ 42   │ $85M    ││  │ 1.8%   │ $320   │ ORCA │ │
│  └────────────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints Needed

### External APIs
1. **CoinGecko** - Prices, market data
2. **DefiLlama** - TVL, yields, protocols
3. **DexScreener** - DEX prices, liquidity
4. **Etherscan** - Ethereum transactions, contracts
5. **Solscan** - Solana transactions, contracts
6. **BscScan** - BSC transactions
7. **TokenSniffer** - Honeypot detection
8. **GoPlus Security** - Contract security
9. **1inch** - DEX aggregator for arbitrage

### Internal APIs
- `/api/crypto/prices` - Real-time prices
- `/api/crypto/yields` - DeFi yields
- `/api/crypto/whales` - Whale transactions
- `/api/crypto/tokens` - Token analysis
- `/api/crypto/alerts` - User alerts
- `/api/crypto/arbitrage` - Arbitrage opportunities

---

## ⚡ Performance Requirements

- **Initial Load:** < 3 seconds
- **Refresh Rate:** 1-5 minutes per panel
- **Real-time Alerts:** WebSocket connection
- **Mobile Responsive:** Yes
- **Offline Mode:** Show last cached data

---

## 🔒 Security Considerations

- **No Private Keys** - Never store or display private keys
- **Read-Only** - All API calls are read-only, no trading
- **Rate Limiting** - Respect API rate limits
- **Data Validation** - Verify all external data
- **Risk Disclosure** - Always show: "Not financial advice"

---

## ✅ Success Metrics

- Token analysis completes in < 5 seconds
- Yield data refreshes every 5 minutes
- Whale alerts arrive within 30 seconds of transaction
- Risk scores accurate to ±10 points
- Zero unauthorized trading attempts (impossible by design)

---

## 🚀 Implementation Notes for Felicity

1. **Use existing shadcn/ui components** - Match athena-live style
2. **Create new route** - `/kratos` or `/mission-control/kratos`
3. **Mock data first** - Then integrate real APIs
4. **WebSocket for alerts** - Real-time notifications
5. **LocalStorage for alerts** - Persist user settings
6. **Error boundaries** - Graceful API failures
7. **Loading skeletons** - Better UX during data fetch

### Priority Order
1. Main dashboard with panels
2. Action buttons with mock responses
3. Token analyzer tool
4. Real API integration
5. Alert system
6. Mobile optimization

---

**Created by:** Kratos (via Athena)  
**Date:** 2026-02-25  
**Status:** Ready for Felicity to build 🎨
