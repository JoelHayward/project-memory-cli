# project-memory — File-Tree Spec v1

> The file system is the system. Structure defines execution. Agents are interchangeable executors.

---

## Philosophy

project-memory is not an agent framework. It is a file-tree standard.

It defines how a project's memory, work, and intent are stored so that any AI coding tool — Claude Code, Cursor, Codex, or tools that don't exist yet — can enter a project cold, understand the current state, and continue work without hand-holding.

The intelligence lives in the structure, not the agent.

---

## Core Principles

1. **Visible everything** — No hidden folders. No internal metadata layers. If it matters, it lives in plain sight.
2. **Human-readable first** — Every file must be readable and editable by a human without tooling.
3. **Git-friendly** — All files are plaintext. The structure diffs cleanly. Nothing binary in the framework layer.
4. **Agent-agnostic** — No Claude-specific syntax, no Cursor-specific config. Works with any tool, any model.
5. **Zero-config** — The structure IS the config. No `.env`, no `project.json` in v1.
6. **Minimal by default** — Only create what's needed. Empty folders with `.gitkeep` are fine.

---

## Full File-Tree (v1)

```
/your-project/
│
├── project/
│   ├── overview.md          # What this project is. One page. Written for an agent reading it cold.
│   └── architecture.md      # How the system is structured. Tech stack, key decisions, diagrams in ASCII.
│
├── context/
│   └── decisions.md         # Architectural decisions, constraints, and rationale. ADR-lite format.
│
├── workflows/
│   └── WORKFLOW-001/
│       └── overview.md      # Goal, ordered task list, completion criteria.
│
├── tasks/
│   ├── active.md            # Master task tracker. All tasks, statuses, affected files.
│   └── TASK-001/
│       ├── instructions.md  # What to do. Clear, self-contained, actionable.
│       ├── context.md       # What the agent needs to know before starting this task.
│       ├── tools.md         # Task-specific commands, scripts, or tool notes.
│       ├── output.md        # What was done. Changes made. Outcomes. Filled after completion.
│       └── data/            # Input/output files, fixtures, samples for this task.
│
├── tools/
│   └── global-tools.md      # Project-wide commands, scripts, environment setup.
│
└── data/
    └── .gitkeep             # Shared/global data assets. Empty until needed.
```

---

## Folder Definitions

### `/project/`

**Purpose:** Persistent, stable project identity. The first thing any agent reads.

**Files:**
- `overview.md` — Project name, purpose, current state, primary goal. 1–2 pages max. Written as if briefing a new engineer on their first day.
- `architecture.md` — System design, tech stack, folder structure of the application (not this framework), key patterns. Update when architecture changes.

**Rules:**
- Always present after `init`.
- Never put task-specific or workflow-specific content here.
- Keep concise. This is reference, not documentation.

---

### `/context/`

**Purpose:** Durable project knowledge that doesn't fit in overview. Survives across tasks and workflows.

**Files:**
- `decisions.md` — A running log of key decisions. Format: decision made, why, alternatives rejected. New decisions go at the top.

**Rules:**
- Add entries when non-obvious choices are made.
- Never delete old entries. Mark them superseded if replaced.
- One file in v1. More files can be added as needed (e.g., `integrations.md`, `constraints.md`).

---

### `/workflows/`

**Purpose:** Named sequences of tasks with a shared goal.

**Structure:**
```
/workflows/WORKFLOW-001/
    overview.md
```

**`overview.md` format:**
```markdown
# Workflow: [Name]

## Goal
[What this workflow achieves]

## Tasks
- [ ] TASK-001 — [title]
- [ ] TASK-002 — [title]

## Completion Criteria
[How we know this workflow is done]
```

**Rules:**
- Workflows reference tasks; they do not contain task content.
- A task can exist without a workflow.
- A workflow must reference at least one task.
- Create with: `project-memory new workflow "name"`

---

### `/tasks/`

