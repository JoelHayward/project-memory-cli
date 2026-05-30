# project-memory

**CLI:** `project-memory` · **npm:** [`project-memory-cli`](https://www.npmjs.com/package/project-memory-cli)

> **Stop re-explaining your repo to AI coding agents.**

**project-memory** scaffolds a local-first, Git-tracked memory layer inside your repo. Claude, Cursor, Codex, and other tools read it before work and update it after — so context stays in files, not in chat history.

It is **not** a documentation generator, agent framework, or project management app. It is a small markdown layer for AI-assisted software projects: human-readable, Git-friendly, and meant to stay current as part of normal work.

**Spec:** v1.0.0 — [SPEC.md](./SPEC.md)

---

## Why this exists

Every new AI session starts from zero unless you paste context again. Agents infer architecture from code, miss recent decisions, and duplicate work.

**project-memory** keeps project context explicit and persistent:

- **Read before work** — Agents load `project-memory/` instead of reconstructing the repo from scratch.
- **Update after work** — Handoff, status, and decisions live in markdown you can review in Git.
- **Tool-agnostic** — Plain files. Same workflow for Cursor, Claude Code, Codex, or anything repo-aware.
- **Local-first** — No cloud service. Your repo is the source of truth.

---

## AI-first workflow

1. **Agent reads project-memory** — Start from `AI.md` (if present) and `project-memory/README.md`, then the files listed there for the task at hand.
2. **Agent performs the task** — Code changes happen in the normal codebase.
3. **Agent updates project-memory** — Refresh the files that changed (see below).
4. **Agent writes handoff** — Task `output.md`, status in `tasks/active.md`, and `context/current-state.md` when state shifted.
5. **Human reviews when needed** — Diff markdown like any other change. No separate PM tool required.

---

## What the AI should update

After meaningful work, agents should keep these files current:

| File | When to update |
|------|----------------|
| `project-memory/context/current-state.md` | Project state, blockers, or priorities changed |
| `project-memory/context/decisions.md` | A design or product decision was made |
| `project-memory/tasks/active.md` | Task started, blocked, or finished |
| `project-memory/tasks/TASK-NNN/output.md` | Task work completed or partially done |
| `project-memory/project/architecture.md` | System design or major components changed |
| `project-memory/tools/global-tools.md` | Commands, setup, or env steps changed |

Keep updates **concise**. Write for the next agent session, not for a wiki.

---

## Install

```bash
npm install -g project-memory-cli
```

Or run once without a global install:

```bash
npx project-memory-cli init
```

The npm package is **`project-memory-cli`**. The command is **`project-memory`**.

---

## Quickstart

```bash
cd your-repo
project-memory init
project-memory validate
project-memory status
project-memory doctor
project-memory snapshot --stdout
project-memory tree
project-memory new task "Describe the work"
```

Optional: add `AI.md` at the repo root (created by `init` for new projects) so agents know where to start.

---

## Example prompts (Cursor / Claude / Codex)

Paste at the start of a session:

> Before making changes, read `AI.md` and `project-memory/README.md`. Follow the read order there. After the task, update the relevant project-memory files (especially `context/current-state.md`, `tasks/active.md`, and task `output.md` if applicable). Keep updates concise.

For a specific task:

> Read `project-memory/tasks/TASK-001/instructions.md` and `context.md` first. When done, fill in `output.md` and update `project-memory/tasks/active.md`.

---

## Check commands: `validate`, `status`, `doctor`

| Command | Use when |
|---------|----------|
| **`validate`** | You need a **pass/fail structural check** — required base files exist, task folders have the right shape. Exits with code `1` on errors. |
| **`status`** | You want a **quick snapshot** — initialized or not, core files present, placeholder hints, task counts, one suggested next step. |
| **`doctor`** | You want a **deeper AI-readiness audit** — missing `AI.md`, empty or placeholder docs, stale `current-state.md`, weak task handoffs, and a **paste-ready AI prompt** to fix issues. Exits `1` on critical failures. |

Run **`validate`** after init or structural changes. Use **`status`** day to day. Run **`doctor`** before trusting agents with the repo or when context feels thin.

---

## Commands

| Command | Purpose |
|---------|---------|
| `project-memory init` | Scaffold `project-memory/` (detect → plan → confirm) |
| `project-memory init --yes` | Skip prompts (`-y` also works) |
| `project-memory new task "<title>"` | Create `TASK-NNN/` and update `active.md` |
| `project-memory new workflow "<title>"` | Create `WORKFLOW-NNN/` |
| `project-memory tree` | ASCII view of `project-memory/` |
| `project-memory validate` | Structural check against the spec |
| `project-memory status` | Quick readiness snapshot |
| `project-memory doctor` | AI usefulness audit + fix prompt |
| `project-memory snapshot` | Assemble a concise agent context snapshot (writes to `project-memory/snapshots/`) |
| `project-memory snapshot --stdout` | Print snapshot to stdout |
| `project-memory snapshot --output <path>` | Write snapshot to a custom path |
| `project-memory agent <target>` | Generate AI-tool instruction file (`generic`, `agents`, `claude`, `cursor`, `all`) |
| `project-memory agent <target> --force` | Overwrite existing instruction files |
| `project-memory export --json` | Export JSON index to `project-memory/data/project-memory.index.json` |
| `project-memory export --json --stdout` | Print JSON index to stdout |
| `project-memory export --json --output <path>` | Write JSON index to a custom path |
| `project-memory handoff` | Write session handoff to `project-memory/context/handoff.md` |
| `project-memory handoff --stdout` | Print handoff to stdout |
| `project-memory handoff --output <path>` | Write handoff to a custom path |

### Snapshot examples

```bash
# Write project-memory/snapshots/YYYY-MM-DD-HHMM.md
project-memory snapshot

# Paste into Cursor / Claude / Codex
project-memory snapshot --stdout

# Custom export path
project-memory snapshot --output ./agent-context.md
```

Snapshots **assemble and trim** existing project-memory files — no AI summarization. Use them to onboard agents quickly, then point them at source files for detail.

### Agent instruction files

Generate tool-specific files that point agents at project-memory:

```bash
project-memory agent generic   # AI.md
project-memory agent agents    # AGENTS.md
project-memory agent claude    # CLAUDE.md
project-memory agent cursor    # .cursor/rules/project-memory.mdc
project-memory agent all       # all of the above
```

Existing files are **skipped** unless you pass `--force`.

| Command | Purpose |
|---------|---------|
| `project-memory agent <target>` | Create agent instruction file for a tool |
| `project-memory agent all` | Create all supported instruction files |
| `project-memory agent <target> --force` | Overwrite if the file already exists |

### JSON export (optional)

Markdown is the **source of truth**. JSON is a generated index for agents, scripts, and integrations — not required for normal use.

```bash
# Default: project-memory/data/project-memory.index.json
project-memory export --json

# Print for piping to another tool
project-memory export --json --stdout

# Custom path
project-memory export --json --output ./agent-index.json
```

Re-run export after markdown changes. Do not edit the JSON by hand.

### Session handoff

Run **`project-memory handoff`** before ending a coding session. It writes a concise note for the next human or AI agent — assembled from existing project-memory files, not AI-generated.

```bash
# Default: project-memory/context/handoff.md
project-memory handoff

# Paste into a new chat
project-memory handoff --stdout

# Custom path
project-memory handoff --output ./session-handoff.md
```

Use handoff to **resume work with a fresh agent** without re-explaining the repo. Pair it with updated `current-state.md` and task `output.md` files when state changed.

---

## Example structure

After `init`:

```text
AI.md                          ← optional agent entry (repo root)
AGENTS.md                      ← optional (Codex / generic agents)
CLAUDE.md                      ← optional (Claude Code)
.cursor/rules/project-memory.mdc  ← optional (Cursor)
project-memory/
├── README.md                  ← agent operating guide (read first)
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

Additional files (e.g. `context/current-state.md`) appear when detection rules match — see [SPEC.md](./SPEC.md).

---

## What this is not

- Not a generic documentation generator
- Not an agent framework or runtime
- Not a project management app or dashboard
- Not tied to one AI vendor

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Maintainers: see [RELEASE.md](./RELEASE.md) before publishing to npm.

---

## License

MIT — see [LICENSE.md](./LICENSE.md)
