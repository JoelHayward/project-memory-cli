# project-memory

**A file-tree standard that makes any AI coding tool more effective.**

Give any AI agent — Claude, Cursor, Codex, or any tool — a consistent, structured way to understand your project, track tasks, and continue work across sessions.

---

## The problem

AI coding tools are powerful, but stateless. Every session starts cold. You re-explain the project. You re-explain the task. The agent makes assumptions. Context drifts.

The usual fix is to add complexity: agent frameworks, orchestration layers, tool-specific configs. These are fragile. They break when tools update. They lock you into a runtime.

## A simpler fix

Structure the project itself.

When your project has a clear, consistent information layer — what it is, what's in progress, what each task requires — any agent can walk in cold, read the structure, and get to work. No special integration. No framework. No runtime.

**The file system is the system.**

---

## What it is

`project-memory` is a CLI that scaffolds a structured information layer inside your existing repo:

```
your-repo/
├── src/                    ← your code (untouched)
├── ...
├── AI.md                   ← one-line pointer for AI tools
└── project-memory/
    ├── README.md           ← read order and navigation
    ├── project/
    │   ├── overview.md     ← what the project is
    │   └── architecture.md ← how it's built
    ├── context/
    │   ├── decisions.md    ← key decisions and rationale
    │   └── current-state.md
    ├── tasks/
    │   ├── active.md       ← master task tracker
    │   └── TASK-001/
    │       ├── instructions.md
    │       ├── context.md
    │       └── output.md
    ├── workflows/
    ├── tools/
    │   └── global-tools.md
    └── data/
```

Everything is plain markdown. Human-readable. Git-friendly. Works with any tool, any model, any IDE.

---

## Quickstart

```bash
npm install -g project-memory
```

**Initialize in your project:**

```bash
cd your-project
project-memory init
```

The CLI detects your project type, shows you a scaffold plan, asks for confirmation, then writes the structure. Nothing is written until you confirm.

**Create your first task:**

```bash
project-memory new task "Build login page"
```

**See what was created:**

```bash
project-memory tree
```

**Validate the structure:**

```bash
project-memory validate
```

---

## Example: building a login feature

```bash
$ project-memory new task "Build login page"

  ✔  Created TASK-001: Build login page

  project-memory/tasks/TASK-001/
  ├── instructions.md   ← define the work here
  ├── context.md        ← add background and relevant files
  ├── output.md         ← fill in when task is complete
  └── data/

  project-memory/tasks/active.md updated — TASK-001 added as "planned"
```

Open `tasks/TASK-001/instructions.md` and fill in what needs to be done:

```markdown
# TASK-001: Build login page

## Objective
Build a login page with email/password auth using the existing AuthService.

## Steps
1. Create src/pages/Login.tsx
2. Wire up AuthService.login()
3. Add form validation
4. Redirect to /dashboard on success

## Acceptance Criteria
- [ ] Form validates email format
- [ ] Error states handled
- [ ] Redirects correctly on success
```

Then direct your AI agent:

> *"Read project-memory/tasks/TASK-001/instructions.md and context.md, then implement the changes."*

When the work is done, fill in `output.md` and mark the task `done` in `active.md`. The history lives in Git alongside the code.

---

## Using with AI tools

No custom integrations required. The structure is the interface.

### Cursor

Open your repo. In your first chat message:

> *"Before we start, read project-memory/README.md and project-memory/tasks/active.md."*

To work on a task:

> *"Read project-memory/tasks/TASK-001/instructions.md and context.md, then implement the changes."*

### Claude Code

Point Claude at the repo root. If `AI.md` exists:

> *"Read AI.md first."*

Claude reads the two-line pointer, navigates to the structure, and understands the project.

### Codex / any other tool

Same pattern. The files are just files. Any tool that can read a directory can use this system.

---

## Commands

| Command | What it does |
|---|---|
| `project-memory init` | Detect project, show scaffold plan, confirm, write structure |
| `project-memory init --new` | Force new project flow |
| `project-memory init --existing` | Force existing project flow |
| `project-memory init --yes` | Skip confirmation prompt |
| `project-memory new task "title"` | Create a task folder, update active.md |
| `project-memory new workflow "title"` | Create a workflow folder |
| `project-memory validate` | Check structure against spec |
| `project-memory tree` | Print ASCII tree of project-memory/ |

---

## How `init` works

`init` is not a fixed template generator. It detects your project and applies rules.

```
$ project-memory init

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
    project-memory/project/brief.md         ← what and why
    project-memory/context/constraints.md   ← technical constraints
    project-memory/tasks/completed.md       ← completed tasks log

  Add AI.md to repo root? (recommended) [Y/n]:
  Proceed with scaffold? (y/n):
```

Detection is shallow, rule-based, and fully explainable. Every file created has a documented reason.

---

## Read order for AI agents

**Cold start** — agent enters with no context:
1. `project-memory/project/overview.md`
2. `project-memory/context/current-state.md` *(if present)*
3. `project-memory/tasks/active.md`

**Assigned task** — agent directed to specific work:
1. `project-memory/tasks/TASK-XXX/instructions.md`
2. `project-memory/tasks/TASK-XXX/context.md`
3. `project-memory/tasks/TASK-XXX/tools.md` *(if present)*

---

## Why not an agent framework?

Agent frameworks operate at the runtime layer. They depend on specific tools, specific models, specific APIs. They break when tools update.

project-memory operates one layer above: the file system. It doesn't care what tool you use, what model you run, or what IDE you prefer. The structure persists. The context accumulates. The history lives in Git.

When a better AI tool ships tomorrow, you point it at the same structure and keep going.

---

## Spec

The full file-tree standard is documented in [SPEC.md](./SPEC.md).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

Keep changes aligned with the core principle: **the file system is the system.**

---

## License

MIT
