import path from 'path';
import { fileExists, writeFile } from './fs.js';
import {
  AgentTarget,
  ALL_AGENT_TARGETS,
  renderAgentTemplate,
  agentTargetLabel,
} from './agent-templates.js';

// ─── Agent file writer ─────────────────────────────────────────────────────────

export type AgentWriteAction = 'created' | 'skipped' | 'overwritten';

export interface AgentWriteResult {
  target: AgentTarget;
  relPath: string;
  action: AgentWriteAction;
}

export function writeAgentTarget(
  cwd: string,
  target: AgentTarget,
  force: boolean
): AgentWriteResult {
  const relPath = agentTargetLabel(target);
  const fullPath = path.join(cwd, relPath);
  const existed = fileExists(fullPath);

  if (existed && !force) {
    return { target, relPath, action: 'skipped' };
  }

  writeFile(fullPath, renderAgentTemplate(target));

  return {
    target,
    relPath,
    action: existed ? 'overwritten' : 'created',
  };
}

export function writeAgentTargets(
  cwd: string,
  targets: AgentTarget[],
  force: boolean
): AgentWriteResult[] {
  return targets.map((target) => writeAgentTarget(cwd, target, force));
}

export function resolveAgentTargets(target: string): AgentTarget[] {
  if (target === 'all') return [...ALL_AGENT_TARGETS];
  return [target as AgentTarget];
}

export function isProjectMemoryReady(cwd: string): boolean {
  return fileExists(path.join(cwd, 'project-memory', 'README.md'));
}
