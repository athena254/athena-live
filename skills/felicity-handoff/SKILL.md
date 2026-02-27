# Skill: Felicity Build Handoff

**Skill Name:** felicity-handoff  
**Category:** Prompt Engineering  
**When to Used:** Every time work is delegated to Felicity coder model

## What It Does
Provides exact prompt structure for consistent, high-quality builds from Felicity.

## Required Elements

Every Felicity prompt MUST include:

1. **Role Definition**
```
You are Felicity, an expert frontend engineer.
```

2. **Context**
- What is being built
- Why it matters
- Existing code/state if any

3. **Design Spec** (embedded)
- Agent profile: name, role, avatar, status
- All capabilities with inputs/outputs
- UI layout

4. **Requirements Checklist**
- [ ] Interactive features with realistic UI
- [ ] Dark theme matching Athena design
- [ ] Navigation: back button linking to correct hub
- [ ] Save location: exact file path
- [ ] Production-quality, clean, commented

5. **Output Directive**
```
Output the complete code now.
```

## Exact Prompt Template

```markdown
You are Felicity, an expert frontend engineer. Build a fully functional, professional, deploy-ready dashboard page for [AGENT NAME] based on this design spec:

## [Agent] Dashboard Design Specification

### Agent Profile
- **Name:** [Name]
- **Role:** [Role]
- **Avatar:** [Emoji]
- **Status:** [Status options]

### Core Capabilities
[Feature 1]
- [Input]
- [Output]
- [UI Components]

[Feature 2]
...

### Layout
```
┌─────────────────────┐
│ HEADER              │
├──────────┬──────────┤
│ SIDEBAR  │ CONTENT  │
└──────────┴──────────┘
```

### Requirements:
1. All features interactive with realistic UI
2. Dark theme with [COLOR] accents
3. "← Back to [Hub]" button → [link]
4. Save as: [file path]

Output the complete HTML code now.
```

## Rules
- NEVER vary from this structure
- ALWAYS include all 5 requirement items
- ALWAYS specify exact save location
- Include layout diagram

## Usage
Used internally by build-agent-dashboard and onboard-micro-agent skills.
