import chalk from 'chalk';
import { inspectStatus } from '../lib/status.js';

export function statusCommand(): void {
  const report = inspectStatus(process.cwd());

  console.log('');
  console.log(chalk.bold('  project-memory status'));
  console.log('');

  console.log(
    `  Layer:       ${report.initialized ? chalk.green('initialized') : chalk.yellow('not initialized')}`
  );
  console.log(
    `  AI.md:       ${report.hasAiMd ? chalk.green('present') : chalk.dim('missing (optional)')}`
  );
  console.log('');

  if (!report.initialized) {
    console.log(chalk.dim('  project-memory/ not found.'));
    console.log('');
    console.log(chalk.bold('  → Next:') + ` ${report.suggestedAction}`);
    console.log('');
    return;
  }

  console.log(chalk.dim('  Core files:'));
  for (const file of report.coreFiles) {
    const label = file.optional ? `${file.relPath} (optional)` : file.relPath;

    if (!file.exists) {
      console.log(chalk.red(`    ✖  ${label}`));
      continue;
    }

    const suffix = file.hasPlaceholders ? chalk.yellow(' — placeholders') : '';
    console.log(chalk.green(`    ✔  ${label}`) + suffix);
  }

  console.log('');
  console.log(`  Tasks:       ${report.taskCount} TASK-NNN folder${report.taskCount === 1 ? '' : 's'}`);
  console.log(
    `  Workflows:   ${report.workflowCount} WORKFLOW-NNN folder${report.workflowCount === 1 ? '' : 's'}`
  );

  if (report.placeholdersIn.length > 0) {
    console.log('');
    console.log(chalk.yellow('  Placeholders:'));
    for (const rel of report.placeholdersIn) {
      console.log(chalk.yellow(`     • project-memory/${rel}`));
    }
  }

  console.log('');
  console.log(chalk.bold('  → Next:') + ` ${report.suggestedAction}`);
  console.log('');
}
