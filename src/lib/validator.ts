import path from 'path';
import fs from 'fs';
import { fileExists, listDirs } from './fs.js';

// ─── Validator ────────────────────────────────────────────────────────────────
//
// Enforces base layer only. Dynamic files are never checked.
// AI.md is informational only — never an error or warning.

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

// Base layer files required under project-memory/
// Paths are relative to project-memory/ root.
const REQUIRED_BASE_FILES = [
  'README.md',
  'project/overview.md',
  'project/architecture.md',
  'context/decisions.md',
  'tasks/active.md',
  'tools/global-tools.md',
];

export function validateProject(cwd: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  const pmDir = path.join(cwd, 'project-memory');

  // ── Check project-memory/ folder exists ────────────────────────────────────
  if (!fileExists(pmDir)) {
    errors.push('project-memory/ folder not found. Run `project-memory init` to initialize.');
    return { valid: false, errors, warnings, info };
  }

  // ── Check required base files ──────────────────────────────────────────────
  for (const relPath of REQUIRED_BASE_FILES) {
    const fullPath = path.join(pmDir, relPath);
    if (!fileExists(fullPath)) {
      errors.push(`Missing required file: project-memory/${relPath}`);
    }
  }

  // ── Check task folders ─────────────────────────────────────────────────────
  const tasksDir = path.join(pmDir, 'tasks');
  if (fileExists(tasksDir)) {
    const taskFolders = listDirs(tasksDir).filter(d => /^TASK-\d{3}$/.test(d));
    const nonStandard = listDirs(tasksDir).filter(
      d => !/^TASK-\d{3}$/.test(d)
    );

    for (const taskFolder of taskFolders) {
      const taskPath = path.join(tasksDir, taskFolder);

      if (!fileExists(path.join(taskPath, 'instructions.md'))) {
        errors.push(`${taskFolder}/: missing instructions.md`);
      }
      if (!fileExists(path.join(taskPath, 'context.md'))) {
        errors.push(`${taskFolder}/: missing context.md`);
      }
      if (!fileExists(path.join(taskPath, 'output.md'))) {
        warnings.push(`${taskFolder}/: missing output.md (fill in when task is complete)`);
      }
    }

    for (const d of nonStandard) {
      warnings.push(`tasks/${d}: non-standard folder name (expected TASK-NNN format)`);
    }
  }

  // ── Check workflow folders ─────────────────────────────────────────────────
  const workflowsDir = path.join(pmDir, 'workflows');
  if (fileExists(workflowsDir)) {
    const nonStandardWf = listDirs(workflowsDir).filter(
      d => !/^WORKFLOW-\d{3}$/.test(d)
    );
    for (const d of nonStandardWf) {
      warnings.push(`workflows/${d}: non-standard folder name (expected WORKFLOW-NNN format)`);
    }

    const workflowFolders = listDirs(workflowsDir).filter(d => /^WORKFLOW-\d{3}$/.test(d));
    for (const wf of workflowFolders) {
      if (!fileExists(path.join(workflowsDir, wf, 'overview.md'))) {
        errors.push(`${wf}/: missing overview.md`);
      }
    }
  }

  // ── AI.md informational note ───────────────────────────────────────────────
  // Never an error. Never a warning. Informational only.
  if (!fileExists(path.join(cwd, 'AI.md'))) {
    info.push('AI.md not found at repo root — optional but recommended for AI tool discoverability');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}
