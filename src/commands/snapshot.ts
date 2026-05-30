import path from 'path';
import chalk from 'chalk';
import {
  buildSnapshot,
  defaultSnapshotPath,
  isSnapshotReady,
} from '../lib/snapshot.js';
import { writeFile } from '../lib/fs.js';

interface SnapshotOptions {
  stdout?: boolean;
  output?: string;
}

export function snapshotCommand(options: SnapshotOptions = {}): void {
  const cwd = process.cwd();

  if (!isSnapshotReady(cwd)) {
    console.log('');
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` to initialize.'));
    console.log('');
    process.exit(1);
  }

  if (options.stdout && options.output) {
    console.log('');
    console.log(chalk.red('✖  Use either --stdout or --output, not both.'));
    console.log('');
    process.exit(1);
  }

  const markdown = buildSnapshot(cwd);

  if (options.stdout) {
    process.stdout.write(markdown);
    return;
  }

  const outPath = options.output
    ? path.resolve(cwd, options.output)
    : defaultSnapshotPath(cwd);

  writeFile(outPath, markdown);

  console.log('');
  console.log(chalk.green(`  ✔  Snapshot written to ${toDisplayPath(cwd, outPath)}`));
  console.log('');
}

function toDisplayPath(cwd: string, fullPath: string): string {
  const rel = path.relative(cwd, fullPath);
  return rel && !rel.startsWith('..') ? rel : fullPath;
}
