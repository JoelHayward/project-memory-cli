# project-memory

**CLI:** `project-memory` · **npm:** https://www.npmjs.com/package/project-memory-cli

> The file system is the system. Structure defines execution. Agents are interchangeable executors.

**project-memory** is a filesystem convention plus a CLI that scaffolds a plain-markdown “project memory layer” inside your repo — so AI coding tools can read real project context instead of reconstructing it from scratch.

**Spec:** v1.0.0 — [SPEC.md](./SPEC.md)

---

## Why this exists

AI tools are powerful, but they:

* lose context between tasks
* guess architecture from code
* duplicate work or break things

**project-memory solves this by making context explicit and persistent.**

* **Predictable layout** — One folder (`project-memory/`), no hidden state
* **Tool-agnostic** — Works with Cursor, Claude, Codex, or anything that reads a repo
* **Git-native** — Everything is plain Markdown, diffable, and reviewable

It is **not**:

* an agent framework
* a runtime
* a plugin system

---

## Install

```bash
npm install -g project-memory-cli
```

Then run:

```bash
project-memory init
```

> Package name: `project-memory-cli`
> CLI command: `project-memory`

---

## Quickstart

```bash
mkdir my-project
cd my-project

project-memory init
project-memory tree
project-memory validate

project-memory new task "Build login page"
```

---

## Commands

### `project-memory init`

Detects your repo, shows a scaffold plan, then writes the structure under `project-memory/`.

```bash
project-memory init
project-memory init --yes
project-memory init --new
project-memory init --existing
```

---

### `project-memory new task "<title>"`

Creates a new task folder and updates the active task list.

```bash
project-memory new task "Build login page"
```

Creates:

```text
project-memory/tasks/TASK-NNN/
```

---

### `project-memory new workflow "<title>"`

Creates a workflow folder for multi-step work.

```bash
project-memory new workflow "User onboarding"
```

---

### `project-memory tree`

Prints a clean ASCII view of your project-memory structure.

```bash
project-memory tree
```

---

### `project-memory validate`

Validates the base structure against the spec.

```bash
project-memory validate
```

---

## Example structure

After running `init`:

```text
project-memory/
├── README.md
├── project/
│   ├── overview.md
│   └── architecture.md
├── context/
│   └── decisions.md
├── tasks/
│   └── active.md
├── tools/
│   └── global-tools.md
├── data/
└── workflows/
```

Optional at repo root:

```text
AI.md
```

This file points AI tools to the correct entrypoints.

---

## Using with AI tools

The workflow is simple and consistent:

1. Open the repo
2. Have the AI read the project-memory layer
3. Execute tasks using structured context

### Recommended read order

**Cold start:**

* `project-memory/project/overview.md`
* `project-memory/context/current-state.md`
* `project-memory/tasks/active.md`

**Assigned task:**

* `project-memory/tasks/TASK-XXX/instructions.md`
* `project-memory/tasks/TASK-XXX/context.md`
* `project-memory/tasks/TASK-XXX/tools.md`

Works with:

* Cursor
* Claude Code / Cowork
* Codex
* Any repo-aware AI

---

## Philosophy

* **The file system is the system**
* **Structure > prompts**
* **Context is stored, not inferred**
* **Everything is visible and editable**

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## License

MIT — see [LICENSE.md](./LICENSE.md)
