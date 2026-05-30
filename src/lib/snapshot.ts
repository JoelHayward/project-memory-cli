import path from 'path';
import { detect } from './detector.js';
import { fileExists, listDirs, readFile } from './fs.js';
import {
  decisionsIsTemplateOnly,
  fileHasPlaceholders,
} from './content-checks.js';

// ─── Snapshot ─────────────────────────────────────────────────────────────────
//
// Assembles a concise agent-readable markdown snapshot from project-memory
// files. No AI summarization — trim and stitch existing content only.

const MAX_SECTION_LINES = 40;
const MAX_SECTION_CHARS = 2000;
const MAX_DECISION_BLOCKS = 2;

const SNAPSHOT_SECTIONS: Array<{ relPath: string; heading: string; optional?: boolean }> = [
  { relPath: 'project/overview.md', heading: 'Project overview' },
  { relPath: 'project/architecture.md', heading: 'Architecture' },
  { relPath: 'context/current-state.md', heading: 'Current state', optional: true },
  { relPath: 'tasks/active.md', heading: 'Active tasks' },
  { relPath: 'context/decisions.md', heading: 'Recent decisions' },
  { relPath: 'tools/global-tools.md', heading: 'Global tools and commands' },
];

function formatTimestamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}-${h}${min}`;
}

function formatGeneratedLabel(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

function trimContent(content: string): string {
  const lines = content.trim().split('\n');
  let trimmed = lines;

  if (lines.length > MAX_SECTION_LINES) {
    trimmed = [...lines.slice(0, MAX_SECTION_LINES), '', '*(truncated — see full source file)*'];
  }

  let text = trimmed.join('\n');
  if (text.length > MAX_SECTION_CHARS) {
    text = `${text.slice(0, MAX_SECTION_CHARS)}\n\n*(truncated — see full source file)*`;
  }

  return text;
}

function trimDecisions(content: string): string {
  const parts = content.split(/\n---\n/);
  if (parts.length <= 1) return trimContent(content);

  const header = parts[0].trim();
  const entries = parts.slice(1).filter((p) => p.trim().length > 0);
  const recent = entries.slice(-MAX_DECISION_BLOCKS);

  if (recent.length === 0) return trimContent(content);

  const body = recent.map((entry) => `---\n${entry.trim()}`).join('\n\n');
  const combined = `${header}\n\n${body}`;
  if (entries.length > MAX_DECISION_BLOCKS) {
    return `${trimContent(combined)}\n\n*(showing ${MAX_DECISION_BLOCKS} most recent entries)*`;
  }
  return trimContent(combined);
}

function inferProjectName(cwd: string, pmDir: string): string {
  const overviewPath = path.join(pmDir, 'project/overview.md');
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

function isPlaceholderContent(content: string, relPath: string): boolean {
  if (fileHasPlaceholders(content, relPath)) return true;
  if (relPath === 'context/decisions.md' && decisionsIsTemplateOnly(content)) return true;
  return false;
}

function renderSection(pmDir: string, relPath: string, heading: string, optional: boolean): string {
  const fullPath = path.join(pmDir, relPath);
  const source = `\`project-memory/${relPath}\``;

  if (!fileExists(fullPath)) {
    if (optional) {
      return `## ${heading}\n\n*Not present (${source}). Optional for this project.*\n`;
    }
    return `## ${heading}\n\n*Missing: ${source}*\n`;
  }

  let content: string;
  try {
    content = readFile(fullPath);
  } catch {
    return `## ${heading}\n\n*Unreadable: ${source}*\n`;
  }

  if (isPlaceholderContent(content, relPath)) {
    return (
      `## ${heading}\n\n` +
      `*Placeholder content only — update ${source} before relying on this snapshot.*\n\n` +
      `${trimContent(relPath === 'context/decisions.md' ? trimDecisions(content) : content)}\n`
    );
  }

  const body = relPath === 'context/decisions.md' ? trimDecisions(content) : trimContent(content);
  return `## ${heading}\n\n*Source: ${source}*\n\n${body}\n`;
}

function listRecommendedSources(cwd: string, pmDir: string): string {
  const lines: string[] = [];

  const rootSources = [
    { label: 'AI.md', full: path.join(cwd, 'AI.md') },
    { label: 'project-memory/README.md', full: path.join(pmDir, 'README.md') },
  ];

  for (const { label, full } of rootSources) {
    lines.push(`- \`${label}\`${fileExists(full) ? '' : ' — missing'}`);
  }

  for (const { relPath, optional } of SNAPSHOT_SECTIONS) {
    const full = path.join(pmDir, relPath);
    const suffix = !fileExists(full)
      ? optional ? ' — not present (optional)' : ' — missing'
      : '';
    lines.push(`- \`project-memory/${relPath}\`${suffix}`);
  }

  const tasksDir = path.join(pmDir, 'tasks');
  const taskIds = fileExists(tasksDir)
    ? listDirs(tasksDir).filter((d) => /^TASK-\d{3}$/.test(d)).sort()
    : [];

  for (const id of taskIds) {
    const instr = path.join(tasksDir, id, 'instructions.md');
    lines.push(
      `- \`project-memory/tasks/${id}/instructions.md\`${fileExists(instr) ? '' : ' — missing'}`
    );
  }

  return lines.join('\n');
}

export function defaultSnapshotPath(cwd: string, date = new Date()): string {
  return path.join(cwd, 'project-memory', 'snapshots', `${formatTimestamp(date)}.md`);
}

export function buildSnapshot(cwd: string, date = new Date()): string {
  const pmDir = path.join(cwd, 'project-memory');
  const projectName = inferProjectName(cwd, pmDir);

  const parts: string[] = [
    '# Project Memory Snapshot',
    '',
    `**Project:** ${projectName}`,
    `**Generated:** ${formatGeneratedLabel(date)}`,
    '',
    '> Assembled from project-memory files. Not AI-generated. Read source files for full detail.',
    '',
    '## Recommended source files',
    '',
    listRecommendedSources(cwd, pmDir),
    '',
  ];

  for (const section of SNAPSHOT_SECTIONS) {
    parts.push(renderSection(pmDir, section.relPath, section.heading, section.optional ?? false));
  }

  parts.push(
    '## Agent instructions',
    '',
    '- Read the recommended source files (and task `instructions.md` / `context.md`) as needed for your work.',
    '- Do not rely on this snapshot alone — verify against the codebase.',
    '- Update project-memory after meaningful changes (`context/current-state.md`, `tasks/active.md`, decisions, architecture, tools).',
    '- When a task is done or handed off, fill in `tasks/TASK-NNN/output.md` and update task status.',
    '- Keep updates concise, factual, and useful for the next agent session.',
    ''
  );

  return parts.join('\n');
}

export function isSnapshotReady(cwd: string): boolean {
  return fileExists(path.join(cwd, 'project-memory'));
}
