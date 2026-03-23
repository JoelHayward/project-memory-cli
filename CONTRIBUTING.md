# Contributing to project-memory

Thanks for your interest. Contributions are welcome — keep them aligned with the core philosophy.

> The file system is the system. Keep it simple. Keep it agent-agnostic.

---

## Before You Contribute

Read [SPEC.md](./SPEC.md). Every contribution should serve the spec, not complicate it.

Ask yourself:
- Does this make the structure simpler or more complex?
- Does this work with any AI tool, or does it assume a specific one?
- Would a human be able to understand this without tooling?

---

## What We Welcome

- Bug fixes in the CLI
- Improvements to generated templates
- New validation rules that catch real problems
- Documentation improvements
- Example projects showing the framework in use

## What We Will Not Merge (v1)

- Roles or skills
- Agent orchestration or runtime logic
- UI or dashboards
- Config files beyond what init already generates
- Tool-specific integrations (Claude-only, Cursor-only, etc.)
- Anything that breaks the zero-config or contained-folder principles

---

## Development Setup

```bash
git clone https://github.com/JoelHayward/project-memory-cli.git
cd project-memory-cli

npm install
npm run build

# Link locally so you can test the CLI from any folder
npm link

# Test it
mkdir /tmp/test-project && cd /tmp/test-project
project-memory init
project-memory new task "Test task"
project-memory validate
project-memory tree
```

---

## Making Changes

1. Fork the repo
2. Create a branch: `fix/your-fix` or `feat/your-feature`
3. Make your changes in `src/`
4. Run `npm run build` and test manually
5. Open a pull request with a clear description of what and why

---

## Changing the Spec

Changes to `SPEC.md` are higher-stakes than CLI changes.

- Open an issue first
- Explain the problem it solves
- Show how it affects existing projects
- Breaking changes require a major version bump

---

## Commit Style

```
feat: add status update command
fix: correct task ID padding for numbers > 999
docs: clarify output.md usage in SPEC
chore: update dependencies
```

---

## Questions

Open an issue. Keep it focused.
