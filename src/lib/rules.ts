// ─── Rules: Base Layer + Dynamic Expansion ───────────────────────────────────
//
// This file is the single source of truth for what project-memory scaffolds.
// Every scaffold decision derives from these constants.
// Do not add items here without a corresponding spec entry.

export type DynamicTrigger =
  | 'newProject'
  | 'newProjectOrWebApp'
  | 'existingProject'
  | 'existingWithMaturity'
  | 'dockerOrMultiManifest';

export interface BaseItem {
  /** Path relative to cwd. Use forward slashes. */
  path: string;
  /** Key into the templates map. */
  template: string;
  /** Human-readable description shown in plan output. */
  description: string;
}

export interface DynamicRule {
  path: string;
  template: string;
  description: string;
  trigger: DynamicTrigger;
}

// ── Base layer ────────────────────────────────────────────────────────────────
// Always scaffolded. No rule can remove these.
// AI.md is handled separately in init (new=always, existing=prompt).

export const BASE_LAYER: BaseItem[] = [
  {
    path: 'project-memory/README.md',
    template: 'frameworkReadme',
    description: 'framework entrypoint and read order',
  },
  {
    path: 'project-memory/project/overview.md',
    template: 'projectOverview',
    description: 'project identity and goal',
  },
  {
    path: 'project-memory/project/architecture.md',
    template: 'projectArchitecture',
    description: 'system design and tech stack',
  },
  {
    path: 'project-memory/context/decisions.md',
    template: 'contextDecisions',
    description: 'key decisions log',
  },
  {
    path: 'project-memory/tasks/active.md',
    template: 'tasksActive',
    description: 'master task tracker',
  },
  {
    path: 'project-memory/tools/global-tools.md',
    template: 'globalTools',
    description: 'environment setup and global commands',
  },
  {
    path: 'project-memory/data/.gitkeep',
    template: 'gitkeep',
    description: 'shared data assets folder',
  },
  {
    path: 'project-memory/workflows/.gitkeep',
    template: 'gitkeep',
    description: 'workflows folder',
  },
];

// ── Dynamic expansion layer ───────────────────────────────────────────────────
// Added only when trigger condition is met. Never added speculatively.

export const DYNAMIC_RULES: DynamicRule[] = [
  {
    path: 'project-memory/project/brief.md',
    template: 'projectBrief',
    description: 'what and why — project brief',
    trigger: 'newProjectOrWebApp',
  },
  {
    path: 'project-memory/project/plan.md',
    template: 'projectPlan',
    description: 'how and when — high-level roadmap',
    trigger: 'newProject',
  },
  {
    path: 'project-memory/context/current-state.md',
    template: 'contextCurrentState',
    description: 'current operational state',
    trigger: 'existingWithMaturity',
  },
  {
    path: 'project-memory/context/constraints.md',
    template: 'contextConstraints',
    description: 'technical and business constraints',
    trigger: 'existingProject',
  },
  {
    path: 'project-memory/context/dependencies.md',
    template: 'contextDependencies',
    description: 'external services and integrations',
    trigger: 'dockerOrMultiManifest',
  },
  {
    path: 'project-memory/tasks/completed.md',
    template: 'tasksCompleted',
    description: 'completed tasks log',
    trigger: 'existingProject',
  },
  {
    path: 'project-memory/tasks/archive/.gitkeep',
    template: 'gitkeep',
    description: 'task archive folder',
    trigger: 'existingWithMaturity',
  },
];
