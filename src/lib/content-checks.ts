// ─── Content checks (shared by status + doctor) ─────────────────────────────

/** Substrings from init templates that indicate unfilled placeholder content. */
export const PLACEHOLDER_MARKERS = [
  '[What this project does and why it exists]',
  '[Where things stand right now',
  '[The main thing we are trying to achieve]',
  '[Language / Runtime]',
  '[High-level description of how the system works]',
  '[Name]    | [What it does]',
  '[What was decided]',
  '[Decision title]',
  '[Decision Title]',
  '[Date] — [Decision Title]',
  '[YYYY-MM-DD]',
  '[What is working]',
  '[What is in progress]',
  '[What is blocked]',
  '[The single most important thing to do next]',
  '[The single most important next step]',
  '[One sentence: what must be done]',
  '[One sentence: what must be done and why]',
  '[Step one]',
  '[install command]',
  '[build command]',
  '[test command]',
  '[lint command]',
  '[dev server command]',
  '# Install dependencies',
  '# [dev command]',
  '# [test command]',
  '# [build command]',
  '# [command]',
  '[Anything an agent needs to know to operate this project at the system level]',
  '[Node/Python version, env files, ports, known setup issues',
  '[Short handoff: context the next session needs',
];

export const TASK_CONTEXT_MARKERS = [
  '[Why this task exists',
  'path/to/file',
  '[Link or quote from',
  '[Assumption]',
  '[Unknowns, edge cases, or questions',
  '[Tasks, services, or systems this task depends on]',
  '[Technical or business constraints to be aware of]',
];

export const TASK_OUTPUT_MARKERS = [
  'Fill in when the task is complete',
  'Agents: fill this in when the task is complete',
  '[2–3 sentences:',
  '[What was done in 2–3 sentences]',
  '[brief change description]',
  '[what changed and why]',
  '[commands you ran, or "None"]',
  '[Pass/fail/partial',
  '[Did it meet the acceptance criteria?',
  '[New TASK-NNN',
  '[New tasks created or recommended',
  '[Notes for whoever continues',
  '[What the next agent needs to know',
];

export const STALE_DAYS = 30;

export function containsPlaceholderMarkers(
  content: string,
  extra: string[] = PLACEHOLDER_MARKERS
): boolean {
  return extra.some((marker) => content.includes(marker));
}

export function stripMarkdownBoilerplate(content: string): string {
  return content
    .replace(/^#+ .+$/gm, '')
    .replace(/^\*[^*]+\*$/gm, '')
    .replace(/^---$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\|.+\|/g, '')
    .trim();
}

export function isNearEmpty(content: string, minChars = 80): boolean {
  const text = content
    .replace(/^#+ .+$/gm, '')
    .replace(/^\*[^*]+\*$/gm, '')
    .replace(/^---$/gm, '')
    .replace(/```[\w-]*/g, '')
    .replace(/\|.+\|/g, '')
    .trim();
  return text.replace(/\s/g, '').length < minChars;
}

export function decisionsIsTemplateOnly(content: string): boolean {
  const body = content.replace(/^# Decisions[\s\S]*?---\s*/m, '').trim();
  if (body.length === 0) return true;
  return body.includes('[Decision title]') || body.includes('[Decision Title]') || body.includes('[What was decided]');
}

export function activeMdHasAnyTasks(content: string): boolean {
  return /\|\s*TASK-\d{3}\s*\|/.test(content);
}

export function activeMdHasPlannedOrInProgress(content: string): boolean {
  return content
    .split('\n')
    .filter((line) => /TASK-\d{3}/.test(line))
    .some((line) => /\|\s*(planned|in-progress)\s*\|/i.test(line));
}

export function getTaskStatus(activeContent: string, taskId: string): string | null {
  const row = activeContent.split('\n').find((line) => line.includes(taskId));
  if (!row) return null;
  const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
  if (cells.length < 3) return null;
  return cells[2] ?? null;
}

export function fileHasPlaceholders(content: string, relPath: string): boolean {
  if (containsPlaceholderMarkers(content)) return true;

  if (relPath === 'tasks/active.md') {
    return !activeMdHasAnyTasks(content);
  }

  if (relPath === 'context/decisions.md') {
    return decisionsIsTemplateOnly(content);
  }

  return false;
}

export function taskContextIsPlaceholder(content: string): boolean {
  return containsPlaceholderMarkers(content, TASK_CONTEXT_MARKERS);
}

export function taskOutputIsPlaceholder(content: string): boolean {
  return containsPlaceholderMarkers(content, TASK_OUTPUT_MARKERS);
}

export function hasLastUpdatedPlaceholder(content: string): boolean {
  return /\*Last updated:\s*\[(?:date|YYYY-MM-DD)\]\*/i.test(content);
}

export function parseLastUpdated(content: string): Date | null {
  if (hasLastUpdatedPlaceholder(content)) return null;

  const match = content.match(/\*?\s*Last updated:\s*(\d{4}-\d{2}-\d{2})\s*\*?/i);
  if (!match) return null;

  const date = new Date(match[1]);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isStale(date: Date, days = STALE_DAYS): boolean {
  const ageMs = Date.now() - date.getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

export const CORE_DOC_PATHS = [
  'README.md',
  'project/overview.md',
  'project/architecture.md',
  'context/decisions.md',
  'context/current-state.md',
  'tasks/active.md',
  'tools/global-tools.md',
] as const;

export const REQUIRED_CORE_PATHS = [
  'README.md',
  'project/overview.md',
  'project/architecture.md',
  'context/decisions.md',
  'tasks/active.md',
  'tools/global-tools.md',
] as const;
