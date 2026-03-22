import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile, touchGitkeep, fileExists } from '../lib/fs.js';
import {
  projectOverview,
  projectArchitecture,
  contextDecisions,
  globalTools,
  activeTasks,
} from '../lib/templates.js';

export async function initCommand(projectName?: string): Promise<void> {
  const rootDir = process.cwd();
  const name = projectName || path.basename(rootDir);

  // Guard: don't re-init an existing project
  if (fileExists(path.join(rootDir, 'project', 'overview.md'))) {
    console.log(chalk.yellow('⚠  This directory already contains a project-memory structure.'));
    console.log(chalk.dim('   Run `project-memory validate` to check its health.'));
    process.exit(1);
  }

  const spinner = ora(`Initializing project-memory in ${chalk.bold(name)}...`).start();

  try {
    // ── /project/ ─────────────────────────────────────────────────────────────
    writeFile(path.join(rootDir, 'project', 'overview.md'), projectOverview(name));
    writeFile(path.join(rootDir, 'project', 'architecture.md'), projectArchitecture());

    // ── /context/ ─────────────────────────────────────────────────────────────
    writeFile(path.join(rootDir, 'context', 'decisions.md'), contextDecisions());

    // ── /workflows/ ───────────────────────────────────────────────────────────
    touchGitkeep(path.join(rootDir, 'workflows'));

    // ── /tasks/ ───────────────────────────────────────────────────────────────
    writeFile(path.join(rootDir, 'tasks', 'active.md'), activeTasks());

    // ── /tools/ ───────────────────────────────────────────────────────────────
    writeFile(path.join(rootDir, 'tools', 'global-tools.md'), globalTools(name));

    // ── /data/ ────────────────────────────────────────────────────────────────
    touchGitkeep(path.join(rootDir, 'data'));

    spinner.succeed(chalk.green(`project-memory initialized: ${chalk.bold(name)}`));
    console.log('');
    printTree();
    printNextSteps();
  } catch (err) {
    spinner.fail('Initialization failed.');
    console.error(err);
    process.exit(1);
  }
}

function printTree(): void {
  const lines = [
    chalk.dim('  Structure created:'),
    '',
    '  project/',
    chalk.dim('  ├── overview.md          ← describe your project here'),
    chalk.dim('  └── architecture.md      ← system design and tech stack'),
    '  context/',
    chalk.dim('  └── decisions.md         ← log key decisions here'),
    '  tasks/',
    chalk.dim('  └── active.md            ← master task tracker'),
    '  tools/',
    chalk.dim('  └── global-tools.md      ← commands and environment setup'),
    '  data/',
    chalk.dim('  └── .gitkeep'),
    '  workflows/',
    chalk.dim('  └── .gitkeep'),
    '',
  ];
  lines.forEach((l) => console.log(l));
}

function printNextSteps(): void {
  console.log(chalk.bold('  Next steps:'));
  console.log(chalk.dim('  1. Fill in project/overview.md'));
  console.log(chalk.dim('  2. Add your first task:') + '  project-memory new task "Your task name"');
  console.log(chalk.dim('  3. Validate structure:  ') + '  project-memory validate');
  console.log('');
}
