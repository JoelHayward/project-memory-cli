# project-memory

> The file system is the system. Structure defines execution. Agents are interchangeable executors.

**project-memory** is a file-tree standard and CLI that makes any AI coding tool more effective.

It is not an agent framework. It defines how a project's memory, work, and intent are stored so that Claude Code, Cursor, Codex, or any future tool can enter a project cold, read the structure, understand the state, and continue work — without hand-holding.

**Spec version:** v1.0.0 — see [SPEC.md](./SPEC.md)

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

### `project-memory init [name]`

Initializes a project-memory structure in the current directory.

```bash
cd my-project
project-memory init
# or
project-memory init my-app
```

Creates:
```
project/
  overview.md
  architecture.md
context/
  decisions.md
tasks/
  active.md
tools/
  global-tools.md
data/
  .gitkeep
workflows/
  .gitkeep
```

---

### `project-memory new task "title"`

Creates a new task with auto-incremented ID. Updates `tasks/active.md`.

```bash
project-memory new task "Build login page"
project-memory new task "Add unit tests for auth module"
```

Creates:
```
tasks/TASK-001/
  instructions.md   ← define the work
  context.md        ← background and relevant files
  output.md         ← fill in when done
  data/
```

---

### `project-memory new workflow "title"`

Creates a new workflow with auto-incremented ID.

```bash
project-memory new workflow "User onboarding"
```

Creates:
```
workflows/WORKFLOW-001/
  overview.md   ← goal, task list, completion criteria
```

---

### `project-memory validate`

Validates the project-memory structure against the spec.

```bash
project-memory validate
```

Checks for:
- Required folders and files
- Task folder integrity (`instructions.md`, `context.md`)
- Workflow folder integrity
- Non-standard naming

---

## How to Use With AI Tools

### Claude Code / Claude Cowork
Point Claude at the project root. It will read `project/overview.md` for context, `tasks/active.md` for current state, and the relevant `TASK-NNN/` folder for the work at hand.

### Cursor
Open the project root. Add a note in your first message: *"Read project/overview.md and tasks/active.md before starting."*

### Any other tool
The same pattern works everywhere. The structure is the interface.

---

## Philosophy

- **Visible everything** — No hidden folders. Plain files only.
- **Human-readable first** — Every file is editable without tooling.
- **Git-friendly** — All plaintext. Diffs cleanly.
- **Agent-agnostic** — No Claude-specific syntax. Works with any tool.
- **Zero-config** — The structure is the config.
- **Minimal by default** — Only create what's needed.

---

## What This Is Not

- Not an agent framework
- Not a runtime
- Not a plugin system
- Not a UI
- Not Claude-specific

---

## Contributing

See [SPEC.md](./SPEC.md) for the full file-tree standard.

Issues and PRs welcome. Keep changes minimal and aligned with the core philosophy.

---

## License

MIT
# project-memory-cli
