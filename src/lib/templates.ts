// ─── Templates ───────────────────────────────────────────────────────────────
//
// One function per generated file. All templates return plain strings.
// Template keys must match the `template` field in rules.ts BASE_LAYER
// and DYNAMIC_RULES.

// ── Utility ──────────────────────────────────────────────────────────────────

export const gitkeep = (): string => '';

// ── AI.md (repo root) ─────────────────────────────────────────────────────────

export const aiMd = (): string =>
`# AI Agent Instructions

This project uses **project-memory** — a local, Git-tracked memory layer for AI-assisted development.

## Before you work

1. Read \`project-memory/README.md\` (read order and update rules).
2. Read the files it points to for this task.
3. Do **not** rely only on code inference — use project-memory for decisions, state, and task context.

## After meaningful changes

Update the relevant project-memory files:

- \`project-memory/context/current-state.md\` — if project state changed
- \`project-memory/context/decisions.md\` — if a decision was made
- \`project-memory/tasks/active.md\` — if task status changed
- \`project-memory/tasks/TASK-NNN/output.md\` — when task work is done or partially done
- \`project-memory/project/architecture.md\` — if architecture changed
- \`project-memory/tools/global-tools.md\` — if commands or setup changed

Keep updates **concise** and **human-readable**. Write for the next agent session.
`;

// ── project-memory/README.md ──────────────────────────────────────────────────

export const frameworkReadme = (projectName: string): string =>
`# Project Memory — Agent Operating Guide

**Project:** ${projectName} · **Framework:** project-memory v1.0.0

This folder is the **operating guide** for AI agents and humans. Markdown here is the source of truth. Read before code changes. Update after meaningful work.

---

## Read order

### Cold start (no task assigned)

1. \`project/overview.md\` — what this project is
2. \`context/current-state.md\` — where things stand (if present)
3. \`tasks/active.md\` — current work
4. \`context/handoff.md\` — last session handoff (if present)

### Assigned task (TASK-XXX)

1. \`tasks/TASK-XXX/instructions.md\`
2. \`tasks/TASK-XXX/context.md\`
3. \`tasks/TASK-XXX/tools.md\` (if present)
4. Relevant source files listed in the task context

Do **not** rely only on code search. Use project-memory for state, decisions, and handoff.

---

## Update rules (after meaningful work)

Update **only** files affected by your changes:

| File | When |
|------|------|
| \`context/current-state.md\` | State, blockers, or priorities changed |
| \`context/decisions.md\` | A design or product decision was made |
| \`tasks/active.md\` | Task status changed |
| \`tasks/TASK-XXX/output.md\` | Task work done or partially done |
| \`project/architecture.md\` | System design changed |
| \`tools/global-tools.md\` | Commands or setup changed |

Also run \`project-memory handoff\` before ending a session when state shifted.

---

## Avoid noisy documentation churn

- Update facts, not essays. Prefer short bullets over long prose.
- Do not duplicate code in markdown — point to paths and summarize.
- Do not edit files you did not need for this task.
- One decision = one ADR entry in \`context/decisions.md\`.
- If nothing material changed, do not touch project-memory.

---

## Record decisions (ADR-style)

Add a new entry at the **top** of \`context/decisions.md\`:

- **Date**
- **Decision** — what was chosen
- **Rationale** — why
- **Alternatives** — what was rejected
- **Status** — \`active\`, \`superseded\`, or \`deprecated\`

Keep each entry to one screenful.

---

## Complete task output

When a task is done or you are handing off partial work:

1. Fill \`tasks/TASK-XXX/output.md\` (summary, files changed, tests run, results, follow-ups).
2. Update \`tasks/active.md\` status (\`planned\` → \`in-progress\` → \`done\` or \`blocked\`).
3. Refresh \`context/current-state.md\` if project state changed.
4. Add a decision entry if you made one.

---

## Leave handoff notes

Before ending a session:

\`\`\`bash
project-memory handoff
\`\`\`

This writes \`context/handoff.md\` (or use \`--stdout\` to paste into a new chat). Ensure \`current-state.md\` matches reality.

---

## Folder map

| Folder | Purpose |
|--------|---------|
| \`project/\` | Stable definition: overview, architecture |
| \`context/\` | Operational state, decisions, handoff |
| \`tasks/\` | Active work and task folders |
| \`workflows/\` | Multi-step sequences |
| \`tools/\` | Commands and environment setup |
| \`data/\` | Shared assets and generated indexes |
| \`snapshots/\` | Optional assembled context snapshots |
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

Concise ADR-style log. **New entries go at the top.** One decision per entry.

---

## [YYYY-MM-DD] — [Decision title]

**Decision:** [What was decided — one or two sentences]

**Rationale:** [Why this choice was made]

**Alternatives:** [What else was considered and why rejected]

**Status:** active

---
`;

