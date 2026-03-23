import chalk from 'chalk';
import { validateProject } from '../lib/validator.js';

export async function validateCommand(): Promise<void> {
  const cwd = process.cwd();
  const result = validateProject(cwd);

  console.log('');
  console.log(chalk.bold('  project-memory validate'));
  console.log('');

  if (result.errors.length === 0) {
    console.log(chalk.green('  ✔  Base structure valid.'));
  }

  if (result.errors.length > 0) {
    console.log(chalk.red(`  ✖  ${result.errors.length} error${result.errors.length > 1 ? 's' : ''}:`));
    for (const err of result.errors) {
      console.log(chalk.red(`     • ${err}`));
    }
  }

  if (result.warnings.length > 0) {
    console.log('');
    console.log(chalk.yellow(`  ⚠  ${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}:`));
    for (const warn of result.warnings) {
      console.log(chalk.yellow(`     • ${warn}`));
    }
  }

  if (result.info.length > 0) {
    console.log('');
    for (const note of result.info) {
      console.log(chalk.dim(`  ℹ  ${note}`));
    }
  }

  console.log('');

  if (!result.valid) {
    process.exit(1);
  }
}
