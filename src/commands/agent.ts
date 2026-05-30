import chalk from 'chalk';
import { isAgentTarget } from '../lib/agent-templates.js';
import {
  isProjectMemoryReady,
  resolveAgentTargets,
  writeAgentTargets,
  type AgentWriteResult,
} from '../lib/agent.js';

interface AgentOptions {
  force?: boolean;
}

export function agentCommand(targetArg: string, options: AgentOptions = {}): void {
  const cwd = process.cwd();

  if (!isProjectMemoryReady(cwd)) {
    console.log('');
    console.log(chalk.red('✖  No project-memory structure found.'));
    console.log(chalk.dim('   Run `project-memory init` first.'));
    console.log('');
    process.exit(1);
  }

  if (!isAgentTarget(targetArg)) {
    console.log('');
    console.log(chalk.red(`✖  Unknown agent target: ${targetArg}`));
    console.log(chalk.dim('   Supported: generic, agents, claude, cursor, all'));
    console.log('');
    process.exit(1);
  }

  const targets = resolveAgentTargets(targetArg);
  const results = writeAgentTargets(cwd, targets, options.force ?? false);

  console.log('');
  console.log(chalk.bold('  project-memory agent'));
  console.log('');

  for (const result of results) {
    printResult(result);
  }

  console.log('');
}

function printResult(result: AgentWriteResult): void {
  switch (result.action) {
    case 'created':
      console.log(chalk.green(`  ✔  Created ${result.relPath}`));
      break;
    case 'overwritten':
      console.log(chalk.yellow(`  ↻  Overwritten ${result.relPath}`));
      break;
    case 'skipped':
      console.log(chalk.dim(`  ↳ ${result.relPath} already exists — skipped (use --force to overwrite)`));
      break;
  }
}
