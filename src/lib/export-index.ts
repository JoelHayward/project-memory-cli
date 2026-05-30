import path from 'path';
import { detect } from './detector.js';
import { fileExists, listDirs, readFile } from './fs.js';
import { AGENT_TARGET_PATHS, ALL_AGENT_TARGETS } from './agent-templates.js';

// ─── JSON export index ─────────────────────────────────────────────────────────
//
// Machine-readable index generated from markdown sources. Markdown is canonical.

export const INDEX_SCHEMA_VERSION = '0.1';

export const DEFAULT_INDEX_REL_PATH = 'project-memory/data/project-memory.index.json';

export interface TaskIndexEntry {
  id: string;
  title: string | null;
  status: string | null;
  path: string;
  instructionsPath: string | null;
  contextPath: string | null;
  outputPath: string | null;
}

export interface WorkflowIndexEntry {
  id: string;
  title: string | null;
  path: string;
  overviewPath: string | null;
}

export interface ProjectMemoryIndex {
  schemaVersion: typeof INDEX_SCHEMA_VERSION;
  generatedAt: string;
  project: {
    name: string;
    overviewPath: string | null;
    architecturePath: string | null;
  };
  context: {
    currentStatePath: string | null;
    decisionsPath: string | null;
    constraintsPath: string | null;
    dependenciesPath: string | null;
  };
  tasks: TaskIndexEntry[];
  workflows: WorkflowIndexEntry[];
  agentEntrypoints: string[];
}

function pmPath(cwd: string, relPath: string): string | null {
  const full = path.join(cwd, 'project-memory', relPath);
  return fileExists(full) ? `project-memory/${relPath.replace(/\\/g, '/')}` : null;
}

function inferProjectName(cwd: string): string {
  const overviewPath = path.join(cwd, 'project-memory', 'project/overview.md');
  if (fileExists(overviewPath)) {
    try {
      const content = readFile(overviewPath);
      const match = content.match(/^#\s+(.+)$/m);
      if (match && !match[1].includes('[')) {
        return match[1].trim();
      }
    } catch {
      // fall through
    }
  }
  return detect(cwd).projectName;
}

export function parseActiveTaskRows(
  activeContent: string | null
): Map<string, { title: string | null; status: string | null }> {
  const rows = new Map<string, { title: string | null; status: string | null }>();
  if (!activeContent) return rows;

  for (const line of activeContent.split('\n')) {
    if (!/\|\s*TASK-\d{3}\s*\|/.test(line)) continue;
    if (/^\|\s*[-:| ]+\s*\|/.test(line)) continue;

    const cells = line.split('|').map((cell) => cell.trim());
    if (cells.length < 5) continue;

    const id = cells[1];
    if (!/^TASK-\d{3}$/.test(id)) continue;

    rows.set(id, {
      title: cells[2] || null,
      status: cells[3] || null,
    });
  }

  return rows;
}

function parseWorkflowTitle(overviewContent: string | null): string | null {
  if (!overviewContent) return null;
  const match = overviewContent.match(/^#\s+Workflow:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function listAgentEntrypoints(cwd: string): string[] {
  const found: string[] = [];
  for (const target of ALL_AGENT_TARGETS) {
    const rel = AGENT_TARGET_PATHS[target];
    if (fileExists(path.join(cwd, rel))) {
      found.push(rel.replace(/\\/g, '/'));
    }
  }
  return found.sort((a, b) => a.localeCompare(b));
}

function buildTasks(cwd: string, activeContent: string | null): TaskIndexEntry[] {
  const tasksDir = path.join(cwd, 'project-memory', 'tasks');
  if (!fileExists(tasksDir)) return [];

  const activeRows = parseActiveTaskRows(activeContent);
  const ids = listDirs(tasksDir)
    .filter((d) => /^TASK-\d{3}$/.test(d))
    .sort((a, b) => a.localeCompare(b));

  return ids.map((id) => {
    const base = `project-memory/tasks/${id}`;
    const meta = activeRows.get(id) ?? { title: null, status: null };

    return {
      id,
      title: meta.title,
      status: meta.status,
      path: base,
      instructionsPath: pmPath(cwd, `tasks/${id}/instructions.md`),
      contextPath: pmPath(cwd, `tasks/${id}/context.md`),
      outputPath: pmPath(cwd, `tasks/${id}/output.md`),
    };
  });
}

function buildWorkflows(cwd: string): WorkflowIndexEntry[] {
  const workflowsDir = path.join(cwd, 'project-memory', 'workflows');
  if (!fileExists(workflowsDir)) return [];

  const ids = listDirs(workflowsDir)
    .filter((d) => /^WORKFLOW-\d{3}$/.test(d))
    .sort((a, b) => a.localeCompare(b));

  return ids.map((id) => {
    const overviewRel = `workflows/${id}/overview.md`;
    let title: string | null = null;

    const overviewFull = path.join(cwd, 'project-memory', overviewRel);
    if (fileExists(overviewFull)) {
      try {
        title = parseWorkflowTitle(readFile(overviewFull));
      } catch {
        title = null;
      }
    }

    return {
      id,
      title,
      path: `project-memory/workflows/${id}`,
      overviewPath: pmPath(cwd, overviewRel),
    };
  });
}

export function buildProjectMemoryIndex(cwd: string, date = new Date()): ProjectMemoryIndex {
  let activeContent: string | null = null;
  const activeFull = path.join(cwd, 'project-memory', 'tasks/active.md');
  if (fileExists(activeFull)) {
    try {
      activeContent = readFile(activeFull);
    } catch {
      activeContent = null;
    }
  }

  return {
    schemaVersion: INDEX_SCHEMA_VERSION,
    generatedAt: date.toISOString(),
    project: {
      name: inferProjectName(cwd),
      overviewPath: pmPath(cwd, 'project/overview.md'),
      architecturePath: pmPath(cwd, 'project/architecture.md'),
    },
    context: {
      currentStatePath: pmPath(cwd, 'context/current-state.md'),
      decisionsPath: pmPath(cwd, 'context/decisions.md'),
      constraintsPath: pmPath(cwd, 'context/constraints.md'),
      dependenciesPath: pmPath(cwd, 'context/dependencies.md'),
    },
    tasks: buildTasks(cwd, activeContent),
    workflows: buildWorkflows(cwd),
    agentEntrypoints: listAgentEntrypoints(cwd),
  };
}

export function serializeProjectMemoryIndex(index: ProjectMemoryIndex): string {
  return `${JSON.stringify(index, null, 2)}\n`;
}

export function defaultIndexPath(cwd: string): string {
  return path.join(cwd, ...DEFAULT_INDEX_REL_PATH.split('/'));
}

export function isExportReady(cwd: string): boolean {
  return fileExists(path.join(cwd, 'project-memory', 'README.md'));
}