**Purpose:** Atomic units of work. The primary execution layer.

#### `/tasks/active.md` (CRITICAL)

This is the master coordination file. It must always reflect current reality.

**Format:**
```markdown
# Active Tasks

| ID        | Title                  | Status      | Affected Files                     |
|-----------|------------------------|-------------|------------------------------------|
| TASK-001  | Build login page       | in-progress | src/auth/login.tsx, src/api/auth.ts |
| TASK-002  | Add unit tests         | planned     |                                    |
| TASK-003  | Fix nav bug            | done        | src/components/Nav.tsx             |
```

**Status values:** `planned` | `in-progress` | `done` | `blocked`

**Rules:**
- Updated whenever a task is created, started, completed, or blocked.
- Any agent entering the project reads this first to understand current state.
- Never delete rows. Done tasks stay visible.

---

#### `/tasks/TASK-NNN/`

Each task gets its own folder. Auto-numbered sequentially.

**`instructions.md`** *(required)*
```markdown
# TASK-001: [Title]

## Objective
[One sentence: what must be done]

## Steps
1. [Step one]
2. [Step two]

## Acceptance Criteria
- [ ] [Criterion one]
- [ ] [Criterion two]

## Notes
[Anything important that doesn't fit above]
```

**`context.md`** *(required)*
```markdown
# Context: TASK-001

## Background
[Why this task exists]

## Relevant Files
- `path/to/file.ts` — [what it does]

## Dependencies
[Tasks or systems this task depends on]

## Constraints
[Technical or business constraints]
```

**`tools.md`** *(optional — created only if needed)*
```markdown
# Tools: TASK-001

## Commands
```bash
npm run dev
npm test -- --watch
```

## Notes
[Tool-specific notes for this task]
```

**`output.md`** *(filled after task completion)*
```markdown
# Output: TASK-001

## Summary
[What was done in 2–3 sentences]

## Changes Made
- `path/to/file.ts` — [what changed]

## Outcomes
[Did it meet acceptance criteria? Any issues?]

## Follow-up
[New tasks created or recommended as a result]
```

**`data/`** *(optional)*
- Raw files, fixtures, API response samples, test data relevant to this task.
- If empty, omit the folder.

**Rules:**
- Task IDs are always 3 digits: `TASK-001`, not `TASK-1`.
- `instructions.md` and `context.md` are required at creation time.
- `output.md` starts empty; agents fill it on completion.
- Never put application source code inside a task folder.

---

### `/tools/`

**Purpose:** Project-wide tool reference. Not task-specific.

**Files:**
- `global-tools.md` — Environment setup, common commands, scripts, CI notes, database commands. Anything an agent needs to operate the project at the system level.

**Rules:**
- Task-specific tooling goes in `/tasks/TASK-NNN/tools.md`.
- Global tools are stable. Task tools are ephemeral.

---

### `/data/`

**Purpose:** Shared data assets used across multiple tasks or workflows.

**Rules:**
- If data belongs to one task, put it in `/tasks/TASK-NNN/data/`.
- Global data goes here: shared fixtures, reference datasets, seed files.
- Empty by default. `.gitkeep` preserves the folder in Git.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Task folders | `TASK-NNN` (zero-padded 3 digits) | `TASK-001` |
| Workflow folders | `WORKFLOW-NNN` | `WORKFLOW-001` |
| All filenames | `kebab-case.md` | `global-tools.md` |
| Status values | lowercase | `in-progress` |

---

## What This Spec Explicitly Excludes (v1)

- Roles and skills
- Agent definitions or orchestration
- Runtime logic or execution
- UI, dashboards, or visualizations
- Plugin systems
- Config files
- Multi-project management

These may exist in future versions. They do not exist now.

---

## Versioning

This is **spec v1.0.0**.

Breaking changes to the spec increment the major version. Additions increment minor. Clarifications increment patch.

The spec version is referenced in `README.md` of any project using it.
