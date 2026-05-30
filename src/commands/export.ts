import path from 'path';
import chalk from 'chalk';
import {
  buildProjectMemoryIndex,
  defaultIndexPath,
  isExportReady,
  serializeProjectMemoryIndex,
} from '../lib/export-index.js';
import { writeFile } from '../lib/fs.js';

interface ExportOptions {
  json?: boolean;
  stdout?: boolean;
  output?: string;
}

export function exportCommand(options: ExportOptions = {}): void {
  const cwd = process.cwd();

  if (!options.json) {
    console.log('');
    console.log(chalk.red('✖  Specify --json to export a machine-readable index.'));
    console.log(chalk.dim('   Example: project-memory export --json'));
    console.log('');
    process.exit(1);
  }

  if (!isExportReady(cwd)) {
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

  const index = buildProjectMemoryIndex(cwd);
  const json = serializeProjectMemoryIndex(index);

  if (options.stdout) {
    process.stdout.write(json);
    return;
  }

  const outPath = options.output
    ? path.resolve(cwd, options.output)
    : defaultIndexPath(cwd);

  writeFile(outPath, json);

  console.log('');
  console.log(chalk.green(`  ✔  JSON index written to ${toDisplayPath(cwd, outPath)}`));
  console.log(chalk.dim('     Markdown remains the source of truth.'));
  console.log('');
}

function toDisplayPath(cwd: string, fullPath: string): string {
  const rel = path.relative(cwd, fullPath);
  return rel && !rel.startsWith('..') ? rel.replace(/\\/g, '/') : fullPath;
}
