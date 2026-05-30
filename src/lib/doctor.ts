import path from 'path';
import { detect } from './detector.js';
import { fileExists, listDirs, readFile } from './fs.js';
import {
  REQUIRED_CORE_PATHS,
  decisionsIsTemplateOnly,
  fileHasPlaceholders,
  getTaskStatus,
  hasLastUpdatedPlaceholder,
  isNearEmpty,
  isStale,
  parseLastUpdated,
  activeMdHasPlannedOrInProgress,
  taskContextIsPlaceholder,
  taskOutputIsPlaceholder,
} from './content-checks.js';

// ─── Doctor ───────────────────────────────────────────────────────────────────
//
// Quality/usefulness audit for AI agents (deeper than status or validate).

export type FindingSeverity = 'fail' | 'warn' | 'pass';

export interface DoctorFinding {
  severity: FindingSeverity;
  message: string;
  priority: number;
  /** Paths relative to project-memory/ (or AI.md at repo root). */
  files: string[];
}

export interface DoctorReport {
  initialized: boolean;
  findings: DoctorFinding[];
  recommendations: string[];
  aiPrompt: string;
  failCount: number;
  warnCount: number;
  passCount: number;
}

function add(
  findings: DoctorFinding[],
  severity: FindingSeverity,
  message: string,
  priority: number,
  files: string[] = []
): void {
  findings.push({ severity, message, priority, files });
}

