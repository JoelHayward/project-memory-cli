// ─── Templates ───────────────────────────────────────────────────────────────
//
// One function per generated file. All templates return plain strings.
// Template keys must match the `template` field in rules.ts BASE_LAYER
// and DYNAMIC_RULES.

// ── Utility ──────────────────────────────────────────────────────────────────

export const gitkeep = (): string => '';

// ── AI.md (repo root) ─────────────────────────────────────────────────────────

export const aiMd = (): string =>
`# AI Project Entry

This project uses the project-memory framework.

Start here:
- project-memory/README.md
- project-memory/project/overview.md
- project-memory/tasks/active.md
`;

// ── project-memory/README.md ──────────────────────────────────────────────────

export const frameworkReadme = (projectName: string): string =>
`# Project Memory

This directory contains the structured project intelligence layer.
It allows any AI tool to understand and continue this project.
All context, tasks, and workflows are defined here.

**Project:** ${projectName}
**Framework:** project-memory v1.0.0

---

## Recommended Read Order

### Cold Start
*Agent enters project with no prior context.*

1. \`project/overview.md\` — what this project is and its primary goal
2. \`context/current-state.md\` — where things stand right now (if present)
3. \`tasks/active.md\` — what is being worked on

### Assigned Task
*Agent has been directed to a specific task.*

1. \`tasks/TASK-XXX/instructions.md\` — what to do
2. \`tasks/TASK-XXX/context.md\` — background and relevant files
3. \`tasks/TASK-XXX/tools.md\` — tooling notes (if present)

---

## Structure

| Folder       | Purpose                                                  |
|--------------|----------------------------------------------------------|
| \`project/\`   | Stable project definition: overview, architecture        |
| \`context/\`   | Dynamic operational state: decisions, current state      |
| \`tasks/\`     | Active work, task folders, completed log                 |
| \`workflows/\` | Named sequences of tasks                                 |
| \`tools/\`     | Environment setup and global commands                    |
| \`data/\`      | Shared data assets                                       |

---

## Global Context Files

- \`project/overview.md\` — project identity and goal
- \`project/architecture.md\` — system design and tech stack
- \`context/decisions.md\` — key decisions and rationale
- \`context/current-state.md\` — current operational state
- \`tools/global-tools.md\` — environment and commands
`;

// ── project/overview.md ───────────────────────────────────────────────────────

export const projectOverview = (projectName: string): string =>
`# ${projectName}

## Purpose
[What this project does and why it exists]

## Current State
[Where things stand right now — what works, what is in progress]

## Primary Goal
[The main thing we are trying to achieve]

## Tech Stack
- [Language / Runtime]
- [Framework]
- [Database]
- [Key services]

## Repository Structure
\`\`\`
/src        — [description]
/tests      — [description]
\`\`\`

---
*Keep this file concise. It is the first thing any agent reads when entering this project.*
`;

// ── project/architecture.md ───────────────────────────────────────────────────

export const projectArchitecture = (): string =>
`# Architecture

## System Overview
[High-level description of how the system works]

## Key Components

| Component | Responsibility |
|-----------|----------------|
| [Name]    | [What it does] |

## Data Flow
[Describe how data moves through the system]

## External Dependencies
- [Service / API] — [why it is used]

## Design Patterns
[Notable patterns used in this codebase]

## Known Constraints
[Performance limits, third-party restrictions, technical debt]
`;

// ── project/brief.md ─────────────────────────────────────────────────────────

export const projectBrief = (): string =>
`# Project Brief

## What
[What are we building? One clear paragraph.]

## Why
[Why does this need to exist? What problem does it solve?]

## Who
[Who is this for? Who are the primary users or stakeholders?]

## Success Criteria
[How do we know this is done and working?]

## Out of Scope
[What are we explicitly not building in this phase?]
`;

// ── project/plan.md ───────────────────────────────────────────────────────────

export const projectPlan = (): string =>
`# Plan

## Phases

### Phase 1 — [Name]
**Goal:** [What this phase achieves]
**Tasks:** [List key tasks or link to TASK-NNN]
**Done when:** [Completion criteria]

### Phase 2 — [Name]
**Goal:** [What this phase achieves]
**Tasks:** [List key tasks or link to TASK-NNN]
**Done when:** [Completion criteria]

## Timeline
[Rough dates or milestones if known]

## Open Questions
[Decisions still to be made that affect the plan]
`;

// ── context/decisions.md ─────────────────────────────────────────────────────

export const contextDecisions = (): string =>
`# Decisions

A running log of key architectural and product decisions.
New entries go at the top.

---

## [Date] — [Decision Title]

**Decision:** [What was decided]

**Rationale:** [Why this choice was made]

**Alternatives rejected:** [What else was considered and why it was not chosen]

**Status:** active

---
`;

// ── context/current-state.md ─────────────────────────────────────────────────

export const contextCurrentState = (): string =>
`# Current State

*Last updated: [date]*

## What is working
[What is stable and functional right now]

## What is in progress
[What is actively being worked on — link to active tasks]

## What is blocked
[What cannot proceed and why]

## Immediate next priority
[The single most important thing to do next]

---
*Keep this file to one page. Update it whenever the project state changes significantly.*
`;

// ── context/constraints.md ───────────────────────────────────────────────────

