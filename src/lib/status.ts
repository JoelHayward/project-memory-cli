import path from 'path';
import { fileExists, listDirs, readFile } from './fs.js';
import {
  fileHasPlaceholders,
} from './content-checks.js';

// ─── Status ───────────────────────────────────────────────────────────────────
//
// Readiness summary for the project-memory layer (not structural validation).

export interface CoreFileStatus {
  /** Path relative to project-memory/ */
  relPath: string;
  exists: boolean;
  optional: boolean;
  hasPlaceholders: boolean;
}

export interface StatusReport {
  initialized: boolean;
  hasAiMd: boolean;
  coreFiles: CoreFileStatus[];
  taskCount: number;
  workflowCount: number;
  placeholdersIn: string[];
  suggestedAction: string;
}

const CORE_FILES: Array<{ relPath: string; optional: boolean }> = [
  { relPath: 'README.md', optional: false },
  { relPath: 'project/overview.md', optional: false },
  { relPath: 'project/architecture.md', optional: false },
  { relPath: 'context/decisions.md', optional: false },
  { relPath: 'context/current-state.md', optional: true },
  { relPath: 'tasks/active.md', optional: false },
  { relPath: 'tools/global-tools.md', optional: false },
];

function countMatchingDirs(pmDir: string, subfolder: string, pattern: RegExp): number {
  const dir = path.join(pmDir, subfolder);
  if (!fileExists(dir)) return 0;
  return listDirs(dir).filter((d) => pattern.test(d)).length;
}

function suggestAction(
  initialized: boolean,
  placeholdersIn: string[],
  taskCount: number
): string {
  if (!initialized) {
    return 'Run `project-memory init`.';
  }

  const corePlaceholders = placeholdersIn.filter((p) => !p.includes('current-state.md'));
  if (corePlaceholders.length > 0) {
    return `Fill or ask an AI agent to update project-memory/${corePlaceholders[0]}.`;
  }

  if (placeholdersIn.some((p) => p.includes('current-state.md'))) {
    return 'Update project-memory/context/current-state.md.';
  }

  if (taskCount === 0) {
    return 'Create a task with `project-memory new task "..."`.';
  }

  return 'Project memory looks ready for AI-assisted work.';
}

export function inspectStatus(cwd: string): StatusReport {
  const pmDir = path.join(cwd, 'project-memory');
  const initialized = fileExists(pmDir);
  const hasAiMd = fileExists(path.join(cwd, 'AI.md'));

  if (!initialized) {
    return {
      initialized: false,
      hasAiMd,
      coreFiles: CORE_FILES.map(({ relPath, optional }) => ({
        relPath,
        exists: false,
        optional,
        hasPlaceholders: false,
      })),
      taskCount: 0,
      workflowCount: 0,
      placeholdersIn: [],
      suggestedAction: 'Run `project-memory init`.',
    };
  }

  const coreFiles: CoreFileStatus[] = [];
  const placeholdersIn: string[] = [];

  for (const { relPath, optional } of CORE_FILES) {
    const fullPath = path.join(pmDir, relPath);
    const exists = fileExists(fullPath);
    let hasPlaceholders = false;

    if (exists) {
      try {
        const content = readFile(fullPath);
        hasPlaceholders = fileHasPlaceholders(content, relPath);
        if (hasPlaceholders) {
          placeholdersIn.push(relPath);
        }
      } catch {
        // unreadable file — treat as no placeholders
      }
    }

    coreFiles.push({ relPath, exists, optional, hasPlaceholders });
  }

  const taskCount = countMatchingDirs(pmDir, 'tasks', /^TASK-\d{3}$/);
  const workflowCount = countMatchingDirs(pmDir, 'workflows', /^WORKFLOW-\d{3}$/);

  return {
    initialized: true,
    hasAiMd,
    coreFiles,
    taskCount,
    workflowCount,
    placeholdersIn,
    suggestedAction: suggestAction(true, placeholdersIn, taskCount),
  };
}
