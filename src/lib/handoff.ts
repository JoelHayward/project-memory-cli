import path from 'path';
import { detect } from './detector.js';
import { fileExists, readFile } from './fs.js';
import {
  decisionsIsTemplateOnly,
  fileHasPlaceholders,
} from './content-checks.js';
import { parseActiveTaskRows } from './export-index.js';

// ─── Handoff note ─────────────────────────────────────────────────────────────
//
// Concise session handoff assembled from existing markdown. No AI.

export const DEFAULT_HANDOFF_REL_PATH = 'project-memory/context/handoff.md';

const MAX_EXCERPT_LINES = 12;

type SourceStatus = 'missing' | 'placeholder' | 'ok';

interface SourceNote {
  status: SourceStatus;
  path: string;
  excerpt: string | null;
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

function readPmFile(cwd: string, relPath: string): string | null {
  const full = path.join(cwd, 'project-memory', relPath);
  if (!fileExists(full)) return null;
  try {
    return readFile(full);
  } catch {
    return null;
  }
}

function excerpt(content: string, maxLines = MAX_EXCERPT_LINES): string {
  const lines = content.trim().split('\n');
  if (lines.length <= maxLines) return lines.join('\n');
  return [...lines.slice(0, maxLines), '', '*(truncated)*'].join('\n');
}

function assessSource(
  cwd: string,
  relPath: string,
  placeholderRelPath?: string
): SourceNote {
  const pmRel = `project-memory/${relPath}`;
  const content = readPmFile(cwd, relPath);

  if (content === null) {
    return { status: 'missing', path: pmRel, excerpt: null };
  }

  const checkPath = placeholderRelPath ?? relPath;
  if (fileHasPlaceholders(content, checkPath) || (relPath === 'context/decisions.md' && decisionsIsTemplateOnly(content))) {
    return { status: 'placeholder', path: pmRel, excerpt: null };
  }

  return { status: 'ok', path: pmRel, excerpt: excerpt(content) };
}

function formatActiveTasks(cwd: string): string {
  const content = readPmFile(cwd, 'tasks/active.md');
  if (content === null) {
    return '*Missing:* `project-memory/tasks/active.md`';
  }

  if (fileHasPlaceholders(content, 'tasks/active.md')) {
    return '*Placeholder only — no tasks tracked yet.* See `project-memory/tasks/active.md`.';
  }

  const rows = parseActiveTaskRows(content);
  if (rows.size === 0) {
    return '*No tasks in active tracker.*';
  }

  const lines: string[] = [];
  for (const [id, meta] of [...rows.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const title = meta.title ?? '(no title)';
    const status = meta.status ?? 'unknown';
    lines.push(`- **${id}** — ${title} (\`${status}\`) → \`project-memory/tasks/${id}/\``);
  }
  return lines.join('\n');
}

function extractRecentDecisions(cwd: string): string {
  const note = assessSource(cwd, 'context/decisions.md');
  if (note.status === 'missing') {
    return '*Missing:* `project-memory/context/decisions.md`';
  }
  if (note.status === 'placeholder') {
    return '*Placeholder only — no decisions logged yet.* See `project-memory/context/decisions.md`.';
  }

  const content = readPmFile(cwd, 'context/decisions.md')!;
  const parts = content.split(/\n---\n/);
  if (parts.length <= 1) {
    return excerpt(content, 8);
  }

  const entries = parts.slice(1).filter((p) => p.trim().length > 0);
  const recent = entries.slice(-2);
  if (recent.length === 0) {
    return '*No decision entries yet.*';
  }

  const body = recent.map((entry) => `---\n${entry.trim()}`).join('\n\n');
  return excerpt(body, MAX_EXCERPT_LINES);
}

function extractBlockers(cwd: string, activeContent: string | null): string {
  const items: string[] = [];

  const current = assessSource(cwd, 'context/current-state.md');
  if (current.status === 'ok' && current.excerpt) {
    const blockedMatch = current.excerpt.match(/## What is blocked\n([\s\S]*?)(?=\n## |\n*$)/i);
    if (blockedMatch) {
      const text = blockedMatch[1].trim();
      if (text && !text.includes('[What is blocked]')) {
        items.push(`From current state:\n${text}`);
      }
    }
  } else if (current.status === 'missing') {
    items.push('`project-memory/context/current-state.md` is not present — blockers may be undocumented.');
  } else if (current.status === 'placeholder') {
    items.push('`project-memory/context/current-state.md` is still placeholder-only.');
  }

  if (activeContent) {
    const rows = parseActiveTaskRows(activeContent);
    for (const [id, meta] of rows) {
      if (meta.status?.toLowerCase() === 'blocked') {
        items.push(`Task **${id}** (${meta.title ?? 'untitled'}) is \`blocked\`.`);
      }
    }
  }

  if (items.length === 0) {
    return '*None documented. Update `project-memory/context/current-state.md` if blockers exist.*';
  }

  return items.join('\n\n');
}

function suggestNextAction(cwd: string, activeContent: string | null): string {
  const rows = activeContent ? parseActiveTaskRows(activeContent) : new Map();

  const blocked = [...rows.entries()].filter(([, m]) => m.status?.toLowerCase() === 'blocked');
  if (blocked.length > 0) {
    const [id] = blocked[0];
    return `Resolve blocker on **${id}**, then update \`project-memory/context/current-state.md\` and task \`output.md\`.`;
  }

  const inProgress = [...rows.entries()].filter(([, m]) => m.status?.toLowerCase() === 'in-progress');
  if (inProgress.length > 0) {
    const [id, meta] = inProgress[0];
    return `Continue **${id}** (${meta.title ?? 'see instructions'}) — read \`project-memory/tasks/${id}/instructions.md\`.`;
  }

  const planned = [...rows.entries()].filter(([, m]) => m.status?.toLowerCase() === 'planned');
  if (planned.length > 0) {
    const [id, meta] = planned[0];
    return `Start or refine **${id}** (${meta.title ?? 'see instructions'}).`;
  }

  const overview = assessSource(cwd, 'project/overview.md');
  if (overview.status === 'placeholder') {
    return 'Fill in `project-memory/project/overview.md`, then create a task with `project-memory new task "..."`.';
  }

  const current = assessSource(cwd, 'context/current-state.md');
  if (current.status === 'placeholder') {
    return 'Update `project-memory/context/current-state.md` with where things stand now.';
  }

  if (rows.size === 0) {
    return 'Create the next task: `project-memory new task "..."`.';
  }

  return 'Review active tasks in `project-memory/tasks/active.md` and pick up the highest-priority item.';
}

function formatCurrentState(cwd: string): string {
  const note = assessSource(cwd, 'context/current-state.md');
  if (note.status === 'missing') {
    return '*Not present (optional).* See `project-memory/project/overview.md` for project context.';
  }
  if (note.status === 'placeholder') {
    return '*Placeholder only.* Update `project-memory/context/current-state.md` before ending the session.';
  }
  return `*Source:* \`${note.path}\`\n\n${note.excerpt}`;
}

export function buildHandoff(cwd: string, date = new Date()): string {
  const activeContent = readPmFile(cwd, 'tasks/active.md');
  const projectName = inferProjectName(cwd);
  const timestamp = date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return `# Session Handoff

**Project:** ${projectName}
**Generated:** ${timestamp}

> Assembled from project-memory files. Not AI-generated. Edit source files to improve accuracy.

## Current state

${formatCurrentState(cwd)}

## Active tasks

${formatActiveTasks(cwd)}

## Recent decisions

${extractRecentDecisions(cwd)}

## Open questions / blockers

${extractBlockers(cwd, activeContent)}

## Suggested next action

${suggestNextAction(cwd, activeContent)}

## Reminder

Before ending this session, update project-memory if anything changed:

- \`project-memory/context/current-state.md\`
- \`project-memory/tasks/active.md\` and task \`output.md\` files
- \`project-memory/context/decisions.md\` when decisions were made

The next human or AI agent should read \`project-memory/README.md\` and this handoff, then continue work without re-explaining the repo.
`;
}

export function defaultHandoffPath(cwd: string): string {
  return path.join(cwd, ...DEFAULT_HANDOFF_REL_PATH.split('/'));
}

export function isHandoffReady(cwd: string): boolean {
  return fileExists(path.join(cwd, 'project-memory', 'README.md'));
}
