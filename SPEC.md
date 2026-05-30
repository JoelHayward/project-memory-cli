# project-memory — Spec v1.0.0

> Stop re-explaining your repo to AI coding agents. The memory layer lives in Git; agents read it before work and update it after.

---

## Philosophy

project-memory is a **local-first memory layer** for AI-assisted software projects — not an agent framework, not a documentation generator, and not a project management app.

It defines a structured markdown layer inside a Git repo alongside the codebase. AI coding tools (Claude Code, Cursor, Codex, and others) read that layer before work, perform tasks in the code, then update the relevant files so the next session does not start from zero.

The intelligence lives in **maintained files**, not in chat history or code inference alone.

---

## Core Principles

1. **AI-first workflow** — Read project-memory before work; update it after meaningful changes.
2. **Visible everything** — No hidden folders. No internal metadata layers. Plain files only.
3. **Human-readable first** — Every file is plaintext markdown, editable without tooling.
4. **Git-friendly** — All markdown. Diffs cleanly. Review context like code.
5. **Agent-agnostic** — No vendor-specific syntax. Works with any tool that can read a repo.
6. **Zero-config** — The structure is the config. No runtime required.
7. **Minimal by default** — Only create what the rules say. Nothing more.
8. **Contained** — The entire memory layer lives under `project-memory/`. One folder. Zero interference with the codebase.

---

## Repo Integration Model

```
/my-app/                          ← Git repo root
│
├── src/                          ← CODE LAYER (untouched by project-memory)
├── tests/
├── package.json
├── README.md
│
├── AI.md                         ← optional root pointer (recommended)
│
└── project-memory/               ← INFORMATION LAYER (fully contained)
    ├── README.md
    ├── project/
    ├── context/
    ├── tasks/
    ├── workflows/
    ├── tools/
    └── data/
```

The code layer is untouched. project-memory owns exactly one folder (`project-memory/`) and one optional root file (`AI.md`).

---

## Initialization Philosophy

**Deterministic initialization. Rules-driven dynamic structure.**

`project-memory init` scans the current directory using a fixed, documented set of signals. It applies a fixed set of rules. It produces a written scaffold plan. It waits for confirmation before writing anything.

Every file created traces back to a specific detected signal and a specific applied rule. No guessing. No AI reasoning. No silent assumptions. No hidden heuristics.

---

## Detection Signals

### Pass 1 — Is this an existing project?

Any one of the following signals triggers the existing project flow:

| Signal | Type |
|---|---|
| `.git/` | Version control |
| `package.json` | Node / JS project |
| `requirements.txt` / `pyproject.toml` | Python project |
| `Cargo.toml` | Rust project |
| `go.mod` | Go project |
| `Gemfile` | Ruby project |
| `composer.json` | PHP project |
| `pom.xml` | Java project |
| `src/` / `app/` / `components/` | Source structure present |
| `README.md` | Documented project |
| `Dockerfile` / `docker-compose.yml` | Containerized |
| `.github/` / `.gitlab-ci.yml` / `Jenkinsfile` | CI configured |

If none found → new project flow.

### Pass 2 — What type? (existing projects only)

| Signal(s) | Inferred Type |
|---|---|
| `package.json` + `components/` or `pages/` | web-app |
| `package.json` alone | node |
| `requirements.txt` / `pyproject.toml` | python |
| `Cargo.toml` | rust |
| `go.mod` | go |
| `Gemfile` | ruby |
| `pom.xml` | java |
| `.git` only, nothing else | generic |

### Pass 3 — Maturity signals (existing projects only)

| Signal | Effect |
|---|---|
| `tests/` or `__tests__/` exists | Maturity signal — adds `context/current-state.md` (with other existing-project rules) |
| `docker-compose.yml` exists | Adds `context/dependencies.md` |
| Multiple manifests detected | Adds `context/dependencies.md` |
| CI files present | Note in `global-tools.md` template |
| More than 10 files in `src/` | Adds `context/current-state.md` |

