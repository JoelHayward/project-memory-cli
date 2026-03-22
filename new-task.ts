import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { writeFile, touchGitkeep, fileExists, readFile } from '../lib/fs.js';
import { nextId } from '../lib/ids.js';
import {
  taskInstructions,
  taskContext,
  taskOutput,
  activeTasksRow,
} from '../lib/templates.js';

export async function newTaskCommand(title: string): Promise<void> {
  const rootDir = process.cwd();

  // Guard: must be an initialized project
  if (!fileExists(path.join(rootDir, 'tasks', 'active.md'))) {
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` first.'));
    process.exit(1);
  }

  const id = nextId(rootDir, 'TASK');
  const taskDir = path.join(rootDir, 'tasks', id);

  // Guard: shouldn't happen but protect against duplication
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
  updateActiveTasks(rootDir, id, title);

  console.log(chalk.green(`✔  Created ${chalk.bold(id)}: ${title}`));
  console.log('');
  console.log(chalk.dim(`  tasks/${id}/`));
  console.log(chalk.dim(`  ├── instructions.md   ← define the work here`));
  console.log(chalk.dim(`  ├── context.md        ← add background and relevant files`));
  console.log(chalk.dim(`  ├── output.md         ← fill in when task is complete`));
  console.log(chalk.dim(`  └── data/`));
  console.log('');
  console.log(chalk.dim(`  tasks/active.md updated → ${id} added as "planned"`));
  console.log('');
}

function updateActiveTasks(rootDir: string, id: string, title: string): void {
  const activePath = path.join(rootDir, 'tasks', 'active.md');
  const current = readFile(activePath);
  const newRow = activeTasksRow(id, title);

  // Insert the new row just after the table header (after the separator line)
  // Table format: header line, separator line, then rows
  const separatorPattern = /(\|[-| ]+\|)\n/;
  if (separatorPattern.test(current)) {
    const updated = current.replace(separatorPattern, `$1\n${newRow}\n`);
    fs.writeFileSync(activePath, updated, 'utf8');
  } else {
    // Fallback: just append
    fs.appendFileSync(activePath, `\n${newRow}\n`, 'utf8');
  }
}
