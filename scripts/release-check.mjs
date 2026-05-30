/**
 * Release readiness check — does NOT publish.
 * Run: npm run release:check
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const REQUIRED_PACK_FILES = [
  'package.json',
  'README.md',
  'SPEC.md',
  'LICENSE.md',
  'dist/index.js',
];

const FORBIDDEN_PACK_PREFIXES = ['scripts/', 'src/', 'node_modules/'];

const steps = [];

function step(name, fn) {
  process.stdout.write(`\n▸ ${name}... `);
  try {
    fn();
    steps.push({ name, ok: true });
    console.log('OK');
  } catch (err) {
    steps.push({ name, ok: false, error: err.message });
    console.log('FAIL');
    console.error(`  ${err.message}`);
    printSummary();
    process.exit(1);
  }
}

function npm(args, { cwd = ROOT } = {}) {
  const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  const output = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0) {
    throw new Error(`npm ${args.join(' ')} failed (exit ${r.status})\n${output}`);
  }
  return output;
}

function nodeScript(script, args = []) {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  const output = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0) {
    throw new Error(`${script} failed (exit ${r.status})\n${output.slice(-2000)}`);
  }
  return output;
}

function binPath(installDir) {
  const base = path.join(installDir, 'node_modules', '.bin', 'project-memory');
  if (process.platform === 'win32') {
    const cmd = `${base}.cmd`;
    if (fs.existsSync(cmd)) return cmd;
  }
  return base;
}

function runBin(bin, args, cwd) {
  const r = spawnSync(bin, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  const output = (r.stdout || '') + (r.stderr || '');
  return { code: r.status ?? 1, output };
}

function printSummary() {
  console.log('\n── Release check summary ──');
  for (const s of steps) {
    console.log(`  ${s.ok ? '✔' : '✖'}  ${s.name}`);
  }
}

console.log('project-memory-cli release check');
console.log('(does not publish — see RELEASE.md for publish steps)');

step('Clean build (remove dist/, run tsc)', () => {
  const dist = path.join(ROOT, 'dist');
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
  npm(['run', 'build']);
  assert.ok(fs.existsSync(path.join(ROOT, 'dist', 'index.js')), 'dist/index.js missing after build');
  const shebang = fs.readFileSync(path.join(ROOT, 'dist', 'index.js'), 'utf8').split('\n')[0];
  assert.match(shebang, /^#!\/usr\/bin\/env node/, 'dist/index.js missing shebang');
});

step('Smoke tests', () => {
  nodeScript('smoke.mjs');
});

step('E2E audit', () => {
  nodeScript('e2e-audit.mjs');
});

step('npm pack --dry-run (required files)', () => {
  const output = npm(['pack', '--dry-run']);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  for (const file of REQUIRED_PACK_FILES) {
    if (!output.includes(file.replace(/\\/g, '/'))) {
      throw new Error(`pack dry-run missing required file: ${file}`);
    }
  }

  for (const prefix of FORBIDDEN_PACK_PREFIXES) {
    const re = new RegExp(`npm notice\\s+\\d+\\s+${prefix.replace('/', '[/\\\\]')}`, 'i');
    if (re.test(output)) {
      throw new Error(`pack dry-run includes forbidden path prefix: ${prefix}`);
    }
  }

  if (!output.includes(`project-memory-cli-${pkg.version}.tgz`)) {
    throw new Error(`pack dry-run tarball name does not match version ${pkg.version}`);
  }
});

let packedTgz = '';

step('npm pack + install tarball + CLI smoke', () => {
  const packOutput = npm(['pack']);
  const match = packOutput.match(/project-memory-cli-[\d.]+\.tgz/);
  if (!match) {
    throw new Error(`could not find .tgz in npm pack output:\n${packOutput}`);
  }
  packedTgz = path.join(ROOT, match[0]);
  assert.ok(fs.existsSync(packedTgz), `tarball not found: ${packedTgz}`);

  const installDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-release-pack-'));
  try {
    npm(['init', '-y'], { cwd: installDir });
    npm(['install', packedTgz], { cwd: installDir });

    const bin = binPath(installDir);
    assert.ok(fs.existsSync(bin), `CLI binary not found: ${bin}`);

    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const version = runBin(bin, ['--version'], installDir);
    if (version.code !== 0) {
      throw new Error(`project-memory --version failed:\n${version.output}`);
    }
    if (version.output.trim() !== pkg.version) {
      throw new Error(`expected version ${pkg.version}, got "${version.output.trim()}"`);
    }

    const projectDir = path.join(installDir, 'sample-project');
    fs.mkdirSync(projectDir, { recursive: true });

    const init = runBin(bin, ['init', '--new', '--yes'], projectDir);
    if (init.code !== 0) {
      throw new Error(`packed CLI init failed:\n${init.output}`);
    }
    assert.ok(
      fs.existsSync(path.join(projectDir, 'project-memory', 'README.md')),
      'init did not create project-memory/README.md'
    );

    const validate = runBin(bin, ['validate'], projectDir);
    if (validate.code !== 0) {
      throw new Error(`packed CLI validate failed:\n${validate.output}`);
    }
    if (!/Base structure valid/i.test(validate.output)) {
      throw new Error('validate did not report success');
    }
  } finally {
    fs.rmSync(installDir, { recursive: true, force: true });
  }
});

step('Cleanup pack artifact', () => {
  if (packedTgz && fs.existsSync(packedTgz)) {
    fs.unlinkSync(packedTgz);
  }
});

printSummary();
console.log('\n✔  Release check passed. Ready for manual publish — see RELEASE.md.\n');