function hasSubstantiveSections(content: string): boolean {
  return (content.match(/^## /gm)?.length ?? 0) >= 2;
}

function readPmFile(pmDir: string, relPath: string): string | null {
  const full = path.join(pmDir, relPath);
  if (!fileExists(full)) return null;
  try {
    return readFile(full);
  } catch {
    return null;
  }
}

function buildRecommendations(findings: DoctorFinding[]): string[] {
  return findings
    .filter((f) => f.severity === 'fail' || f.severity === 'warn')
    .sort((a, b) => a.priority - b.priority)
    .map((f) => f.message);
}

function buildAiPrompt(initialized: boolean, findings: DoctorFinding[]): string {
  if (!initialized) {
    return 'Run `project-memory init` in this repository first, then re-run `project-memory doctor`.';
  }

  const files = new Set<string>();
  for (const f of findings) {
    if (f.severity === 'fail' || f.severity === 'warn') {
      for (const file of f.files) {
        if (file !== 'AI.md') files.add(file);
      }
    }
  }

  if (files.size === 0) {
    return 'Project memory looks useful for AI agents. Review `project-memory/` periodically and update after significant work.';
  }

  const sorted = [...files].sort();
  const list = sorted.map((f) => `project-memory/${f}`).join(', ');
  return (
    `Read the codebase and update ${list}. ` +
    'Keep updates concise, factual, and useful for future AI coding agents.'
  );
}

export function inspectDoctor(cwd: string): DoctorReport {
  const pmDir = path.join(cwd, 'project-memory');
  const initialized = fileExists(pmDir);
  const findings: DoctorFinding[] = [];

  if (!initialized) {
    add(findings, 'fail', 'project-memory/ not found — run `project-memory init`.', 1);
    return finalize(findings, false);
  }

  const detection = detect(cwd);
  const isExistingProject = detection.isExisting;

  if (!fileExists(path.join(cwd, 'AI.md'))) {
    add(
      findings,
      'warn',
      'AI.md missing at repo root — agents may not discover the memory layer.',
      10,
      ['AI.md']
    );
  } else {
    add(findings, 'pass', 'AI.md present at repo root.', 10, ['AI.md']);
  }

  for (const relPath of REQUIRED_CORE_PATHS) {
    const content = readPmFile(pmDir, relPath);
    if (content === null) {
      add(
        findings,
        'fail',
        `Missing required file: project-memory/${relPath}`,
        20,
        [relPath]
      );
      continue;
    }

    add(findings, 'pass', `Required file present: project-memory/${relPath}`, 20, [relPath]);

    if (fileHasPlaceholders(content, relPath)) {
      add(
        findings,
        'warn',
        `Placeholder content in project-memory/${relPath}`,
        30,
        [relPath]
      );
    }

    if (isNearEmpty(content) && !hasSubstantiveSections(content) && relPath !== 'tasks/active.md') {
      add(
        findings,
        'warn',
        `Near-empty content in project-memory/${relPath}`,
        35,
        [relPath]
      );
    }
  }

  const currentStatePath = 'context/current-state.md';
  const currentState = readPmFile(pmDir, currentStatePath);

  if (isExistingProject && currentState === null) {
    add(
      findings,
      'warn',
      'context/current-state.md missing — recommended for existing projects.',
      40,
      [currentStatePath]
    );
  } else if (currentState !== null) {
    if (fileHasPlaceholders(currentState, currentStatePath) || hasLastUpdatedPlaceholder(currentState)) {
      add(
        findings,
        'warn',
        'context/current-state.md still has template placeholders.',
        41,
        [currentStatePath]
      );
    }

    const lastUpdated = parseLastUpdated(currentState);
    if (lastUpdated && isStale(lastUpdated)) {
      add(
        findings,
        'warn',
        `context/current-state.md may be stale (last updated ${lastUpdated.toISOString().slice(0, 10)}).`,
        42,
        [currentStatePath]
      );
    } else if (
      currentState &&
      !fileHasPlaceholders(currentState, currentStatePath) &&
      !hasLastUpdatedPlaceholder(currentState)
    ) {
      add(findings, 'pass', 'context/current-state.md looks filled in.', 41, [currentStatePath]);
    }
  }

  const activeContent = readPmFile(pmDir, 'tasks/active.md');
  if (activeContent) {
    if (!activeMdHasPlannedOrInProgress(activeContent)) {
      add(
        findings,
        'warn',
        'tasks/active.md has no planned or in-progress tasks.',
        50,
        ['tasks/active.md']
      );
    } else {
      add(findings, 'pass', 'tasks/active.md has planned or in-progress work.', 50, ['tasks/active.md']);
    }
  }

  const decisionsContent = readPmFile(pmDir, 'context/decisions.md');
  if (decisionsContent && decisionsIsTemplateOnly(decisionsContent)) {
    add(
      findings,
      'warn',
      'context/decisions.md contains only the starter template.',
      55,
      ['context/decisions.md']
    );
  } else if (decisionsContent) {
    add(findings, 'pass', 'context/decisions.md has at least one decision entry.', 55, ['context/decisions.md']);
  }

  const toolsContent = readPmFile(pmDir, 'tools/global-tools.md');
  if (toolsContent && fileHasPlaceholders(toolsContent, 'tools/global-tools.md')) {
    add(
      findings,
      'warn',
      'tools/global-tools.md contains only placeholder commands.',
      60,
      ['tools/global-tools.md']
    );
  } else if (toolsContent) {
    add(findings, 'pass', 'tools/global-tools.md looks filled in.', 60, ['tools/global-tools.md']);
  }

  const tasksDir = path.join(pmDir, 'tasks');
  const taskFolders = fileExists(tasksDir)
    ? listDirs(tasksDir).filter((d) => /^TASK-\d{3}$/.test(d))
    : [];

  for (const taskId of taskFolders) {
    const contextRel = `tasks/${taskId}/context.md`;
    const outputRel = `tasks/${taskId}/output.md`;
    const contextContent = readPmFile(pmDir, contextRel);
    const outputContent = readPmFile(pmDir, outputRel);
    const status = activeContent ? getTaskStatus(activeContent, taskId) : null;

    if (contextContent && taskContextIsPlaceholder(contextContent)) {
      add(
        findings,
        'warn',
        `${taskId}/context.md lacks meaningful background for agents.`,
        70,
        [contextRel]
      );
    } else if (contextContent) {
      add(findings, 'pass', `${taskId}/context.md looks filled in.`, 70, [contextRel]);
    }

    if (
      outputContent &&
      taskOutputIsPlaceholder(outputContent) &&
      status &&
      /^(in-progress|done)$/i.test(status)
    ) {
      add(
        findings,
        'warn',
        `${taskId}/output.md should be updated for a ${status} task.`,
        75,
        [outputRel]
      );
    } else if (outputContent && !taskOutputIsPlaceholder(outputContent)) {
      add(findings, 'pass', `${taskId}/output.md has handoff content.`, 75, [outputRel]);
    }
  }

  return finalize(findings, true);
}

function finalize(findings: DoctorFinding[], initialized: boolean): DoctorReport {
  const failCount = findings.filter((f) => f.severity === 'fail').length;
  const warnCount = findings.filter((f) => f.severity === 'warn').length;
  const passCount = findings.filter((f) => f.severity === 'pass').length;
  const actionable = findings.filter((f) => f.severity === 'fail' || f.severity === 'warn');

  return {
    initialized,
    findings,
    recommendations: buildRecommendations(findings),
    aiPrompt: buildAiPrompt(initialized, actionable),
    failCount,
    warnCount,
    passCount,
  };
}
