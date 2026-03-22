// ─── Project Templates ───────────────────────────────────────────────────────

export const projectOverview = (projectName: string): string => `\
# ${projectName}

## Purpose
[What this project does and why it exists]

## Current State
[Where things stand right now — what works, what's in progress]

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

export const projectArchitecture = (): string => `\
# Architecture

## System Overview
[High-level description of how the system works]

## Key Components
| Component | Responsibility |
|-----------|---------------|
| [Name]    | [What it does] |

## Data Flow
[Describe how data moves through the system]

## External Dependencies
- [Service / API] — [why it's used]

## Design Patterns
[Notable patterns used in this codebase]

## Known Constraints
[Performance limits, third-party restrictions, technical debt]
`;

// ─── Context Templates ────────────────────────────────────────────────────────

export const contextDecisions = (): string => `\
# Decisions

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

// ─── Tools Templates ──────────────────────────────────────────────────────────

export const globalTools = (projectName: string): string => `\
# Global Tools — ${projectName}

## Environment Setup
\`\`\`bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
\`\`\`

## Common Commands
\`\`\`bash
# Development
npm run dev

# Tests
npm test

# Build
npm run build
\`\`\`

## Database
\`\`\`bash
# [Migration command]
# [Seed command]
\`\`\`

## Notes
[Anything an agent needs to know to operate this project]
`;

// ─── Task Templates ───────────────────────────────────────────────────────────

export const taskInstructions = (id: string, title: string): string => `\
# ${id}: ${title}

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
[Anything important that doesn't fit above]
`;

export const taskContext = (id: string): string => `\
# Context: ${id}

## Background
[Why this task exists and what problem it solves]

## Relevant Files
- \`path/to/file.ts\` — [what it does]

## Dependencies
[Tasks, services, or systems this task depends on]

## Constraints
[Technical or business constraints to be aware of]
`;

export const taskTools = (id: string): string => `\
# Tools: ${id}

## Commands
\`\`\`bash
# [command]
\`\`\`

## Notes
[Tool-specific notes for this task only]
`;

export const taskOutput = (id: string): string => `\
# Output: ${id}

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

// ─── Active Tasks Template ────────────────────────────────────────────────────

export const activeTasks = (): string => `\
# Active Tasks

The master task tracker. Update this file whenever a task is created, started, completed, or blocked.
Any agent entering this project should read this file first.

| ID | Title | Status | Affected Files |
|----|-------|--------|----------------|

---

**Status values:** \`planned\` | \`in-progress\` | \`done\` | \`blocked\`
`;

export const activeTasksRow = (id: string, title: string): string =>
  `| ${id} | ${title} | planned | |`;

// ─── Workflow Templates ───────────────────────────────────────────────────────

export const workflowOverview = (id: string, title: string): string => `\
# Workflow: ${title}
*${id}*

## Goal
[What this workflow achieves when complete]

## Tasks
- [ ] [TASK-NNN — task title]

## Completion Criteria
[How we know this workflow is done]

## Notes
[Any coordination notes, sequencing constraints, or dependencies]
`;