export const contextConstraints = (): string =>
`# Constraints

## Technical Constraints
- [Constraint] — [reason]

## Business Constraints
- [Constraint] — [reason]

## Performance Requirements
- [Requirement] — [target metric]

## Security Requirements
- [Requirement]

## Notes
[Anything else that shapes how we build]
`;

// ── context/dependencies.md ──────────────────────────────────────────────────

export const contextDependencies = (): string =>
`# Dependencies

## External Services

| Service | Purpose | Owner / Docs |
|---------|---------|--------------|
| [Name]  | [What it does] | [link] |

## Infrastructure

| Component | Purpose | Notes |
|-----------|---------|-------|
| [Name]    | [What it does] | |

## Third-Party Integrations
- [Service] — [how it is used]

## Notes
[Anything important about managing or updating these dependencies]
`;

// ── tasks/active.md ──────────────────────────────────────────────────────────

export const tasksActive = (): string =>
`# Active Tasks

The master task tracker. Update this file whenever a task is created, started, completed, or blocked.
Any agent entering this project should read this file early.

| ID | Title | Status | Affected Files |
|----|-------|--------|----------------|

---

**Status values:** \`planned\` \| \`in-progress\` \| \`done\` \| \`blocked\`
`;

// ── tasks/completed.md ───────────────────────────────────────────────────────

export const tasksCompleted = (): string =>
`# Completed Tasks

A log of all tasks that have reached \`done\` status.
Rows are moved here from \`active.md\` on completion.

| ID | Title | Completed | Notes |
|----|-------|-----------|-------|

`;

// ── tools/global-tools.md ────────────────────────────────────────────────────

export const globalTools = (projectName: string): string =>
`# Global Tools — ${projectName}

## Environment Setup
\`\`\`bash
# Install dependencies
# [command]

# Copy environment config
# cp .env.example .env
\`\`\`

## Common Commands
\`\`\`bash
# Development
# [dev command]

# Tests
# [test command]

# Build
# [build command]
\`\`\`

## Database
\`\`\`bash
# [Migration command]
# [Seed command]
\`\`\`

## Notes
[Anything an agent needs to know to operate this project at the system level]
`;

// ── tasks/TASK-NNN/instructions.md ───────────────────────────────────────────

export const taskInstructions = (id: string, title: string): string =>
`# ${id}: ${title}

## Objective
[One sentence: what must be done]

## Steps
1. [Step one]
2. [Step two]
3. [Step three]

## Acceptance Criteria
- [ ] [Criterion one]
- [ ] [Criterion two]

## Notes
[Anything important that does not fit above]
`;

// ── tasks/TASK-NNN/context.md ─────────────────────────────────────────────────

export const taskContext = (id: string): string =>
`# Context: ${id}

## Background
[Why this task exists and what problem it solves]

## Relevant Files
- \`path/to/file.ts\` — [what it does]

## Dependencies
[Tasks, services, or systems this task depends on]

## Constraints
[Technical or business constraints to be aware of]
`;

// ── tasks/TASK-NNN/output.md ──────────────────────────────────────────────────

export const taskOutput = (id: string): string =>
`# Output: ${id}

*Fill this in when the task is complete.*

## Summary
[What was done in 2–3 sentences]

## Changes Made
- \`path/to/file.ts\` — [what changed and why]

## Outcomes
[Did it meet the acceptance criteria? Any issues encountered?]

## Follow-up
[New tasks created or recommended as a result of this work]
`;

// ── tasks/TASK-NNN/tools.md ───────────────────────────────────────────────────

export const taskTools = (id: string): string =>
`# Tools: ${id}

## Commands
\`\`\`bash
# [command]
\`\`\`

## Notes
[Tool-specific notes for this task only]
`;

// ── workflows/WORKFLOW-NNN/overview.md ───────────────────────────────────────

export const workflowOverview = (id: string, title: string): string =>
`# Workflow: ${title}
*${id}*

## Goal
[What this workflow achieves when complete]

## Tasks
- [ ] [TASK-NNN — task title]

## Completion Criteria
[How we know this workflow is done]

## Notes
[Coordination notes, sequencing constraints, or dependencies]
`;

// ── Template map ─────────────────────────────────────────────────────────────
// Allows planner and init to look up templates by key.

export type TemplateKey =
  | 'gitkeep'
  | 'aiMd'
  | 'frameworkReadme'
  | 'projectOverview'
  | 'projectArchitecture'
  | 'projectBrief'
  | 'projectPlan'
  | 'contextDecisions'
  | 'contextCurrentState'
  | 'contextConstraints'
  | 'contextDependencies'
  | 'tasksActive'
  | 'tasksCompleted'
  | 'globalTools';

export function renderTemplate(key: TemplateKey, context: { name?: string } = {}): string {
  const name = context.name ?? 'My Project';
  switch (key) {
    case 'gitkeep':           return gitkeep();
    case 'aiMd':              return aiMd();
    case 'frameworkReadme':   return frameworkReadme(name);
    case 'projectOverview':   return projectOverview(name);
    case 'projectArchitecture': return projectArchitecture();
    case 'projectBrief':      return projectBrief();
    case 'projectPlan':       return projectPlan();
    case 'contextDecisions':  return contextDecisions();
    case 'contextCurrentState': return contextCurrentState();
    case 'contextConstraints': return contextConstraints();
    case 'contextDependencies': return contextDependencies();
    case 'tasksActive':       return tasksActive();
    case 'tasksCompleted':    return tasksCompleted();
    case 'globalTools':       return globalTools(name);
    default:                  return '';
  }
}
