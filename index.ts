#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { newTaskCommand } from './commands/new-task.js';
import { newWorkflowCommand } from './commands/new-workflow.js';
import { validateCommand } from './commands/validate.js';

const program = new Command();

program
  .name('project-memory')
  .description(
    'A file-tree standard that makes any AI coding tool more effective.\n' +
    chalk.dim('  The file system is the system.')
  )
  .version('0.1.0');

// ── project-memory init [project-name] ────────────────────────────────────────
program
  .command('init [name]')
  .description('Initialize a project-memory structure in the current directory')
  .action(async (name?: string) => {
    await initCommand(name);
  });

// ── project-memory new task "title" ──────────────────────────────────────────
const newCmd = program.command('new').description('Create a new task or workflow');

newCmd
  .command('task <title>')
  .description('Create a new task')
  .action(async (title: string) => {
    await newTaskCommand(title);
  });

// ── project-memory new workflow "title" ──────────────────────────────────────
newCmd
  .command('workflow <title>')
  .description('Create a new workflow')
  .action(async (title: string) => {
    await newWorkflowCommand(title);
  });

// ── project-memory validate ───────────────────────────────────────────────────
program
  .command('validate')
  .description('Validate the project-memory structure')
  .action(async () => {
    await validateCommand();
  });

// ── Help formatting ───────────────────────────────────────────────────────────
program.addHelpText(
  'after',
  `
${chalk.bold('Examples:')}
  ${chalk.dim('$')} project-memory init
  ${chalk.dim('$')} project-memory init my-app
  ${chalk.dim('$')} project-memory new task "Build login page"
  ${chalk.dim('$')} project-memory new workflow "User onboarding"
  ${chalk.dim('$')} project-memory validate

${chalk.bold('Spec:')}
  ${chalk.dim('https://github.com/your-org/project-memory-cli/blob/main/SPEC.md')}
`
);

program.parse(process.argv);
