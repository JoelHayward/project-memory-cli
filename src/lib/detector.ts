import fs from 'fs';
import path from 'path';

// ─── Detector ────────────────────────────────────────────────────────────────
//
// Pure function. No side effects. Scans cwd shallowly using a fixed,
// documented set of signals. Returns a structured detection result.
// No AI reasoning. No deep parsing. No hidden heuristics.

export type ProjectType =
  | 'web-app'
  | 'node'
  | 'python'
  | 'rust'
  | 'go'
  | 'ruby'
  | 'java'
  | 'generic';

export interface DetectionResult {
  isExisting: boolean;
  type: ProjectType;
  signals: string[];
  maturitySignals: string[];
  projectName: string;
  hasDocker: boolean;
  hasMultipleManifests: boolean;
}

// ── Signal definitions ────────────────────────────────────────────────────────

const EXISTING_SIGNALS: Array<{ check: string; label: string; isDir?: boolean }> = [
  { check: '.git',              label: '.git/',              isDir: true },
  { check: 'package.json',      label: 'package.json' },
  { check: 'requirements.txt',  label: 'requirements.txt' },
  { check: 'pyproject.toml',    label: 'pyproject.toml' },
  { check: 'Cargo.toml',        label: 'Cargo.toml' },
  { check: 'go.mod',            label: 'go.mod' },
  { check: 'Gemfile',           label: 'Gemfile' },
  { check: 'composer.json',     label: 'composer.json' },
  { check: 'pom.xml',           label: 'pom.xml' },
  { check: 'src',               label: 'src/',               isDir: true },
  { check: 'app',               label: 'app/',               isDir: true },
  { check: 'components',        label: 'components/',        isDir: true },
  { check: 'README.md',         label: 'README.md' },
  { check: 'Dockerfile',        label: 'Dockerfile' },
  { check: 'docker-compose.yml',label: 'docker-compose.yml' },
  { check: '.github',           label: '.github/',           isDir: true },
  { check: '.gitlab-ci.yml',    label: '.gitlab-ci.yml' },
  { check: 'Jenkinsfile',       label: 'Jenkinsfile' },
];

const MATURITY_SIGNALS: Array<{ check: string; label: string; isDir?: boolean }> = [
  { check: 'tests',      label: 'tests/',      isDir: true },
  { check: '__tests__',  label: '__tests__/',  isDir: true },
  { check: '.github',    label: '.github/',    isDir: true },
  { check: '.gitlab-ci.yml', label: '.gitlab-ci.yml' },
  { check: 'Jenkinsfile',    label: 'Jenkinsfile' },
  { check: 'docker-compose.yml', label: 'docker-compose.yml' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function exists(cwd: string, name: string, isDir = false): boolean {
  const full = path.join(cwd, name);
  try {
    const stat = fs.statSync(full);
    return isDir ? stat.isDirectory() : stat.isFile() || stat.isDirectory();
  } catch {
    return false;
  }
}

function hasDir(cwd: string, name: string): boolean {
  return exists(cwd, name, true);
}

function hasFile(cwd: string, name: string): boolean {
  try {
    return fs.statSync(path.join(cwd, name)).isFile();
  } catch {
    return false;
  }
}

function inferType(cwd: string): ProjectType {
  const hasPkg = hasFile(cwd, 'package.json');
  if (hasPkg && (hasDir(cwd, 'components') || hasDir(cwd, 'pages'))) return 'web-app';
  if (hasPkg) return 'node';
  if (hasFile(cwd, 'requirements.txt') || hasFile(cwd, 'pyproject.toml')) return 'python';
  if (hasFile(cwd, 'Cargo.toml')) return 'rust';
  if (hasFile(cwd, 'go.mod')) return 'go';
  if (hasFile(cwd, 'Gemfile')) return 'ruby';
  if (hasFile(cwd, 'pom.xml')) return 'java';
  return 'generic';
}

function inferName(cwd: string): string {
  // Try package.json name first
  const pkgPath = path.join(cwd, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { name?: string };
    if (pkg.name && typeof pkg.name === 'string') return pkg.name;
  } catch {
    // fall through
  }
  // Fall back to directory name
  return path.basename(cwd);
}

function countSourceFiles(cwd: string): number {
  const srcDir = path.join(cwd, 'src');
  try {
    return fs.readdirSync(srcDir).length;
  } catch {
    return 0;
  }
}

// ── Main detector ─────────────────────────────────────────────────────────────

export function detect(cwd: string): DetectionResult {
  const signals: string[] = [];

  for (const signal of EXISTING_SIGNALS) {
    if (exists(cwd, signal.check, signal.isDir)) {
      signals.push(signal.label);
    }
  }

  const isExisting = signals.length > 0;

  const maturitySignals: string[] = [];
  if (isExisting) {
    for (const signal of MATURITY_SIGNALS) {
      if (exists(cwd, signal.check, signal.isDir)) {
        maturitySignals.push(signal.label);
      }
    }
    // Large src/ directory counts as a maturity signal
    if (countSourceFiles(cwd) > 10) {
      maturitySignals.push('src/ (>10 files)');
    }
  }

  const hasDocker = hasFile(cwd, 'docker-compose.yml');

  const manifests = ['package.json', 'requirements.txt', 'pyproject.toml',
    'Cargo.toml', 'go.mod', 'Gemfile', 'composer.json', 'pom.xml']
    .filter(m => hasFile(cwd, m));
  const hasMultipleManifests = manifests.length > 1;

  return {
    isExisting,
    type: isExisting ? inferType(cwd) : 'generic',
    signals,
    maturitySignals,
    projectName: inferName(cwd),
    hasDocker,
    hasMultipleManifests,
  };
}
