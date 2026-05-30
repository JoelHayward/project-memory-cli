/**
 * One-shot release audit: full CLI flows in temp dirs.
 * Run after build: node scripts/e2e-audit.mjs
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'dist', 'index.js');

const results = [];

function run(args, cwd, label, { expectCode = 0 } = {}) {
  const r = spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  const output = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === expectCode;
  results.push({ label, ok, code: r.status, expectCode, args: args.join(' '), output: output.slice(0, 200) });
  if (!ok) {
    console.error(`FAIL: ${label}\n  args: ${args.join(' ')}\n  expected exit: ${expectCode}, got: ${r.status}\n${output}`);
  }
  return { code: r.status, output, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function mkTemp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

// ── A. New project flow ───────────────────────────────────────────────────────
section('A. New project flow');
const newDir = mkTemp('pm-e2e-new-');
let r;

r = run(['init', '--new', '--yes'], newDir, 'init --new --yes');
assert.equal(r.code, 0, 'init should succeed');

const requiredNew = [
  'project-memory/README.md',
  'project-memory/project/overview.md',
  'project-memory/project/architecture.md',
  'project-memory/project/brief.md',
  'project-memory/project/plan.md',
  'project-memory/context/decisions.md',
  'project-memory/tasks/active.md',
  'project-memory/tools/global-tools.md',
  'AI.md',
];
for (const rel of requiredNew) {
  assert.ok(fs.existsSync(path.join(newDir, rel)), `missing ${rel}`);
}

r = run(['validate'], newDir, 'validate');
assert.equal(r.code, 0, 'validate should pass');
assert.match(r.output, /valid|pass/i);

r = run(['status'], newDir, 'status');
assert.equal(r.code, 0);
assert.match(r.output, /initialized/i);

r = run(['doctor'], newDir, 'doctor');
assert.equal(r.code, 0);
assert.match(r.output, /WARN|placeholder/i);

r = run(['new', 'task', 'Test task'], newDir, 'new task');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, 'project-memory/tasks/TASK-001/instructions.md')));

r = run(['new', 'workflow', 'Test workflow'], newDir, 'new workflow');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, 'project-memory/workflows/WORKFLOW-001/overview.md')));

r = run(['snapshot', '--stdout'], newDir, 'snapshot --stdout');
assert.equal(r.code, 0);
assert.match(r.output, /Project Memory Snapshot/);

r = run(['snapshot'], newDir, 'snapshot');
assert.equal(r.code, 0);
const snaps = path.join(newDir, 'project-memory/snapshots');
assert.ok(fs.existsSync(snaps));
assert.ok(fs.readdirSync(snaps).some((f) => f.endsWith('.md')));

r = run(['handoff', '--stdout'], newDir, 'handoff --stdout');
assert.equal(r.code, 0);
assert.match(r.output, /Session Handoff/);

r = run(['handoff'], newDir, 'handoff');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, 'project-memory/context/handoff.md')));

r = run(['agent', 'generic'], newDir, 'agent generic (skip AI.md)');
assert.equal(r.code, 0);
assert.match(r.output, /skipped/i);

r = run(['agent', 'agents'], newDir, 'agent agents');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, 'AGENTS.md')));

r = run(['agent', 'claude'], newDir, 'agent claude');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, 'CLAUDE.md')));

r = run(['agent', 'cursor'], newDir, 'agent cursor');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, '.cursor/rules/project-memory.mdc')));

r = run(['export', '--json', '--stdout'], newDir, 'export --json --stdout');
assert.equal(r.code, 0);
const index = JSON.parse(r.stdout.trim());
assert.equal(index.tasks?.length, 1);
assert.equal(index.workflows?.length, 1);

r = run(['export', '--json'], newDir, 'export --json');
assert.equal(r.code, 0);
assert.ok(fs.existsSync(path.join(newDir, 'project-memory/data/project-memory.index.json')));

// ── B. Existing project flow ──────────────────────────────────────────────────
section('B. Existing project flow');
const existDir = mkTemp('pm-e2e-exist-');
fs.mkdirSync(path.join(existDir, 'src'), { recursive: true });
fs.writeFileSync(
  path.join(existDir, 'package.json'),
  JSON.stringify({ name: 'existing-app', version: '1.0.0' }, null, 2)
);
fs.writeFileSync(path.join(existDir, 'src/index.ts'), 'export {};\n');
fs.writeFileSync(path.join(existDir, 'README.md'), '# Existing App\n');
fs.mkdirSync(path.join(existDir, 'tests'), { recursive: true });
fs.writeFileSync(path.join(existDir, 'tests', 'placeholder.test.ts'), '// maturity signal\n');
spawnSync('git', ['init'], { cwd: existDir, stdio: 'ignore' });

r = run(['init', '--existing', '--yes'], existDir, 'init --existing --yes');
assert.equal(r.code, 0);

const dynamicExisting = [
  'project-memory/context/current-state.md',
  'project-memory/context/constraints.md',
  'project-memory/tasks/completed.md',
];
for (const rel of dynamicExisting) {
  assert.ok(fs.existsSync(path.join(existDir, rel)), `existing flow missing ${rel}`);
}

r = run(['validate'], existDir, 'validate existing');
assert.equal(r.code, 0);

r = run(['status'], existDir, 'status existing');
assert.equal(r.code, 0);

r = run(['doctor'], existDir, 'doctor existing');
assert.equal(r.code, 0);

// ── C. Idempotency / safety ───────────────────────────────────────────────────
section('C. Idempotency / safety');
r = run(['init', '--new', '--yes'], newDir, 'init twice (should fail)', { expectCode: 1 });
assert.equal(r.code, 1, 'second init should exit 1');
assert.match(r.output, /already initialized/i);

r = run(['agent', 'agents'], newDir, 'agent skip existing');
assert.match(r.output, /skipped/i);

r = run(['validate'], mkTemp('pm-e2e-empty-'), 'validate before init', { expectCode: 1 });

const customOut = path.join(newDir, 'custom-snap.md');
r = run(['snapshot', '--output', './custom-snap.md'], newDir, 'snapshot --output');
assert.ok(fs.existsSync(customOut));

r = run(['handoff', '--output', './custom-handoff.md'], newDir, 'handoff --output');
assert.ok(fs.existsSync(path.join(newDir, 'custom-handoff.md')));

r = run(['export', '--json', '--output', './custom-index.json'], newDir, 'export --output');
assert.ok(fs.existsSync(path.join(newDir, 'custom-index.json')));

// Cleanup
fs.rmSync(newDir, { recursive: true, force: true });
fs.rmSync(existDir, { recursive: true, force: true });

section('Summary');
const failed = results.filter((x) => !x.ok);
console.log(`Steps run: ${results.length}, failed: ${failed.length}`);
if (failed.length) {
  process.exit(1);
}
console.log('All E2E audit steps passed.');
