import path from 'path';
import { fileExists, listDirs } from './fs.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProject(rootDir: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── Required top-level folders ──────────────────────────────────────────────
  const requiredDirs = ['project', 'context', 'tasks', 'tools', 'data'];
  for (const dir of requiredDirs) {
    if (!fileExists(path.join(rootDir, dir))) {
      errors.push(`Missing required folder: /${dir}`);
    }
  }

  // ── Required files ──────────────────────────────────────────────────────────
  const requiredFiles = [
    ['project', 'overview.md'],
    ['project', 'architecture.md'],
    ['context', 'decisions.md'],
    ['tasks', 'active.md'],
    ['tools', 'global-tools.md'],
  ];

  for (const [dir, file] of requiredFiles) {
    if (!fileExists(path.join(rootDir, dir, file))) {
      errors.push(`Missing required file: /${dir}/${file}`);
    }
  }

  // ── Task folder validation ──────────────────────────────────────────────────
  const tasksDir = path.join(rootDir, 'tasks');
  if (fileExists(tasksDir)) {
    const taskFolders = listDirs(tasksDir).filter((d) =>
      /^TASK-\d{3}$/.test(d)
    );

    for (const taskFolder of taskFolders) {
      const taskPath = path.join(tasksDir, taskFolder);

      if (!fileExists(path.join(taskPath, 'instructions.md'))) {
        errors.push(`${taskFolder}: missing instructions.md`);
      }

      if (!fileExists(path.join(taskPath, 'context.md'))) {
        errors.push(`${taskFolder}: missing context.md`);
      }

      if (!fileExists(path.join(taskPath, 'output.md'))) {
        warnings.push(`${taskFolder}: missing output.md (add when task completes)`);
      }
    }

    // Check for non-standard folder names
    const nonStandard = listDirs(tasksDir).filter(
      (d) => d !== 'active.md' && !/^TASK-\d{3}$/.test(d)
    );
    for (const d of nonStandard) {
      warnings.push(`tasks/${d}: non-standard folder name (expected TASK-NNN format)`);
    }
  }

  // ── Workflow folder validation ──────────────────────────────────────────────
  const workflowsDir = path.join(rootDir, 'workflows');
  if (fileExists(workflowsDir)) {
    const workflowFolders = listDirs(workflowsDir).filter((d) =>
      /^WORKFLOW-\d{3}$/.test(d)
    );

    for (const wf of workflowFolders) {
      const wfPath = path.join(workflowsDir, wf);
      if (!fileExists(path.join(wfPath, 'overview.md'))) {
        errors.push(`${wf}: missing overview.md`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
