// ─── Agent instruction templates ───────────────────────────────────────────────
//
// Tool-specific files that point AI agents at the project-memory layer.

export type AgentTarget = 'generic' | 'agents' | 'claude' | 'cursor';

export const AGENT_TARGET_PATHS: Record<AgentTarget, string> = {
  generic: 'AI.md',
  agents: 'AGENTS.md',
  claude: 'CLAUDE.md',
  cursor: '.cursor/rules/project-memory.mdc',
};

export const ALL_AGENT_TARGETS: AgentTarget[] = ['generic', 'agents', 'claude', 'cursor'];

export function isAgentTarget(value: string): value is AgentTarget | 'all' {
  return value === 'all' || ALL_AGENT_TARGETS.includes(value as AgentTarget);
}

function beforeWorkBlock(): string {
  return `## Before you work

This repository uses **project-memory** — a local, Git-tracked memory layer for AI-assisted development.

Read these files first (in order):

1. \`project-memory/README.md\` — agent entrypoint and read order
2. \`project-memory/project/overview.md\` — what this project is
3. \`project-memory/context/current-state.md\` — if present
4. \`project-memory/tasks/active.md\` — current work

Do **not** rely only on code inference. Use project-memory for decisions, state, and task context.`;
}

function assignedTaskBlock(): string {
  return `## Assigned tasks

When directed to a specific task, read:

1. \`project-memory/tasks/TASK-XXX/instructions.md\`
2. \`project-memory/tasks/TASK-XXX/context.md\`

Replace \`TASK-XXX\` with the task ID from \`tasks/active.md\`.`;
}

function afterWorkBlock(): string {
  return `## After meaningful work

Update project-memory when your changes affect project context:

- \`project-memory/tasks/TASK-XXX/output.md\` — task handoff and outcomes
- \`project-memory/tasks/active.md\` — task status
- \`project-memory/context/current-state.md\` — if project state changed
- \`project-memory/context/decisions.md\` — if a decision was made
- \`project-memory/project/architecture.md\` — if architecture changed
- \`project-memory/tools/global-tools.md\` — if commands or setup changed

Keep updates **concise**, **factual**, and useful for future agents. Do not create noisy documentation churn.`;
}

function sharedBody(): string {
  return [
    beforeWorkBlock(),
    '',
    assignedTaskBlock(),
    '',
    afterWorkBlock(),
  ].join('\n');
}

export function genericAgentMd(): string {
  return `# AI Agent Instructions

${sharedBody()}
`;
}

export function agentsMd(): string {
  return `# Agent Instructions

${sharedBody()}
`;
}

export function claudeMd(): string {
  return `# Claude Instructions

${sharedBody()}
`;
}

export function cursorMdc(): string {
  return `---
description: Read project-memory before coding; update it after meaningful changes.
alwaysApply: true
---

# Project memory

${sharedBody()}
`;
}

export function renderAgentTemplate(target: AgentTarget): string {
  switch (target) {
    case 'generic':
      return genericAgentMd();
    case 'agents':
      return agentsMd();
    case 'claude':
      return claudeMd();
    case 'cursor':
      return cursorMdc();
  }
}

export function agentTargetLabel(target: AgentTarget): string {
  return AGENT_TARGET_PATHS[target];
}
