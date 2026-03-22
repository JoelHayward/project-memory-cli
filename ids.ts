import path from 'path';
import { listDirs } from './fs.js';

type EntityType = 'TASK' | 'WORKFLOW';

/**
 * Scans the relevant folder and returns the next sequential ID.
 * e.g. if TASK-001 and TASK-002 exist, returns "TASK-003"
 */
export function nextId(rootDir: string, type: EntityType): string {
  const folder = type === 'TASK' ? 'tasks' : 'workflows';
  const dirPath = path.join(rootDir, folder);
  const prefix = type === 'TASK' ? 'TASK-' : 'WORKFLOW-';

  const existing = listDirs(dirPath)
    .filter((d) => d.startsWith(prefix))
    .map((d) => parseInt(d.replace(prefix, ''), 10))
    .filter((n) => !isNaN(n));

  const max = existing.length > 0 ? Math.max(...existing) : 0;
  const next = max + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}