---

## Base Layer

Always created. No rules can remove these.

```
project-memory/README.md
project-memory/project/overview.md
project-memory/project/architecture.md
project-memory/context/decisions.md
project-memory/tasks/active.md
project-memory/tools/global-tools.md
project-memory/data/.gitkeep
project-memory/workflows/.gitkeep
```

`AI.md` at repo root is always created for new projects. For existing projects the user is prompted (default yes). It is never required by validation.

---

## Dynamic Expansion Layer

Added only when the corresponding rule fires. Never added speculatively.

| File | Trigger |
|---|---|
| `project-memory/project/brief.md` | New project flow OR web-app type |
| `project-memory/project/plan.md` | New project flow only |
| `project-memory/context/current-state.md` | Existing project with maturity signals |
| `project-memory/context/constraints.md` | Existing project |
| `project-memory/context/dependencies.md` | `docker-compose.yml` found OR multiple manifests |
| `project-memory/tasks/completed.md` | Existing project |
| `project-memory/tasks/archive/.gitkeep` | Existing project with maturity signals |

---

## `AI.md` — Repo Root Agent Entry

A short agent entry file at the repo root. Optional but recommended.

**Behavior:**
- New projects: always created without prompting
- Existing projects: user is asked — `Add AI.md to repo root? (recommended) [Y/n]` — default yes
- If `AI.md` already exists: always skipped, never overwritten
- Scaffold proceeds regardless of the AI.md answer
- Validation never fails or warns for missing AI.md — shows an informational note only

**Purpose:** Tell agents to read project-memory first, avoid relying on code inference alone, and update the layer after meaningful work.

**Default content (generated by `init`; users may edit after initialization):**

```markdown
# AI Agent Instructions

This project uses **project-memory** — a local, Git-tracked memory layer for AI-assisted development.

## Before you work

1. Read `project-memory/README.md` (read order and update rules).
2. Read the files it points to for this task.
3. Do **not** rely only on code inference — use project-memory for decisions, state, and task context.

## After meaningful changes

Update the relevant project-memory files:

- `project-memory/context/current-state.md` — if project state changed
- `project-memory/context/decisions.md` — if a decision was made
- `project-memory/tasks/active.md` — if task status changed
- `project-memory/tasks/TASK-NNN/output.md` — when task work is done or partially done
- `project-memory/project/architecture.md` — if architecture changed
- `project-memory/tools/global-tools.md` — if commands or setup changed

Keep updates **concise** and **human-readable**. Write for the next agent session.
```

---

## `project-memory/README.md` — Agent Operating Guide

The main operating guide for agents after `AI.md`. Defines read order, update rules, which files to update after work, how to avoid noisy documentation churn, how to record decisions, how to complete task output, and how to leave handoff notes — not just a folder description.

Generated by `init`. Users may edit freely after initialization.

This file is distinct from the repo root `README.md`, which documents the application or library itself. `project-memory/README.md` is the entrypoint for the memory layer inside a project.

---

## AI-First Workflow

1. **Read** — Agent loads `AI.md` (if present) and `project-memory/README.md`, then files for the current task.
2. **Work** — Agent changes code in the normal codebase.
3. **Update** — Agent refreshes project-memory files affected by the work.
4. **Hand off** — Agent updates task `output.md`, `tasks/active.md`, and `context/current-state.md` as needed.
5. **Review** — Human reviews markdown diffs in Git when needed.

Agents are expected to **keep project-memory current** as part of normal work, not as a separate documentation phase.

---

## What Agents Should Update

| File | Update when |
|------|-------------|
| `context/current-state.md` | State, blockers, or priorities changed |
| `context/decisions.md` | A decision was made or reversed |
| `tasks/active.md` | Task status or ownership changed |
| `tasks/TASK-NNN/output.md` | Task work completed or partially done |
| `project/architecture.md` | System design or major components changed |
| `tools/global-tools.md` | Commands, setup, or environment steps changed |

