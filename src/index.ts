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
import { treeCommand } from './commands/tree.js';

const program = new Command();

const pkgDir = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(pkgDir, '..', 'package.json'), 'utf8')) as {
  version: string;
};

program
  .name('project-memory')
  .description(
    'A file-tree standard that makes any AI coding tool more effective.\n' +
    chalk.dim('  The file system is the system.')
  )
  .version(pkg.version);

// ── project-memory init ───────────────────────────────────────────────────────
program
  .command('init')
  .description('Detect, plan, confirm, and scaffold project-memory structure')
  .option('--new', 'Force new project flow')
  .option('--existing', 'Force existing project flow')
  .option('--yes, -y', 'Skip confirmation prompt (still prints plan)')
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
${chalk.bold('Examples:')}
  ${chalk.dim('$')} project-memory init
  ${chalk.dim('$')} project-memory init --new
  ${chalk.dim('$')} project-memory init --existing --yes
  ${chalk.dim('$')} project-memory new task "Build login page"
  ${chalk.dim('$')} project-memory new workflow "User onboarding"
  ${chalk.dim('$')} project-memory validate
  ${chalk.dim('$')} project-memory tree

${chalk.bold('Package & docs:')}
  ${chalk.dim('npm: https://www.npmjs.com/package/project-memory-cli')}
  ${chalk.dim('spec: https://github.com/JoelHayward/project-memory-cli/blob/main/SPEC.md')}
`
);

program.parse(process.argv);
