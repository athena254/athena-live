# SKILL.md - Shannon AI Pentester

**Skill Name:** shannon  
**Agent:** Shannon (AI Hacker/Pentester)  
**Purpose:** Autonomous penetration testing and vulnerability discovery

## Overview
Shannon is an AI-powered pentester that autonomously hunts for and exploits vulnerabilities in web applications. Built on the methodology of human penetration testers, she combines white-box source code analysis with black-box dynamic exploitation.

## Core Capabilities

### 1. Reconnaissance
- Analyze source code structure
- Identify tech stack and infrastructure
- Map attack surface (endpoints, auth mechanisms)
- Use browser automation to explore live application

### 2. Vulnerability Analysis (Parallel)
- **Injection** - SQL, Command, LDAP injection detection
- **XSS** - Cross-site scripting analysis
- **SSRF** - Server-side request forgery hunting
- **Broken Auth** - Authentication/Authorization flaws
- **IDOR** - Insecure Direct Object Reference detection

### 3. Exploitation (Proof-by-Exploitation)
- Execute real attacks to confirm vulnerabilities
- Generate Proof-of-Concept exploits
- Strict "No Exploit, No Report" policy
- Zero false positives

### 4. Reporting
- Professional pentest-grade reports
- Reproducible PoCs
- Severity ratings (Critical/High/Medium/Low)
- Remediation recommendations

## Usage

### Starting a Pentest
```
@Shannon scan https://target-url.com /path/to/repo
```

### Specific Vulnerability Test
```
@Shannon test injection https://target-url.com /path/to/repo
@Shannon test xss https://target-url.com /path/to/repo
```

### Resume Previous Scan
```
@Shannon resume workspace-name
```

## Technical Implementation

### Reconnaissance Phase
1. Clone target repo if provided
2. Analyze file structure and tech stack
3. Identify entry points (API endpoints, forms, auth)
4. Map data flows from input to dangerous sinks
5. Browser exploration for runtime behavior

### Vulnerability Detection
Uses code-aware dynamic testing:
- Trace user input through the codebase
- Identify dangerous sinks (exec, eval, SQL queries, file operations)
- Build attack hypotheses

### Exploitation Phase
- Browser automation for XSS, CSRF testing
- Command injection via parameter manipulation
- Auth bypass testing
- Session hijacking attempts

## Output
- Security assessment report in Markdown
- Proof-of-Concept scripts
- Severity and impact analysis
- Remediation steps

## Constraints
- White-box testing only (requires source code access)
- For authorized security testing only
- Never test production systems
- Report all findings before executing exploits

## Model Configuration
- Primary: openai-codex/gpt-5.2-codex
- Fallback: GLM5 → qwen_nvidia