Updates should be concise. Prefer short, factual entries over long prose.

---

## Read Order

### Cold Start
*Agent enters project with no prior context.*

```
1. project-memory/project/overview.md
2. project-memory/context/current-state.md   (if present)
3. project-memory/tasks/active.md
```

### Assigned Task
*Agent has been directed to a specific task.*

```
1. project-memory/tasks/TASK-XXX/instructions.md
2. project-memory/tasks/TASK-XXX/context.md
3. project-memory/tasks/TASK-XXX/tools.md    (if present)
```

---

## Full V1 File Tree

```
/my-app/
│
├── AI.md                                        ← optional root pointer
│
└── project-memory/
    │
    ├── README.md                                ← BASE: entrypoint + read order
    │
    ├── project/
    │   ├── overview.md                          ← BASE
    │   ├── architecture.md                      ← BASE
    │   ├── brief.md                             ← DYNAMIC: new project / web-app
    │   └── plan.md                              ← DYNAMIC: new project only
    │
    ├── context/
    │   ├── decisions.md                         ← BASE
    │   ├── current-state.md                     ← DYNAMIC: existing + maturity
    │   ├── constraints.md                       ← DYNAMIC: existing project
    │   └── dependencies.md                      ← DYNAMIC: docker / multi-manifest
    │
    ├── tasks/
    │   ├── active.md                            ← BASE
    │   ├── completed.md                         ← DYNAMIC: existing project
    │   ├── archive/                             ← DYNAMIC: existing + maturity
    │   │   └── .gitkeep
    │   └── TASK-001/                            ← ON DEMAND
    │       ├── instructions.md                  ← required
    │       ├── context.md                       ← required
    │       ├── output.md                        ← required (empty until done)
    │       └── data/
    │           └── .gitkeep
    │
    ├── workflows/                               ← BASE (empty until first workflow)
    │   ├── .gitkeep
    │   └── WORKFLOW-001/                        ← ON DEMAND
    │       └── overview.md
    │
    ├── tools/
    │   └── global-tools.md                      ← BASE
    │
    └── data/
        └── .gitkeep                             ← BASE (empty until needed)
```

---

## Folder Definitions

### `project-memory/project/`

**Purpose:** Stable project definition. Written once, updated infrequently.

**Rule:** No operational state here. No task content. No running logs. If it changes week to week, it belongs in `context/`.

| File | Layer | Purpose |
|---|---|---|
| `overview.md` | Base | What the project is, current goal, tech stack summary |
| `architecture.md` | Base | System design, components, data flow, key patterns |
| `brief.md` | Dynamic | What and why. Written at project start. |
| `plan.md` | Dynamic | How and when. High-level roadmap. New projects only. |

---

### `project-memory/context/`

**Purpose:** Dynamic operational context. Everything that explains current state and shapes decisions.

**Rule:** `current-state.md` lives here, not in `project/`. It is operational state, not project definition.

| File | Layer | Purpose |
|---|---|---|
| `decisions.md` | Base | Running log of key decisions, rationale, alternatives rejected |
| `current-state.md` | Dynamic | Where things stand right now. Max 1 page. Updated regularly. |
| `constraints.md` | Dynamic | Technical and business constraints |
| `dependencies.md` | Dynamic | External services, integrations, third-party dependencies |

---

### `project-memory/tasks/`

**Purpose:** All work tracking. The execution layer of the framework.

| Item | Layer | Purpose |
|---|---|---|
| `active.md` | Base | Master task tracker. All current tasks with status. |
| `completed.md` | Dynamic | Done tasks. Same table format as active.md. |
| `archive/` | Dynamic | Deep archive for old task folders. |
| `TASK-NNN/` | On demand | Individual task folder. |

**`active.md` table format:**

```markdown
| ID       | Title            | Status      | Affected Files |
|----------|------------------|-------------|----------------|
| TASK-001 | Build login page | in-progress | src/auth/      |
```

