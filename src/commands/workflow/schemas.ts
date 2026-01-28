/**
 * Schemas Command
 *
 * Lists available workflow schemas with descriptions.
 */

import chalk from 'chalk';
import { listSchemasWithInfo } from '../../core/artifact-graph/index.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SchemasOptions {
  json?: boolean;
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function schemasCommand(options: SchemasOptions): Promise<void> {
  const projectRoot = process.cwd();
  const schemas = listSchemasWithInfo(projectRoot);

  if (options.json) {
    console.log(JSON.stringify(schemas, null, 2));
    return;
  }

  console.log('可用的架构:');
  console.log();

  for (const schema of schemas) {
    let sourceLabel = '';
    if (schema.source === 'project') {
      sourceLabel = chalk.cyan(' (项目)');
    } else if (schema.source === 'user') {
      sourceLabel = chalk.dim(' (用户覆盖)');
    }
    console.log(`  ${chalk.bold(schema.name)}${sourceLabel}`);
    console.log(`    ${schema.description}`);
    console.log(`    产出物: ${schema.artifacts.join(' → ')}`);
    console.log();
  }
}
