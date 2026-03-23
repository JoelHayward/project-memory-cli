import { DetectionResult } from './detector.js';
import { BASE_LAYER, DYNAMIC_RULES, DynamicTrigger } from './rules.js';

// ─── Planner ──────────────────────────────────────────────────────────────────
//
// Pure function. No side effects. Takes a DetectionResult, applies rules,
// returns an ordered ScaffoldPlan. Nothing is written here.

export interface ScaffoldItem {
  /** Path relative to cwd. */
  path: string;
  /** Template key to render. */
  template: string;
  /** Human-readable description for plan output. */
  description: string;
  /** True if this is a dynamic addition (shown separately in plan output). */
  dynamic: boolean;
  /** True if optional (e.g. AI.md in existing project flow). */
  optional?: boolean;
}

export interface ScaffoldPlan {
  projectName: string;
  isExisting: boolean;
  detectedType: string;
  signals: string[];
  base: ScaffoldItem[];
  dynamic: ScaffoldItem[];
}

// ── Trigger evaluation ────────────────────────────────────────────────────────

function triggerFires(trigger: DynamicTrigger, detection: DetectionResult): boolean {
  switch (trigger) {
    case 'newProject':
      return !detection.isExisting;

    case 'newProjectOrWebApp':
      return !detection.isExisting || detection.type === 'web-app';

    case 'existingProject':
      return detection.isExisting;

    case 'existingWithMaturity':
      return detection.isExisting && detection.maturitySignals.length > 0;

    case 'dockerOrMultiManifest':
      return detection.hasDocker || detection.hasMultipleManifests;

    default:
      return false;
  }
}

// ── Main planner ──────────────────────────────────────────────────────────────

export function plan(detection: DetectionResult): ScaffoldPlan {
  const base: ScaffoldItem[] = BASE_LAYER.map(item => ({
    path: item.path,
    template: item.template,
    description: item.description,
    dynamic: false,
  }));

  const dynamic: ScaffoldItem[] = DYNAMIC_RULES
    .filter(rule => triggerFires(rule.trigger, detection))
    .map(rule => ({
      path: rule.path,
      template: rule.template,
      description: rule.description,
      dynamic: true,
    }));

  return {
    projectName: detection.projectName,
    isExisting: detection.isExisting,
    detectedType: detection.type,
    signals: detection.signals,
    base,
    dynamic,
  };
}
