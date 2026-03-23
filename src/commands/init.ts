import path from 'path';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { detect } from '../lib/detector.js';
import { plan, ScaffoldPlan } from '../lib/planner.js';
import { writeFile, fileExists } from '../lib/fs.js';
import { renderTemplate, TemplateKey, aiMd } from '../lib/templates.js';

// ─── Init Command ─────────────────────────────────────────────────────────────

interface InitOptions {
  new?: boolean;
  existing?: boolean;
  yes?: boolean;
}

export async function initCommand(options: InitOptions = {}): Promise<void> {
  const cwd = process.cwd();

  // Guard: already initialized
  if (fileExists(path.join(cwd, 'project-memory', 'README.md'))) {
    console.log(chalk.yellow('⚠  project-memory is already initialized in this directory.'));
    console.log(chalk.dim('   Run `project-memory validate` to check its health.'));
    console.log(chalk.dim('   Run `project-memory tree` to view the structure.'));
    process.exit(1);
  }

  // ── Step 1: Detect ──────────────────────────────────────────────────────────
  let detection = detect(cwd);

  // Force flags override detection
  if (options.new && options.existing) {
    console.log(chalk.red('✖  Cannot use --new and --existing together.'));
    process.exit(1);
  }
  if (options.new) {
    detection = { ...detection, isExisting: false };
  }
  if (options.existing) {
    detection = { ...detection, isExisting: true };
  }

  // ── Step 2: New project questions ───────────────────────────────────────────
  let projectName = detection.projectName;

  if (!detection.isExisting && !options.yes) {
    projectName = await askQuestion(`Project name [${detection.projectName}]: `);
    if (!projectName.trim()) projectName = detection.projectName;

    const typeAnswer = await askQuestion(
      'Project type (web-app / api / cli / library / other) [other]: '
    );
    if (typeAnswer.trim() === 'web-app') {
      detection = { ...detection, type: 'web-app' };
    }
  }

  detection = { ...detection, projectName };

  // ── Step 3: Build plan ──────────────────────────────────────────────────────
  const scaffold = plan(detection);
  scaffold.projectName = projectName;

  // ── Step 4: Print detection summary + plan ──────────────────────────────────
  printPlan(scaffold);

  // ── Step 5: AI.md prompt (existing projects only) ───────────────────────────
  let writeAiMd = true;
  if (detection.isExisting && !options.yes) {
    const answer = await askQuestion('Add AI.md to repo root? (recommended) [Y/n]: ');
    writeAiMd = answer.trim().toLowerCase() !== 'n';
  }

  // ── Step 6: Confirm ─────────────────────────────────────────────────────────
  if (!options.yes) {
    const confirm = await askQuestion('Proceed with scaffold? (y/n): ');
    if (confirm.trim().toLowerCase() !== 'y') {
      console.log('\n  Nothing written.\n');
      process.exit(0);
    }
  }

  // ── Step 7: Write files ─────────────────────────────────────────────────────
  const spinner = ora('Scaffolding project-memory...').start();
  const skipped: string[] = [];

  try {
    const allItems = [...scaffold.base, ...scaffold.dynamic];

    for (const item of allItems) {
      const fullPath = path.join(cwd, item.path);
      if (fileExists(fullPath)) {
        skipped.push(item.path);
        continue;
      }
      const content = renderTemplate(item.template as TemplateKey, { name: projectName });
      writeFile(fullPath, content);
    }

    // AI.md at repo root
    if (writeAiMd) {
      const aiPath = path.join(cwd, 'AI.md');
      if (fileExists(aiPath)) {
        skipped.push('AI.md');
      } else {
        writeFile(aiPath, aiMd());
      }
    }

    spinner.stop();
    console.log('');
    console.log(chalk.green('  ✔  project-memory initialized successfully.\n'));

    if (skipped.length > 0) {
      console.log(chalk.dim('  Skipped (already exist):'));
      for (const s of skipped) {
        console.log(chalk.dim(`  ↳ ${s} already exists — skipped`));
      }
      console.log('');
    }

    printNextSteps(detection.isExisting);
  } catch (err) {
    spinner.fail('Initialization failed.');
    console.error(err);
    process.exit(1);
  }
}

// ── Plan printer ──────────────────────────────────────────────────────────────

function printPlan(scaffold: ScaffoldPlan): void {
  console.log('');
  console.log(chalk.bold('  ─────────────────────────────────────────'));
  console.log(chalk.bold('  Detected'));
  console.log(chalk.bold('  ─────────────────────────────────────────'));
  console.log(`  Directory:   ${chalk.cyan(scaffold.projectName)}`);
  console.log(`  Existing:    ${scaffold.isExisting ? chalk.yellow('yes') : chalk.green('no')}`);
  if (scaffold.isExisting) {
    console.log(`  Type:        ${scaffold.detectedType}`);
    console.log(`  Signals:     ${scaffold.signals.slice(0, 5).join(', ')}${scaffold.signals.length > 5 ? ', ...' : ''}`);
  }
  console.log('');
  console.log(chalk.bold('  ─────────────────────────────────────────'));
  console.log(chalk.bold('  Scaffold Plan'));
  console.log(chalk.bold('  ─────────────────────────────────────────'));
  console.log(chalk.dim('  Base layer:'));
  for (const item of scaffold.base) {
    console.log(`    ${item.path}`);
  }
  console.log(`    AI.md${scaffold.isExisting ? chalk.dim(' (will prompt)') : ''}`);

  if (scaffold.dynamic.length > 0) {
    console.log('');
    console.log(chalk.dim('  Dynamic additions:'));
    for (const item of scaffold.dynamic) {
      console.log(`    ${item.path}${chalk.dim('   ← ' + item.description)}`);
    }
  }
  console.log('');
}

// ── Next steps ────────────────────────────────────────────────────────────────

function printNextSteps(isExisting: boolean): void {
  console.log(chalk.bold('  Next steps:'));
  if (isExisting) {
    console.log(chalk.dim('  1. Review and fill in project-memory/project/overview.md'));
    console.log(chalk.dim('  2. Update project-memory/context/current-state.md if it was created'));
  } else {
    console.log(chalk.dim('  1. Fill in project-memory/project/overview.md'));
    console.log(chalk.dim('  2. Fill in project-memory/project/brief.md'));
  }
  console.log(chalk.dim('  3. Create your first task:') + '  project-memory new task "Your task"');
  console.log(chalk.dim('  4. Validate the structure:') + '  project-memory validate');
  console.log(chalk.dim('  5. View the structure:    ') + '  project-memory tree');
  console.log('');
}

// ── Prompt helper ─────────────────────────────────────────────────────────────

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(`  ${question}`, answer => {
      rl.close();
      resolve(answer);
    });
  });
}
