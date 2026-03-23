# project-memory — Spec v1.0.0

> The file system is the system. Structure defines execution. Agents are interchangeable executors.

---

## Philosophy

project-memory is a file-tree standard, not an agent framework. It defines a structured information layer that lives inside a Git repo alongside the codebase. Any AI coding tool — Claude Code, Cursor, Codex, or tools that do not exist yet — can enter the project, read the structure, understand the current state, and continue work without hand-holding.

The intelligence lives in the structure, not the agent.

---

## Core Principles

1. **Visible everything** — No hidden folders. No internal metadata layers. Plain files only.
2. **Human-readable first** — Every file is plaintext markdown, editable without tooling.
3. **Git-friendly** — All markdown. Diffs cleanly. No binary files in the framework layer.
4. **Agent-agnostic** — No Claude-specific syntax. Works with any tool, any model, any future tool.
5. **Zero-config** — The structure is the config. No runtime required.
6. **Minimal by default** — Only create what the rules say. Nothing more.
7. **Contained** — The entire information layer lives under `project-memory/`. One folder. Zero interference with the codebase.

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
| `tests/` or `__tests__/` exists | Flag in architecture template |
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

## `AI.md` — Repo Root Pointer

A minimal pointer file at the repo root. Optional but recommended.

**Behavior:**
- New projects: always created without prompting
- Existing projects: user is asked — `Add AI.md to repo root? (recommended) [Y/n]` — default yes
- If `AI.md` already exists: always skipped, never overwritten
- Scaffold proceeds regardless of the AI.md answer
- Validation never fails or warns for missing AI.md — shows an informational note only

**Content (locked — no additions):**

```markdown
# AI Project Entry

This project uses the project-memory framework.

Start here:
- project-memory/README.md
- project-memory/project/overview.md
- project-memory/tasks/active.md
```

---

## `project-memory/README.md` — Framework Entrypoint

Critical infrastructure. The first file any agent reads after `AI.md`. Explains the structure, defines read order, and serves as the navigation guide for humans and agents.

Generated by `init`. Users may edit freely after initialization.

This file is distinct from the repo root `README.md`, which documents the CLI tool itself. `project-memory/README.md` is the entrypoint for the initialized framework inside a project.

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
| `project-memory tree` | Print ASCII tree of project-memory/ |

---

## Explicitly Excluded from V1

Roles, skills, agent definitions, orchestration, runtime logic, plugins, UI, dashboards, AI API calls, multi-project management.

---

## Spec Version

**v1.0.0** — This document is the source of truth. All CLI behavior derives from it.