**Status values:** `planned` | `in-progress` | `done` | `blocked`

**Task folder:**

| File | Required | Purpose |
|---|---|---|
| `instructions.md` | Yes | Objective, steps, acceptance criteria |
| `context.md` | Yes | Background, relevant files, dependencies, constraints |
| `output.md` | Yes (empty until done) | What was done, changes made, outcomes, follow-up |
| `data/` | No | Task-specific assets |

---

### `project-memory/workflows/`

**Purpose:** Named sequences of tasks with a shared goal.

```
workflows/WORKFLOW-001/
└── overview.md    ← goal, ordered task list, completion criteria
```

---

### `project-memory/tools/`

**Purpose:** Project-wide tooling reference. Stable. Not task-specific.

Task-specific tooling goes in `tasks/TASK-NNN/tools.md` only.

---

### `project-memory/data/`

**Purpose:** Shared data assets used across multiple tasks. Empty until needed.

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Task folders | `TASK-NNN` (3-digit zero-padded) | `TASK-001` |
| Workflow folders | `WORKFLOW-NNN` (3-digit zero-padded) | `WORKFLOW-001` |
| All filenames | `kebab-case.md` | `global-tools.md` |
| Status values | lowercase with hyphens | `in-progress` |
| Framework root | `project-memory` | always this exact name |

---

## Validation Rules

Validation enforces the **base layer only**. Dynamic files are never required and never checked.

### Errors (must fix — validation fails)

```
project-memory/ folder must exist
project-memory/README.md
project-memory/project/overview.md
project-memory/project/architecture.md
project-memory/context/decisions.md
project-memory/tasks/active.md
project-memory/tools/global-tools.md
```

### Task folder errors (must fix)

```
Each TASK-NNN/ must contain instructions.md
Each TASK-NNN/ must contain context.md
```

### Warnings (shown but do not fail validation)

```
TASK-NNN/ missing output.md
Non-standard folder names inside tasks/
Non-standard folder names inside workflows/
```

### Informational notes (never errors, never warnings)

```
AI.md not found at repo root — optional but recommended
```

### Never checked by validate

```
context/current-state.md
context/constraints.md
context/dependencies.md
project/brief.md
project/plan.md
tasks/completed.md
tasks/archive/
```

---

## `project-memory status` Command

Prints a concise readiness summary of the project-memory layer. Unlike `validate`, it does not fail on structural errors — it reports state for humans and agents.

**Reports:**
- Whether `project-memory/` and `AI.md` exist
- Core file presence (and optional `context/current-state.md` when present)
- Placeholder content in scaffolded docs
- Count of `TASK-NNN` and `WORKFLOW-NNN` folders
- Suggested next action (init, fill docs, create task, or ready)

---

## `project-memory doctor` Command

Audits whether the project-memory layer is **useful for AI agents**, not just structurally valid.

**Checks (deterministic, no external APIs):**
- Missing `AI.md` and core files
- Placeholder or near-empty content in core docs
- Missing or stale `context/current-state.md` on existing projects
- No planned/in-progress tasks in `tasks/active.md`
- Starter-only `context/decisions.md` and placeholder `tools/global-tools.md`
- Task folders with placeholder `context.md` or `output.md` (for in-progress/done tasks)
- Stale `Last updated:` dates in `current-state.md`

**Output:** fail/warn/pass findings, prioritized recommendations, and a paste-ready AI prompt listing files to update.

Exits with code `1` when critical failures are found (e.g. not initialized).

---

## `project-memory snapshot` Command

Assembles a **concise agent-readable markdown snapshot** from existing project-memory files. No AI summarization — content is trimmed and stitched deterministically.

**Default output:** `project-memory/snapshots/YYYY-MM-DD-HHMM.md`

**Options:**
- `--stdout` — print snapshot to stdout (no file written)
- `--output <path>` — write to a custom path

**Includes:** project name, timestamp, recommended source files, trimmed sections from overview, architecture, current-state (if present), active tasks, recent decisions, global tools, and agent instructions.

