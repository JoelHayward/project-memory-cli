import chalk from 'chalk';
import { inspectDoctor, type DoctorFinding } from '../lib/doctor.js';

function formatFinding(f: DoctorFinding): string {
  const icon =
    f.severity === 'fail' ? chalk.red('✖  FAIL') :
    f.severity === 'warn' ? chalk.yellow('⚠  WARN') :
    chalk.green('✔  PASS');

  return `  ${icon}  ${f.message}`;
}

export function doctorCommand(): void {
  const report = inspectDoctor(process.cwd());

  console.log('');
  console.log(chalk.bold('  project-memory doctor'));
  console.log(chalk.dim('  Quality audit for AI agent usefulness'));
  console.log('');

  const actionable = report.findings.filter((f) => f.severity !== 'pass');
  const passes = report.findings.filter((f) => f.severity === 'pass');

  if (actionable.length === 0) {
    console.log(chalk.green('  ✔  PASS  Project memory looks useful for AI agents.'));
  } else {
    for (const finding of actionable.sort((a, b) => a.priority - b.priority)) {
      console.log(formatFinding(finding));
    }
  }

  if (passes.length > 0 && actionable.length > 0) {
    console.log('');
    console.log(chalk.dim(`  (${passes.length} check${passes.length === 1 ? '' : 's'} passed)`));
  }

  console.log('');
  console.log(
    `  Summary: ${chalk.red(`${report.failCount} fail`)}, ` +
    `${chalk.yellow(`${report.warnCount} warn`)}, ` +
    `${chalk.green(`${report.passCount} pass`)}`
  );

  if (report.recommendations.length > 0) {
    console.log('');
    console.log(chalk.bold('  Recommended fixes:'));
    report.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  console.log('');
  console.log(chalk.bold('  AI prompt to fix this:'));
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  for (const line of wrapPrompt(report.aiPrompt, 68)) {
    console.log(`  ${line}`);
  }
  console.log(chalk.dim('  ─────────────────────────────────────────'));
  console.log('');

  if (report.failCount > 0) {
    process.exit(1);
  }
}

function wrapPrompt(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}
