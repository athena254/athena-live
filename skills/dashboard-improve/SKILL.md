# Skill: Dashboard Improvement Pipeline

**Skill Name:** dashboard-improve  
**Category:** Dashboard Development  
**When to Use:** When existing dashboard needs enhancement, redesign, or quality upgrade

## What It Does
Reviews existing dashboard, identifies gaps, and rebuilds to production quality using Felicity.

## Inputs Required
- Target dashboard file path
- Current issues/requirements list

## Outputs
- Improved/updated dashboard HTML file
- Enhanced features list

## Steps
1. Read existing dashboard file completely
2. Identify gaps: layout, missing features, design quality, interactivity, responsiveness
3. Note any useful existing structure to preserve
4. Pass requirements to Felicity with full context
5. Save output to same path
6. Verify all features work

## Rules
- Preserve useful existing code structure
- Maintain design consistency with master dashboard
- Ensure responsive design
- Add professional polish

## Usage
```
@dashboard-improve /path/to/dashboard.html [requirements]
```
