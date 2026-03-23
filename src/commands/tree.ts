import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

// ─── Tree Command ─────────────────────────────────────────────────────────────
//
// Prints a deterministic ASCII tree of the project-memory/ directory.
// Pure Node.js fs — no external dependencies.
// Rules: folders first, files second, alphabetical within each group.
// .gitkeep files are hidden. No color. No metadata.

const HIDDEN_FILES = new Set(['.gitkeep', '.DS_Store']);

export function treeCommand(): void {
  const cwd = process.cwd();
  const pmDir = path.join(cwd, 'project-memory');

  if (!fs.existsSync(pmDir)) {
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` to initialize.'));
    process.exit(1);
  }

  console.log('');
  console.log('project-memory/');
  printTree(pmDir, '');
  console.log('');
}

function printTree(dirPath: string, prefix: string): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  // Separate and sort: folders first (alpha), then files (alpha)
  const dirs = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b));

  const files = entries
    .filter(e => e.isFile() && !HIDDEN_FILES.has(e.name))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b));

  const all = [...dirs.map(n => ({ name: n, isDir: true })),
               ...files.map(n => ({ name: n, isDir: false }))];

  for (let i = 0; i < all.length; i++) {
    const item = all[i];
    const isLast = i === all.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    const label = item.isDir ? `${item.name}/` : item.name;
    console.log(`${prefix}${connector}${label}`);

    if (item.isDir) {
      printTree(path.join(dirPath, item.name), prefix + childPrefix);
    }
  }
}
