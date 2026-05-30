/**
 * Lightweight CLI smoke tests (Node built-in test runner).
 * Requires `npm run build` first — runs against dist/index.js.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'dist', 'index.js');

const REQUIRED_AFTER_NEW_INIT = [
  'project-memory/README.md',
  'project-memory/project/overview.md',
  'project-memory/project/architecture.md',
  'project-memory/project/plan.md',
  'project-memory/context/decisions.md',
  'project-memory/tasks/active.md',
  'project-memory/tools/global-tools.md',
  'AI.md',
];

function mkTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pm-smoke-'));
}

function runCli(args, cwd, { input, timeoutMs = 15_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    if (input !== undefined) {
      child.stdin.write(input);
    }
    child.stdin.end();

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`CLI timed out after ${timeoutMs}ms: ${args.join(' ')}`));
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, output: stdout + stderr });
    });
  });
}

function spawnInteractive(args, cwd) {
  const child = spawn(process.execPath, [CLI, ...args], {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });

  let stdout = '';
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stdout += chunk;
  });

  return { child, getOutput: () => stdout };
}

async function waitForOutput(getOutput, pattern, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (pattern.test(getOutput())) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for output matching ${pattern}`);
}

function assertNewProjectStructure(cwd) {
  for (const rel of REQUIRED_AFTER_NEW_INIT) {
    const full = path.join(cwd, rel);
    assert.ok(fs.existsSync(full), `expected file missing: ${rel}`);
  }
}

test('project-memory --version prints package version', async () => {
  assert.ok(fs.existsSync(CLI), 'dist/index.js missing — run npm run build first');

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const { code, output } = await runCli(['--version'], ROOT);
  assert.equal(code, 0);
  assert.match(output.trim(), new RegExp(`^${pkg.version.replace(/\./g, '\\.')}$`));
});

test('project-memory init --new --yes scaffolds without prompting', async () => {
  const tmp = mkTempDir();
  try {
    const { code, output } = await runCli(['init', '--new', '--yes'], tmp);
    assert.equal(code, 0);
    assert.match(output, /initialized successfully/i);
    assert.doesNotMatch(output, /Project name \[/);
    assert.doesNotMatch(output, /Proceed with scaffold\?/);
    assertNewProjectStructure(tmp);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory init --new -y scaffolds without prompting', async () => {
  const tmp = mkTempDir();
  try {
    const { code, output } = await runCli(['init', '--new', '-y'], tmp);
    assert.equal(code, 0);
    assert.match(output, /initialized successfully/i);
    assert.doesNotMatch(output, /Project name \[/);
    assert.doesNotMatch(output, /Proceed with scaffold\?/);
    assertNewProjectStructure(tmp);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory init --new without --yes waits for interactive input', async () => {
  const tmp = mkTempDir();
  const { child, getOutput } = spawnInteractive(['init', '--new'], tmp);

  try {
    await waitForOutput(getOutput, /Project name \[/);

    assert.ok(
      !fs.existsSync(path.join(tmp, 'project-memory', 'README.md')),
      'should not scaffold before prompts are answered'
    );

    child.stdin.write('\n');
    await waitForOutput(getOutput, /Project type/);
    child.stdin.write('\n');
    await waitForOutput(getOutput, /Proceed with scaffold\?/);
    child.stdin.write('n\n');
    child.stdin.end();

    const code = await new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', resolve);
    });

    assert.equal(code, 0);
    assert.match(getOutput(), /Nothing written/);
    assert.ok(
      !fs.existsSync(path.join(tmp, 'project-memory', 'README.md')),
      'declined scaffold should not write project-memory/'
    );
  } finally {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory status before init suggests init', async () => {
  const tmp = mkTempDir();
  try {
    const { code, output } = await runCli(['status'], tmp);
    assert.equal(code, 0);
    assert.match(output, /not initialized/i);
    assert.match(output, /project-memory init/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory status after init reports initialized structure', async () => {
  const tmp = mkTempDir();
  try {
    const init = await runCli(['init', '--new', '--yes'], tmp);
    assert.equal(init.code, 0);

    const { code, output } = await runCli(['status'], tmp);
    assert.equal(code, 0);
    assert.match(output, /initialized/i);
    assert.match(output, /project\/overview\.md/);
    assert.match(output, /Tasks:\s+0 TASK-NNN/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory status after new task reports at least one task', async () => {
  const tmp = mkTempDir();
  try {
    await runCli(['init', '--new', '--yes'], tmp);
    const task = await runCli(['new', 'task', 'Smoke test task'], tmp);
    assert.equal(task.code, 0);

    const { code, output } = await runCli(['status'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Tasks:\s+1 TASK-NNN folder/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

function writeMinimalFilledDocs(tmp) {
  const pm = path.join(tmp, 'project-memory');
  fs.writeFileSync(
    path.join(pm, 'project/overview.md'),
    `# Test App

## Purpose
Smoke test application for project-memory doctor.

## Current State
Stable scaffold used only in automated tests.

## Primary Goal
Verify doctor reports a useful memory layer when docs are filled.

## Tech Stack
- Node.js
- TypeScript

## Repository Structure
\`/src\` — CLI source code
`
  );
  fs.writeFileSync(
    path.join(pm, 'project/architecture.md'),
    `# Architecture

## System Overview
CLI built with Commander and TypeScript modules under src/.

## Key Components
| Module | Role |
|--------|------|
| commands | CLI entrypoints |
| lib | Inspection and scaffold logic |

## Data Flow
User invokes CLI; lib reads and writes markdown under project-memory/.

## External Dependencies
npm packages declared in package.json only.

## Design Patterns
Command modules delegate to pure lib functions.

## Known Constraints
Filesystem-only; no remote AI API calls.
`
  );
  fs.writeFileSync(
    path.join(pm, 'context/decisions.md'),
    `# Decisions

---

## 2024-06-01 — Use markdown for agent memory

**Decision:** Store project memory as markdown in Git.

**Rationale:** Human-readable, diffable, tool-agnostic.

**Alternatives rejected:** External wiki, vector DB

**Status:** active

---
`
  );
  fs.writeFileSync(
    path.join(pm, 'tools/global-tools.md'),
    `# Global Tools

## Environment Setup
\`\`\`bash
npm install
\`\`\`

## Common Commands
\`\`\`bash
npm run build
npm test
\`\`\`

## Notes
Requires Node.js 18 or newer.
`
  );
}

test('project-memory doctor before init reports failure and init prompt', async () => {
  const tmp = mkTempDir();
  try {
    const { code, output } = await runCli(['doctor'], tmp);
    assert.equal(code, 1);
    assert.match(output, /not found|FAIL/i);
    assert.match(output, /project-memory init/);
    assert.match(output, /AI prompt to fix this/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory doctor after init flags placeholder docs', async () => {
  const tmp = mkTempDir();
  try {
    await runCli(['init', '--new', '--yes'], tmp);
    const { code, output } = await runCli(['doctor'], tmp);
    assert.equal(code, 0);
    assert.match(output, /WARN/i);
    assert.match(output, /placeholder/i);
    assert.match(output, /project-memory\/project\/overview\.md/);
    assert.match(output, /Read the codebase and update/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory doctor after filled docs reports useful layer', async () => {
  const tmp = mkTempDir();
  try {
    await runCli(['init', '--new', '--yes'], tmp);
    writeMinimalFilledDocs(tmp);
    await runCli(['new', 'task', 'Doctor smoke task'], tmp);
    fs.writeFileSync(
      path.join(tmp, 'project-memory/tasks/TASK-001/context.md'),
      `# Context: TASK-001

## Background
Automated smoke test for doctor command.

## Relevant Files
- src/index.ts — CLI entrypoint

## Dependencies
None for this test.

## Constraints
Keep output deterministic.
`
    );

    const { code, output } = await runCli(['doctor'], tmp);
    assert.equal(code, 0);
    assert.match(output, /useful for AI agents/i);
    assert.match(output, /0 fail/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory snapshot --stdout works after init', async () => {
  const tmp = mkTempDir();
  try {
    await runCli(['init', '--new', '--yes'], tmp);
    const { code, output } = await runCli(['snapshot', '--stdout'], tmp);
    assert.equal(code, 0);
    assert.match(output, /# Project Memory Snapshot/);
    assert.match(output, /## Project overview/);
    assert.match(output, /## Agent instructions/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory snapshot writes default snapshots file', async () => {
  const tmp = mkTempDir();
  try {
    await runCli(['init', '--new', '--yes'], tmp);
    const { code, output } = await runCli(['snapshot'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Snapshot written to project-memory[/\\]snapshots[/\\]/);

    const snapshotsDir = path.join(tmp, 'project-memory', 'snapshots');
    assert.ok(fs.existsSync(snapshotsDir));
    const files = fs.readdirSync(snapshotsDir).filter((f) => f.endsWith('.md'));
    assert.ok(files.length >= 1);
    assert.match(files[0], /^\d{4}-\d{2}-\d{2}-\d{4}\.md$/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory snapshot --output writes custom path', async () => {
  const tmp = mkTempDir();
  try {
    await runCli(['init', '--new', '--yes'], tmp);
    const outFile = path.join(tmp, 'agent-context.md');
    const { code } = await runCli(['snapshot', '--output', './agent-context.md'], tmp);
    assert.equal(code, 0);
    assert.ok(fs.existsSync(outFile));
    const content = fs.readFileSync(outFile, 'utf8');
    assert.match(content, /# Project Memory Snapshot/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

async function initProject(tmp) {
  const result = await runCli(['init', '--new', '--yes'], tmp);
  assert.equal(result.code, 0);
}

test('project-memory agent generic skips existing AI.md after init', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['agent', 'generic'], tmp);
    assert.equal(code, 0);
    assert.match(output, /AI\.md already exists — skipped/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory agent agents creates AGENTS.md', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['agent', 'agents'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Created AGENTS\.md/);
    const content = fs.readFileSync(path.join(tmp, 'AGENTS.md'), 'utf8');
    assert.match(content, /# Agent Instructions/);
    assert.match(content, /project-memory\/README\.md/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory agent claude creates CLAUDE.md', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['agent', 'claude'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Created CLAUDE\.md/);
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory agent cursor creates Cursor rule file', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['agent', 'cursor'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Created \.cursor[/\\]rules[/\\]project-memory\.mdc/);
    const rulePath = path.join(tmp, '.cursor', 'rules', 'project-memory.mdc');
    assert.ok(fs.existsSync(rulePath));
    const content = fs.readFileSync(rulePath, 'utf8');
    assert.match(content, /^---/);
    assert.match(content, /alwaysApply: true/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory agent all creates missing files and skips AI.md', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['agent', 'all'], tmp);
    assert.equal(code, 0);
    assert.match(output, /AI\.md already exists — skipped/);
    assert.match(output, /Created AGENTS\.md/);
    assert.match(output, /Created CLAUDE\.md/);
    assert.match(output, /Created \.cursor[/\\]rules[/\\]project-memory\.mdc/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory agent skips existing files unless --force', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    await runCli(['agent', 'agents'], tmp);
    const second = await runCli(['agent', 'agents'], tmp);
    assert.match(second.output, /already exists — skipped/);

    const forced = await runCli(['agent', 'agents', '--force'], tmp);
    assert.match(forced.output, /Overwritten AGENTS\.md/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory export --json writes default index file after init', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['export', '--json'], tmp);
    assert.equal(code, 0);
    assert.match(output, /JSON index written to project-memory[/\\]data[/\\]project-memory\.index\.json/);

    const indexPath = path.join(tmp, 'project-memory', 'data', 'project-memory.index.json');
    assert.ok(fs.existsSync(indexPath));
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    assert.equal(index.schemaVersion, '0.1');
    assert.ok(index.generatedAt);
    assert.ok(index.project.overviewPath);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory export --json includes task after new task', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    await runCli(['new', 'task', 'Export smoke task'], tmp);
    const { code, output } = await runCli(['export', '--json', '--stdout'], tmp);
    assert.equal(code, 0);
    const index = JSON.parse(output);
    assert.equal(index.tasks.length, 1);
    assert.equal(index.tasks[0].id, 'TASK-001');
    assert.equal(index.tasks[0].title, 'Export smoke task');
    assert.equal(index.tasks[0].status, 'planned');
    assert.match(index.tasks[0].instructionsPath, /TASK-001\/instructions\.md$/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory export --json --stdout prints valid JSON', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['export', '--json', '--stdout'], tmp);
    assert.equal(code, 0);
    const index = JSON.parse(output);
    assert.equal(index.schemaVersion, '0.1');
    assert.ok(Array.isArray(index.tasks));
    assert.ok(Array.isArray(index.workflows));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory export --json --output writes custom path', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const outFile = path.join(tmp, 'agent-index.json');
    const { code } = await runCli(['export', '--json', '--output', './agent-index.json'], tmp);
    assert.equal(code, 0);
    assert.ok(fs.existsSync(outFile));
    const index = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    assert.equal(index.schemaVersion, '0.1');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory handoff before init exits with helpful error', async () => {
  const tmp = mkTempDir();
  try {
    const { code, output } = await runCli(['handoff'], tmp);
    assert.equal(code, 1);
    assert.match(output, /No project-memory structure found/i);
    assert.match(output, /project-memory init/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory handoff after init creates handoff file', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['handoff'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Handoff written to project-memory[/\\]context[/\\]handoff\.md/);

    const handoffPath = path.join(tmp, 'project-memory', 'context', 'handoff.md');
    assert.ok(fs.existsSync(handoffPath));
    const content = fs.readFileSync(handoffPath, 'utf8');
    assert.match(content, /# Session Handoff/);
    assert.match(content, /## Active tasks/);
    assert.match(content, /## Reminder/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory handoff --stdout prints handoff markdown', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['handoff', '--stdout'], tmp);
    assert.equal(code, 0);
    assert.match(output, /# Session Handoff/);
    assert.match(output, /## Suggested next action/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory handoff --output writes custom path', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const outFile = path.join(tmp, 'session-handoff.md');
    const { code } = await runCli(['handoff', '--output', './session-handoff.md'], tmp);
    assert.equal(code, 0);
    assert.ok(fs.existsSync(outFile));
    assert.match(fs.readFileSync(outFile, 'utf8'), /# Session Handoff/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory validate passes after init', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['validate'], tmp);
    assert.equal(code, 0);
    assert.match(output, /Base structure valid/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory validate before init exits with error', async () => {
  const tmp = mkTempDir();
  try {
    const { code, output } = await runCli(['validate'], tmp);
    assert.equal(code, 1);
    assert.match(output, /project-memory\/ folder not found/i);
    assert.match(output, /project-memory init/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory init twice does not overwrite', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const overviewPath = path.join(tmp, 'project-memory/project/overview.md');
    fs.writeFileSync(overviewPath, '# Custom overview\n\nDo not overwrite.\n');

    const second = await runCli(['init', '--new', '--yes'], tmp);
    assert.equal(second.code, 1);
    assert.match(second.output, /already initialized/i);
    assert.match(fs.readFileSync(overviewPath, 'utf8'), /Do not overwrite/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory new workflow creates WORKFLOW-001', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['new', 'workflow', 'Test workflow'], tmp);
    assert.equal(code, 0);
    assert.match(output, /WORKFLOW-001/i);
    assert.ok(fs.existsSync(path.join(tmp, 'project-memory/workflows/WORKFLOW-001/overview.md')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory init --existing --yes adds dynamic files with maturity', async () => {
  const tmp = mkTempDir();
  try {
    fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'tests'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'existing-app' }));
    fs.writeFileSync(path.join(tmp, 'src/index.ts'), 'export {};\n');
    fs.writeFileSync(path.join(tmp, 'README.md'), '# Existing\n');
    fs.writeFileSync(path.join(tmp, 'tests/smoke.test.ts'), '// test\n');

    const { code, output } = await runCli(['init', '--existing', '--yes'], tmp);
    assert.equal(code, 0);
    assert.match(output, /initialized successfully/i);

    for (const rel of [
      'project-memory/context/current-state.md',
      'project-memory/context/constraints.md',
      'project-memory/tasks/completed.md',
    ]) {
      assert.ok(fs.existsSync(path.join(tmp, rel)), `missing ${rel}`);
    }
    assert.ok(fs.existsSync(path.join(tmp, 'AI.md')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('project-memory export without --json exits with usage hint', async () => {
  const tmp = mkTempDir();
  try {
    await initProject(tmp);
    const { code, output } = await runCli(['export'], tmp);
    assert.equal(code, 1);
    assert.match(output, /--json/i);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
