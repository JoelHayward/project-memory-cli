# project-memory

> The file system is the system. Structure defines execution. Agents are interchangeable executors.

**project-memory** is a file-tree standard and CLI that makes any AI coding tool more effective.

It is not an agent framework. It defines a structured information layer that lives inside a Git repo alongside the codebase. Claude Code, Cursor, Codex, or any future tool can enter the project, read the structure, understand the current state, and continue work — without hand-holding.

**Spec version:** v1.0.0 — see [SPEC.md](./SPEC.md)

---

## How it works

project-memory adds one folder to your repo:

```
your-repo/
├── src/              ← your code (untouched)
├── ...
├── AI.md             ← optional root pointer for AI tools
└── project-memory/   ← structured information layer
    ├── README.md     ← entrypoint and read order
    ├── project/      ← stable project definition
    ├── context/      ← operational state and decisions
    ├── tasks/        ← task tracking and execution
    ├── workflows/    ← named task sequences
    ├── tools/        ← environment and commands
    └── data/         ← shared data assets
```

The structure is the interface. Any agent that can read files can use it.

---

## Install

```bash
npm install -g project-memory
```

Or use without installing:

```bash
npx project-memory init
```

---

## Commands

### `project-memory init`

Scans the current directory, produces a scaffold plan, asks for confirmation, then writes the structure.

```bash
cd my-project
project-memory init
```

**Flags:**
- `--new` — force new project flow
- `--existing` — force existing project flow
- `--yes` — skip confirmation prompt (still prints plan)

**What it does:**
1. Detects signals in the current directory (`.git`, `package.json`, `src/`, etc.)
2. Classifies as new or existing project
3. Applies rules to generate a scaffold plan
4. Prints the detection summary and planned files
5. Asks for confirmation before writing anything
6. Writes only the files that do not already exist

**Example output:**
```
  ─────────────────────────────────────────
  Detected
  ─────────────────────────────────────────
  Directory:   my-app
  Existing:    yes
  Type:        web-app
  Signals:     package.json, src/, components/, .git

  ─────────────────────────────────────────
  Scaffold Plan
  ─────────────────────────────────────────
  Base layer:
    project-memory/README.md
    project-memory/project/overview.md
    project-memory/project/architecture.md
    project-memory/context/decisions.md
    project-memory/tasks/active.md
    project-memory/tools/global-tools.md
    AI.md (will prompt)

  Dynamic additions:
    project-memory/project/brief.md        ← what and why — project brief
    project-memory/context/constraints.md  ← technical and business constraints
    project-memory/tasks/completed.md      ← completed tasks log

  Add AI.md to repo root? (recommended) [Y/n]:
  Proceed with scaffold? (y/n):
```

---

### `project-memory new task "title"`

Creates a new task folder with auto-incremented ID. Updates `tasks/active.md`.

```bash
project-memory new task "Build login page"
project-memory new task "Add unit tests for auth module"
```

Creates:
```
project-memory/tasks/TASK-001/
├── instructions.md   ← define the work
├── context.md        ← background and relevant files
├── output.md         ← fill in when done
└── data/
```

---

### `project-memory new workflow "title"`

Creates a new workflow folder with auto-incremented ID.

```bash
project-memory new workflow "User onboarding"
```

Creates:
```
project-memory/workflows/WORKFLOW-001/
└── overview.md   ← goal, task list, completion criteria
```

---

### `project-memory validate`

Validates the structure against the base layer spec.

```bash
project-memory validate
```

**Checks:**
- `project-memory/` folder exists
- All base layer files present
- Task folders contain `instructions.md` and `context.md`
- Workflow folders contain `overview.md`
- Standard naming conventions

**Output:**
```
  project-memory validate

  ✔  Base structure valid.
  ⚠  1 warning:
     • TASK-003/: missing output.md (fill in when task is complete)
  ℹ  AI.md not found at repo root — optional but recommended
```

---

### `project-memory tree`

Prints a clean ASCII tree of the `project-memory/` directory.

```bash
project-memory tree
```

**Output:**
```
project-memory/
├── README.md
├── context/
│   ├── constraints.md
│   ├── current-state.md
│   └── decisions.md
├── data/
├── project/
│   ├── architecture.md
│   ├── brief.md
│   └── overview.md
├── tasks/
│   ├── TASK-001/
│   │   ├── context.md
│   │   ├── instructions.md
│   │   └── output.md
│   └── active.md
├── tools/
│   └── global-tools.md
└── workflows/
```

---

## Using with AI tools

### Directing an agent cold

Point the agent at the entrypoints:

> *"Read project-memory/README.md, then project-memory/project/overview.md, then project-memory/tasks/active.md before we start."*

Or if `AI.md` exists at the repo root:

> *"Read AI.md first."*

### Assigning a specific task

> *"Read project-memory/tasks/TASK-001/instructions.md and context.md, then implement the changes."*

### After the agent completes work

Fill in `project-memory/tasks/TASK-001/output.md` and update the status in `tasks/active.md` to `done`.

---

## Read order

### Cold start
1. `project-memory/project/overview.md`
2. `project-memory/context/current-state.md` (if present)
3. `project-memory/tasks/active.md`

### Assigned task
1. `project-memory/tasks/TASK-XXX/instructions.md`
2. `project-memory/tasks/TASK-XXX/context.md`
3. `project-memory/tasks/TASK-XXX/tools.md` (if present)

---

## Philosophy

- **Visible everything** — No hidden folders. Plain files only.
- **Human-readable first** — Every file is editable without tooling.
- **Git-friendly** — All plaintext. Diffs cleanly.
- **Agent-agnostic** — No Claude-specific syntax. Works with any tool.
- **Zero-config** — The structure is the config.
- **Contained** — One folder. Zero interference with your codebase.

---

## What this is not

- Not an agent framework
- Not a runtime or orchestration layer
- Not a plugin system
- Not a UI
- Not Claude-specific or tool-specific

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](./LICENSE)
