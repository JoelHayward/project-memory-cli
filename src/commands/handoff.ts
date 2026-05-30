import path from 'path';
import chalk from 'chalk';
import {
  buildHandoff,
  defaultHandoffPath,
  isHandoffReady,
} from '../lib/handoff.js';
import { writeFile } from '../lib/fs.js';

interface HandoffOptions {
  stdout?: boolean;
  output?: string;
}

export function handoffCommand(options: HandoffOptions = {}): void {
  const cwd = process.cwd();

  if (!isHandoffReady(cwd)) {
    console.log('');
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` first.'));
    console.log('');
    process.exit(1);
  }

  if (options.stdout && options.output) {
    console.log('');
    console.log(chalk.red('✖  Use either --stdout or --output, not both.'));
    console.log('');
    process.exit(1);
  }

  const markdown = buildHandoff(cwd);

  if (options.stdout) {
    process.stdout.write(markdown);
    return;
  }

  const outPath = options.output
    ? path.resolve(cwd, options.output)
    : defaultHandoffPath(cwd);

  writeFile(outPath, markdown);

  console.log('');
  console.log(chalk.green(`  ✔  Handoff written to ${toDisplayPath(cwd, outPath)}`));
  console.log(chalk.dim('     Share with the next agent or resume from this file.'));
  console.log('');
}

function toDisplayPath(cwd: string, fullPath: string): string {
  const rel = path.relative(cwd, fullPath);
  return rel && !rel.startsWith('..') ? rel.replace(/\\/g, '/') : fullPath;
}
