import path from 'path';
import chalk from 'chalk';
import { writeFile, fileExists } from '../lib/fs.js';
import { nextId } from '../lib/ids.js';
import { workflowOverview } from '../lib/templates.js';

export async function newWorkflowCommand(title: string): Promise<void> {
  const cwd = process.cwd();
  const activePath = path.join(cwd, 'project-memory', 'tasks', 'active.md');

  // Guard: must be an initialized project
  if (!fileExists(activePath)) {
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` first.'));
    process.exit(1);
  }

  const id = nextId(cwd, 'WORKFLOW');
  const workflowDir = path.join(cwd, 'project-memory', 'workflows', id);

  if (fileExists(workflowDir)) {
    console.log(chalk.red(`✖  ${id} already exists.`));
    process.exit(1);
  }

  writeFile(path.join(workflowDir, 'overview.md'), workflowOverview(id, title));

  console.log('');
  console.log(chalk.green(`  ✔  Created ${chalk.bold(id)}: ${title}`));
  console.log('');
  console.log(chalk.dim(`  project-memory/workflows/${id}/`));
  console.log(chalk.dim(`  └── overview.md   ← define goal, tasks, and completion criteria`));
  console.log('');
}
