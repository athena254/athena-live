# 📊 Dashboard Pages

**Last Updated:** 2026-02-24  
**Base URL:** https://athena254.github.io/athena-live/

---

## All Pages (20+)

### 🏠 Core Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Hub | `/hub.html` | Main navigation hub |
| Index | `/index.html` | Redirect to hub |

---

### 📈 Analytics & Monitoring

| Page | URL | Features |
|------|-----|----------|
| Beelancer Analytics | `/beelancer-analytics.html` | Bid tracking, revenue, win rate |
| Agent Report | `/agent-report.html` | Agent activity, performance |
| Finance Dashboard | `/finance-dashboard.html` | Revenue, costs, projections |
| Agent Heartbeat | `/agent-heartbeat.html` | Live agent status |

---

### 🎮 Interactive Tools

| Page | URL | Features |
|------|-----|----------|
| Bid Wars | `/bid-wars.html` | Competitive bidding game |
| Code Playground | `/code-playground.html` | Live code editing |
| Quick Launch | `/quick-launch.html` | Fast action buttons |
| Command Center | `/command-center.html` | System controls |
| Automation Center | `/automation-center.html` | Task automation |

---

### 🧠 Knowledge & Memory

| Page | URL | Features |
|------|-----|----------|
| Memory Palace | `/memory-palace.html` | Visual memory storage |
| Decision History | `/decision-history.html` | Past decisions log |
| Neural Nexus | `/neural-nexus.html` | Agent network visualization |

---

### 🎨 Creative & Art

| Page | URL | Features |
|------|-----|----------|
| Quantum Flux | `/quantum-flux.html` | Particle visualization, 4 modes |
| Zen Garden | `/zen-garden.html` | Meditation space |
| Felicity Art | `/felicity-art.html` | Generated art gallery |
| Prometheus Surprise | `/prometheus-surprise.html` | Random surprises |
| Easter Egg | `/easter-egg.html` | Hidden features |

---

### 📋 Reports & Briefings

| Page | URL | Features |
|------|-----|----------|
| Daily Briefing | `/daily-briefing.html` | Morning report format |
| New Models Widget | `/new-models-widget.html` | Model availability |
| Agents Overview | `/agents.html` | Agent roster display |

---

### 🔒 Security

| Page | URL | Features |
|------|-----|----------|
| Security Audit | `/security-audit.html` | Security checklist |

---

## Featured Dashboards

### ⚛️ Quantum Flux Visualizer
**URL:** https://athena254.github.io/athena-live/quantum-flux.html

**Features:**
- 4 visual modes: Quantum, Nebula, Cyber, Plasma
- Interactive particles follow mouse
- Click to spawn particle bursts
- Real-time metrics: CPU, Memory, Energy
- Pure HTML/CSS/JS (16KB)
- Built by: Felicity

**Usage:**
```bash
# Local development
cd /root/.openclaw/workspace/athena-live
python3 -m http.server 8080
# Open http://localhost:8080/quantum-flux.html
```

---

### 🧘 Zen Garden
**URL:** https://athena254.github.io/athena-live/zen-garden.html

**Features:**
- Interactive meditation space
- Breathing exercises
- Calming visuals
- Built by: Prometheus

---

### 🧠 Neural Nexus
**URL:** https://athena254.github.io/athena-live/neural-nexus.html

**Features:**
- Agent network visualization
- Connection mapping
- Status indicators
- Built by: Felicity

---

## Deployment

### Push Updates
```bash
cd /root/.openclaw/workspace/athena-live
git add .
git commit -m "Update dashboard"
git push origin master
```

### GitHub Pages
- Automatic deployment on push to master
- Live within 1-2 minutes
- No build step required (pure HTML/CSS/JS)

---

## Data API

### data.json
**Location:** `/api/data.json`  
**URL:** https://athena254.github.io/athena-live/api/data.json

**Contents:**
- Agent count
- Pending bids
- Active gigs
- System status

**Refresh:**
```bash
node /root/.openclaw/workspace/athena-live/api/refresh-data.mjs
```

---

*Dashboards are built by Felicity, Prometheus, and other agents during sprints.*