Missing files are noted. Placeholder-only files are flagged.

The `project-memory/snapshots/` folder is **optional** — created on first default snapshot write. Not part of the base validation layer.

---

## Optional agent instruction files

In addition to `AI.md`, projects may generate tool-specific instruction files via `project-memory agent <target>`:

| Target | File | Tool |
|--------|------|------|
| `generic` | `AI.md` | Any agent |
| `agents` | `AGENTS.md` | Codex / generic agent conventions |
| `claude` | `CLAUDE.md` | Claude Code |
| `cursor` | `.cursor/rules/project-memory.mdc` | Cursor rules |
| `all` | All of the above | — |

These files are **optional**, never required by validation, and are **not overwritten** unless `--force` is passed.

Content directs agents to read project-memory before work and update it after meaningful changes.

---

## `project-memory agent` Command

Generates or updates tool-specific instruction files at the repo root (or `.cursor/rules/` for Cursor).

**Targets:** `generic`, `agents`, `claude`, `cursor`, `all`

**Options:**
- `--force` — overwrite existing files (default: skip if present)

Requires an initialized `project-memory/` layer.

---

## Optional JSON index export

`project-memory export --json` generates `project-memory/data/project-memory.index.json` from the markdown layer.

**Principles:**
- Markdown remains the source of truth
- JSON is derived, machine-readable, and optional
- No database; no requirement for normal CLI use

**Includes:** schema version, timestamp, project/context paths, task and workflow entries parsed from folders and `tasks/active.md`, and detected agent entrypoint files.

**Options:** `--stdout`, `--output <path>`

Useful for agents, automation, and integrations that prefer structured metadata while keeping human-editable markdown canonical.

---

## `project-memory handoff` Command

Creates a concise **session handoff** note for the next human or AI agent.

**Default output:** `project-memory/context/handoff.md`

**Options:** `--stdout`, `--output <path>`

**Includes:** timestamp, project name, current state (or missing/placeholder note), active tasks, recent decisions, blockers, suggested next action, and reminder to update project-memory.

Assembled deterministically from existing markdown — no AI calls. Regenerated on each run (overwrites default path).

---

## `project-memory tree` Command

Prints a deterministic ASCII tree of the `project-memory/` directory.

**Output rules:**
- ASCII characters only: `├──`, `└──`, `│`, spaces
- No color
- No metadata (no sizes, dates, permissions)
- Folders listed before files at each level
- Alphabetical sort within each group independently
- `.gitkeep` files hidden
- Empty folders shown
- No depth limit in v1
- Pure Node.js `fs` — no external dependencies

---

## CLI Commands (v1)

| Command | Purpose |
|---|---|
| `project-memory init` | Detect → plan → confirm → scaffold |
| `project-memory init --new` | Force new project flow |
| `project-memory init --existing` | Force existing project flow |
| `project-memory init --yes` | Skip confirmation (still prints plan) |
| `project-memory new task "title"` | Create task folder, update active.md |
| `project-memory new workflow "title"` | Create workflow folder |
| `project-memory validate` | Check structure against base layer spec |
| `project-memory status` | Readiness summary: files, placeholders, task counts, next step |
| `project-memory doctor` | AI usefulness audit with recommendations and fix prompt |
| `project-memory snapshot` | Assemble agent-readable context snapshot (optional `snapshots/` folder) |
| `project-memory agent <target>` | Generate tool-specific agent instruction files |
| `project-memory export --json` | Export optional JSON index from markdown sources |
| `project-memory handoff` | Create session handoff note for next agent or human |
| `project-memory tree` | Print ASCII tree of project-memory/ |

---

## Explicitly Excluded from V1

Roles, skills, agent definitions, orchestration, runtime logic, plugins, UI, dashboards, AI API calls, multi-project management.

---

## Spec Version

**v1.0.0** — This document is the source of truth. All CLI behavior derives from it.
