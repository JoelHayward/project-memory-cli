import path from 'path';
import chalk from 'chalk';
import { writeFile, fileExists } from '../lib/fs.js';
import { nextId } from '../lib/ids.js';
import { workflowOverview } from '../lib/templates.js';

export async function newWorkflowCommand(title: string): Promise<void> {
  const rootDir = process.cwd();

  // Guard: must be an initialized project
  if (!fileExists(path.join(rootDir, 'tasks', 'active.md'))) {
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` first.'));
    process.exit(1);
  }

  const id = nextId(rootDir, 'WORKFLOW');
  const workflowDir = path.join(rootDir, 'workflows', id);

  if (fileExists(workflowDir)) {
    console.log(chalk.red(`✖  ${id} already exists.`));
    process.exit(1);
  }

  writeFile(path.join(workflowDir, 'overview.md'), workflowOverview(id, title));

  console.log(chalk.green(`✔  Created ${chalk.bold(id)}: ${title}`));
  console.log('');
  console.log(chalk.dim(`  workflows/${id}/`));
  console.log(chalk.dim(`  └── overview.md   ← define goal, tasks, and completion criteria`));
  console.log('');
}