// ── context/current-state.md ─────────────────────────────────────────────────

export const contextCurrentState = (): string =>
`# Current State

*Last updated: [YYYY-MM-DD]*

## What is working
[Stable, verified functionality — bullet list]

## What is in progress
[Active work — link to TASK-NNN folders or brief note]

## What is blocked
[Blockers and why — or "None"]

## Immediate next priority
[The single most important next step]

## Notes for next AI agent
[Short handoff: context the next session needs that is not obvious from code]

---
*Keep to one page. Update whenever project state changes. Set Last updated to today's date.*
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

Commands agents should use to install, verify, and run this project. Replace placeholders with real commands.

## Install
\`\`\`bash
[install command]
\`\`\`

## Build
\`\`\`bash
[build command]
\`\`\`

## Test
\`\`\`bash
[test command]
\`\`\`

## Lint
\`\`\`bash
[lint command]
\`\`\`

## Dev server
\`\`\`bash
[dev server command]
\`\`\`

## Environment notes
[Node/Python version, env files, ports, known setup issues — or "None documented yet"]

---
*Update when commands or setup change. Agents: verify commands still work before documenting.*
`;

// ── tasks/TASK-NNN/instructions.md ───────────────────────────────────────────

export const taskInstructions = (id: string, title: string): string =>
`# ${id}: ${title}

## Objective
[One sentence: what must be done and why]

## Acceptance criteria
- [ ] [Criterion one]
- [ ] [Criterion two]

## Constraints
[Technical, time, or scope limits — or "None beyond project defaults"]

## Relevant files
- \`path/to/file\` — [role in this task]

## Required verification
[Tests, manual checks, or commands that must pass — e.g. \`npm test\`]

## Agent update instructions
When done or handing off:
1. Fill \`tasks/${id}/output.md\`
2. Update \`tasks/active.md\` status for ${id}
3. Update \`context/current-state.md\` if state changed
4. Add \`context/decisions.md\` entry if a decision was made
`;

// ── tasks/TASK-NNN/context.md ─────────────────────────────────────────────────

export const taskContext = (id: string): string =>
`# Context: ${id}

## Background
[Why this task exists — 1–2 sentences]

## Relevant files
- \`path/to/file\` — [what it does / why it matters]

## Prior decisions
[Link or quote from \`context/decisions.md\` that applies — or "None"]

## Assumptions
[What you are assuming to be true for this task]

## Risks / open questions
[Unknowns, edge cases, or questions to resolve — or "None"]
`;

// ── tasks/TASK-NNN/output.md ──────────────────────────────────────────────────

export const taskOutput = (id: string): string =>
`# Output: ${id}

*Fill in when the task is complete or when handing off partial work.*

## Summary of work completed
[2–3 sentences: what was done and outcome]

## Files changed
- \`path/to/file\` — [brief change description]

## Commands / tests run
\`\`\`bash
[commands you ran, or "None"]
\`\`\`

## Results
[Pass/fail/partial — did acceptance criteria met? Any issues?]

## Follow-up tasks
[New TASK-NNN to create, or "None"]

## Handoff notes
[What the next agent needs to know to continue — or "Task complete, no handoff needed"]
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
