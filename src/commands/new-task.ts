import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { writeFile, touchGitkeep, fileExists, readFile } from '../lib/fs.js';
import { nextId } from '../lib/ids.js';
import {
  taskInstructions,
  taskContext,
  taskOutput,
} from '../lib/templates.js';

export async function newTaskCommand(title: string): Promise<void> {
  const cwd = process.cwd();
  const activePath = path.join(cwd, 'project-memory', 'tasks', 'active.md');

  // Guard: must be an initialized project
  if (!fileExists(activePath)) {
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` first.'));
    process.exit(1);
  }

  const id = nextId(cwd, 'TASK');
  const taskDir = path.join(cwd, 'project-memory', 'tasks', id);

  if (fileExists(taskDir)) {
    console.log(chalk.red(`✖  ${id} already exists.`));
    process.exit(1);
  }

  // ── Create task files ──────────────────────────────────────────────────────
  writeFile(path.join(taskDir, 'instructions.md'), taskInstructions(id, title));
  writeFile(path.join(taskDir, 'context.md'), taskContext(id));
  writeFile(path.join(taskDir, 'output.md'), taskOutput(id));
  touchGitkeep(path.join(taskDir, 'data'));

  // ── Update active.md ───────────────────────────────────────────────────────
  updateActiveTasks(activePath, id, title);

  console.log('');
  console.log(chalk.green(`  ✔  Created ${chalk.bold(id)}: ${title}`));
  console.log('');
  console.log(chalk.dim(`  project-memory/tasks/${id}/`));
  console.log(chalk.dim(`  ├── instructions.md   ← define the work here`));
  console.log(chalk.dim(`  ├── context.md        ← add background and relevant files`));
  console.log(chalk.dim(`  ├── output.md         ← fill in when task is complete`));
  console.log(chalk.dim(`  └── data/`));
  console.log('');
  console.log(chalk.dim(`  project-memory/tasks/active.md updated — ${id} added as "planned"`));
  console.log('');
}

function updateActiveTasks(activePath: string, id: string, title: string): void {
  const current = readFile(activePath);
  const newRow = `| ${id} | ${title} | planned | |`;

  // Insert new row after the table separator line
  const separatorPattern = /(\|[-| :]+\|)\n/;
  if (separatorPattern.test(current)) {
    const updated = current.replace(separatorPattern, `$1\n${newRow}\n`);
    fs.writeFileSync(activePath, updated, 'utf8');
  } else {
    fs.appendFileSync(activePath, `\n${newRow}\n`, 'utf8');
  }
}
