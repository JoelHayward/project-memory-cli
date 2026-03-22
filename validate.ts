import chalk from 'chalk';
import { validateProject } from '../lib/validator.js';

export async function validateCommand(): Promise<void> {
  const rootDir = process.cwd();
  const result = validateProject(rootDir);

  console.log('');
  console.log(chalk.bold('  project-memory validate'));
  console.log('');

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log(chalk.green('  ✔  Structure is valid. No issues found.'));
    console.log('');
    return;
  }

  if (result.errors.length > 0) {
    console.log(chalk.red(`  ✖  ${result.errors.length} error${result.errors.length > 1 ? 's' : ''}:`));
    for (const err of result.errors) {
      console.log(chalk.red(`     • ${err}`));
    }
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow(`  ⚠  ${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}:`));
    for (const warn of result.warnings) {
      console.log(chalk.yellow(`     • ${warn}`));
    }
    console.log('');
  }

  if (!result.valid) {
    process.exit(1);
  }
}
