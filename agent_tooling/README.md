# Standby Agent Infrastructure

## MetaGPT / LibreChat
- Repo: `MetaGPT`
- Purpose: product-company orchestration. Pre-configured plans for PM, architect, engineer workflows.
- Ready to run once gateway allows multi-agent sessions (requires GPT-4-turbo/Claude).

## Devika
- Repo: `devika`
- Purpose: autonomous coding pair, broken down multi-language planning.
- Needs Claude 3.

## SWE-agent
- Repo: `SWE-agent`
- Purpose: fix GitHub issues, patch vulnerabilities.
- Configure `config.yaml` with repo + API keys when launching.

## GPT-Researcher
- Repo: `gpt-researcher`
- Purpose: multi-source research with Tavily; use the Tavily API key you provided (`~/.config/tavily/credentials.json`).

## Perplexica & browser-use
- `Perplexica` & `perplexica-agent`: private search + Playwright browsing.
- `browser-use`: browser automation tool. Use with LangChain loops.

## OpenManus / BabyAGI / AgentGPT
- `OpenManus`: local Manus-like virtual worker (Claude/Qwen). Prebake startup script for Ubuntu environment.
- `babyagi`: task planning framework for testing loops.
- `AgentGPT`: reference browser agent for quick demos.

## RepoAgent
- Repo: `RepoAgent`
- Purpose: repo introspection + doc generation. Will run against Athena workspace once gateway/spawned agent is ready.

## Deployment
- All repos cloned into workspace and documented for immediate launch.
- Athena can spawn these agents with the proper model once the gateway is paired (keeping existing keys).