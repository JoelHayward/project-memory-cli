#!/usr/bin/env node

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { newTaskCommand } from './commands/new-task.js';
import { newWorkflowCommand } from './commands/new-workflow.js';
import { validateCommand } from './commands/validate.js';
import { statusCommand } from './commands/status.js';
import { doctorCommand } from './commands/doctor.js';
import { snapshotCommand } from './commands/snapshot.js';
import { agentCommand } from './commands/agent.js';
import { exportCommand } from './commands/export.js';
import { handoffCommand } from './commands/handoff.js';
import { treeCommand } from './commands/tree.js';

const program = new Command();

const pkgDir = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(pkgDir, '..', 'package.json'), 'utf8')) as {
  version: string;
};

program
  .name('project-memory')
  .description(
    'Local-first, Git-tracked project memory for AI coding agents.\n' +
    chalk.dim('  Read project-memory before work; update it after.')
  )
  .version(pkg.version);

// ── project-memory init ───────────────────────────────────────────────────────
program
  .command('init')
  .description('Detect, plan, confirm, and scaffold project-memory structure')
  .option('--new', 'Force new project flow')
  .option('--existing', 'Force existing project flow')
  .option('-y, --yes', 'Skip confirmation prompt (still prints plan)')
  .action(async (options: { new?: boolean; existing?: boolean; yes?: boolean }) => {
    await initCommand(options);
  });

// ── project-memory new ────────────────────────────────────────────────────────
const newCmd = program.command('new').description('Create a new task or workflow');

newCmd
  .command('task <title>')
  .description('Create a new task folder and update active.md')
  .action(async (title: string) => {
    await newTaskCommand(title);
  });

newCmd
  .command('workflow <title>')
  .description('Create a new workflow folder')
  .action(async (title: string) => {
    await newWorkflowCommand(title);
  });

// ── project-memory validate ───────────────────────────────────────────────────
program
  .command('validate')
  .description('Validate the project-memory structure against the base layer spec')
  .action(async () => {
    await validateCommand();
  });

// ── project-memory status ─────────────────────────────────────────────────────
program
  .command('status')
  .description('Summarize project-memory readiness (state, not structure)')
  .action(() => {
    statusCommand();
  });

// ── project-memory doctor ─────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Audit project-memory quality and usefulness for AI agents')
  .action(() => {
    doctorCommand();
  });

// ── project-memory snapshot ───────────────────────────────────────────────────
program
  .command('snapshot')
  .description('Generate a concise agent-readable context snapshot')
  .option('--stdout', 'Print snapshot to stdout instead of writing a file')
  .option('--output <path>', 'Write snapshot to the specified path')
  .action((options: { stdout?: boolean; output?: string }) => {
    snapshotCommand(options);
  });

// ── project-memory agent ────────────────────────────────────────────────────────
program
  .command('agent <target>')
  .description('Generate AI-tool-specific instruction files (generic, agents, claude, cursor, all)')
  .option('--force', 'Overwrite existing instruction files')
  .action((target: string, options: { force?: boolean }) => {
    agentCommand(target, options);
  });

// ── project-memory export ───────────────────────────────────────────────────────
program
  .command('export')
  .description('Export machine-readable JSON index from project-memory markdown')
  .option('--json', 'Export JSON index (markdown remains source of truth)')
  .option('--stdout', 'Print JSON to stdout instead of writing a file')
  .option('--output <path>', 'Write JSON to the specified path')
  .action((options: { json?: boolean; stdout?: boolean; output?: string }) => {
    exportCommand(options);
  });

// ── project-memory handoff ──────────────────────────────────────────────────────
program
  .command('handoff')
  .description('Create a concise session handoff note for the next agent or human')
  .option('--stdout', 'Print handoff to stdout instead of writing a file')
  .option('--output <path>', 'Write handoff to the specified path')
  .action((options: { stdout?: boolean; output?: string }) => {
    handoffCommand(options);
  });

// ── project-memory tree ───────────────────────────────────────────────────────
program
  .command('tree')
  .description('Print an ASCII tree of the project-memory/ structure')
  .action(() => {
    treeCommand();
  });

// ── Help text ─────────────────────────────────────────────────────────────────
program.addHelpText(
  'after',
  `
${chalk.bold('AI-first workflow:')}
  ${chalk.dim('Agents read project-memory/ before work and update it after.')}
  ${chalk.dim('See README: https://github.com/JoelHayward/project-memory-cli#ai-first-workflow')}

${chalk.bold('Examples:')}
  ${chalk.dim('$')} project-memory init
  ${chalk.dim('$')} project-memory init --new
  ${chalk.dim('$')} project-memory init --existing --yes
  ${chalk.dim('$')} project-memory new task "Build login page"
  ${chalk.dim('$')} project-memory new workflow "User onboarding"
  ${chalk.dim('$')} project-memory validate
  ${chalk.dim('$')} project-memory status
  ${chalk.dim('$')} project-memory doctor
  ${chalk.dim('$')} project-memory snapshot
  ${chalk.dim('$')} project-memory snapshot --stdout
  ${chalk.dim('$')} project-memory agent agents
  ${chalk.dim('$')} project-memory agent all
  ${chalk.dim('$')} project-memory export --json
  ${chalk.dim('$')} project-memory export --json --stdout
  ${chalk.dim('$')} project-memory handoff
  ${chalk.dim('$')} project-memory handoff --stdout
  ${chalk.dim('$')} project-memory tree

${chalk.bold('Package & docs:')}
  ${chalk.dim('npm: https://www.npmjs.com/package/project-memory-cli')}
  ${chalk.dim('spec: https://github.com/JoelHayward/project-memory-cli/blob/main/SPEC.md')}
`
);

program.parse(process.argv);
