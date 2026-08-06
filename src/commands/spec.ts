import { program } from 'commander';
import { existsSync, readFileSync } from 'fs';
import path, { join } from 'path';
import { MarkdownParser } from '../core/parsers/markdown-parser.js';
import { Validator } from '../core/validation/validator.js';
import type { Spec } from '../core/schemas/index.js';
import type { RootOutput } from '../core/root-selection.js';
import { isInteractive } from '../utils/interactive.js';
import { getSpecIds } from '../utils/item-discovery.js';
import { discoverSpecFiles } from '../utils/spec-discovery.js';
import { FileSystemUtils } from '../utils/file-system.js';

const SPECS_DIR = 'openspec/specs';

function assertSpecPath(specsDir: string, specPath: string): void {
  const relativePath = path.relative(path.resolve(specsDir), path.resolve(specPath));
  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`路径位于允许的目录之外：${specPath}`);
  }

  try {
    // Preserve confined spec.md links, including links to a sibling capability.
    FileSystemUtils.assertPathWithin(specsDir, specPath);
  } catch {
    // A capability directory may intentionally be a monorepo symlink. Treat it
    // as the trust root while still rejecting a link outside that capability.
    FileSystemUtils.assertPathWithin(path.dirname(specPath), specPath);
  }
}

interface ShowOptions {
  json?: boolean;
  // JSON-only filters (raw-first text has no filters)
  requirements?: boolean;
  scenarios?: boolean; // --no-scenarios sets this to false (JSON only)
  requirement?: string; // JSON only
  noInteractive?: boolean;
  rootOutput?: RootOutput;
}

function parseSpecFromFile(specsDir: string, specPath: string, specId: string): Spec {
  assertSpecPath(specsDir, specPath);
  const content = readFileSync(specPath, 'utf-8');
  const parser = new MarkdownParser(content);
  return parser.parseSpec(specId);
}

function validateRequirementIndex(spec: Spec, requirementOpt?: string): number | undefined {
  if (!requirementOpt) return undefined;
  const index = Number.parseInt(requirementOpt, 10);
  if (!Number.isInteger(index) || index < 1 || index > spec.requirements.length) {
    throw new Error(`未找到需求 ${requirementOpt}`);
  }
  return index - 1; // convert to 0-based
}

function filterSpec(spec: Spec, options: ShowOptions): Spec {
  const requirementIndex = validateRequirementIndex(spec, options.requirement);
  const includeScenarios = options.scenarios !== false && !options.requirements;

  const filteredRequirements = (requirementIndex !== undefined
    ? [spec.requirements[requirementIndex]]
    : spec.requirements
  ).map(req => ({
    text: req.text,
    scenarios: includeScenarios ? req.scenarios : [],
  }));

  const metadata = spec.metadata ?? { version: '1.0.0', format: 'openspec' as const };

  return {
    name: spec.name,
    overview: spec.overview,
    requirements: filteredRequirements,
    metadata,
  };
}

/**
 * Print the raw markdown content for a spec file without any formatting.
 * Raw-first behavior ensures text mode is a passthrough for deterministic output.
 */
function printSpecTextRaw(specsDir: string, specPath: string): void {
  assertSpecPath(specsDir, specPath);
  const content = readFileSync(specPath, 'utf-8');
  console.log(content);
}

export class SpecCommand {
  private specsDir: string;
  private rootPath?: string;

  // rootPath is set only by root-aware callers (top-level `show`); the
  // deprecated noun-form commands stay cwd-based.
  constructor(rootPath?: string) {
    this.rootPath = rootPath;
    this.specsDir = rootPath ? join(rootPath, 'openspec', 'specs') : SPECS_DIR;
  }

  async show(specId?: string, options: ShowOptions = {}): Promise<void> {
    if (!specId) {
      const canPrompt = isInteractive(options);
      const specIds = await getSpecIds(this.rootPath ?? process.cwd());
      if (canPrompt && specIds.length > 0) {
        const { select } = await import('@inquirer/prompts');
        specId = await select({
          message: '选择要显示的规范',
          choices: specIds.map(id => ({ name: id, value: id })),
        });
      } else {
        throw new Error('缺少必需参数 <spec-id>');
      }
    }

    const specPath = join(this.specsDir, specId, 'spec.md');
    assertSpecPath(this.specsDir, specPath);
    if (!existsSync(specPath)) {
      // Root-aware callers get the absolute path; the cwd-based noun form
      // keeps its historical forward-slash relative message on all platforms.
      const displayPath = this.rootPath ? specPath : `openspec/specs/${specId}/spec.md`;
      throw new Error(`未找到规范 '${specId}'，路径：${displayPath}`);
    }

    if (options.json) {
      if (options.requirements && options.requirement) {
        throw new Error('选项 --requirements 和 --requirement 不能同时使用');
      }
      const parsed = parseSpecFromFile(this.specsDir, specPath, specId);
      const filtered = filterSpec(parsed, options);
      const output = {
        id: specId,
        title: parsed.name,
        overview: parsed.overview,
        requirementCount: filtered.requirements.length,
        requirements: filtered.requirements,
        metadata: parsed.metadata ?? { version: '1.0.0', format: 'openspec' as const },
        ...(options.rootOutput ? { root: options.rootOutput } : {}),
      };
      console.log(JSON.stringify(output, null, 2));
      return;
    }
    printSpecTextRaw(this.specsDir, specPath);
  }
}

export function registerSpecCommand(rootProgram: typeof program) {
  const specCommand = rootProgram
    .command('spec')
    .description('管理和查看OpenSpec规范');

  // Deprecation notice for noun-based commands
  specCommand.hook('preAction', () => {
    console.error('警告："openspec-cn spec ..." 命令已弃用。请使用动词开头的命令（例如："openspec-cn show"、"openspec-cn validate --specs"）。');
  });

  specCommand
    .command('show [spec-id]')
    .description('显示特定规范')
    .option('--json', '以JSON格式输出')
    .option('--requirements', '仅JSON：仅显示需求（排除场景）')
    .option('--no-scenarios', '仅JSON：排除场景内容')
    .option('-r, --requirement <id>', '仅JSON：按ID显示特定需求（从1开始）')
    .option('--no-interactive', '禁用交互式提示')
    .action(async (specId: string | undefined, options: ShowOptions & { noInteractive?: boolean }) => {
      try {
        const cmd = new SpecCommand();
        await cmd.show(specId, options as any);
      } catch (error) {
        console.error(`错误：${error instanceof Error ? error.message : '未知错误'}`);
        process.exitCode = 1;
      }
    });

  specCommand
    .command('list')
    .description('列出所有可用的规范')
    .option('--json', '以JSON格式输出')
    .option('--long', '显示id和标题及计数')
    .action(async (options: { json?: boolean; long?: boolean }) => {
      try {
        if (!existsSync(SPECS_DIR)) {
          console.log('未找到项目');
          return;
        }

        const discovered = await discoverSpecFiles(SPECS_DIR);
        const specs = discovered
          .map(({ id, specFile }) => {
            try {
              assertSpecPath(SPECS_DIR, specFile);
              const spec = parseSpecFromFile(SPECS_DIR, specFile, id);

              return {
                id,
                title: spec.name,
                requirementCount: spec.requirements.length
              };
            } catch {
              return {
                id,
                title: id,
                requirementCount: 0
              };
            }
          })
          .sort((a, b) => a.id.localeCompare(b.id));

        if (options.json) {
          console.log(JSON.stringify(specs, null, 2));
        } else {
          if (specs.length === 0) {
            console.log('未找到项目');
            return;
          }
          if (!options.long) {
            specs.forEach(spec => console.log(spec.id));
            return;
          }
          specs.forEach(spec => {
            console.log(`${spec.id}: ${spec.title} [需求 ${spec.requirementCount}]`);
          });
        }
      } catch (error) {
        console.error(`错误：${error instanceof Error ? error.message : '未知错误'}`);
        process.exitCode = 1;
      }
    });

  specCommand
    .command('validate [spec-id]')
    .description('验证规范结构')
    .option('--strict', '启用严格验证模式')
    .option('--json', '以JSON格式输出验证报告')
    .option('--no-interactive', '禁用交互式提示')
    .action(async (specId: string | undefined, options: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
      try {
        if (!specId) {
          const canPrompt = isInteractive(options);
          const specIds = await getSpecIds();
          if (canPrompt && specIds.length > 0) {
            const { select } = await import('@inquirer/prompts');
            specId = await select({
              message: '选择要验证的规范',
              choices: specIds.map(id => ({ name: id, value: id })),
            });
          } else {
            throw new Error('缺少必需参数 <spec-id>');
          }
        }

        const specPath = join(SPECS_DIR, specId, 'spec.md');
assertSpecPath(SPECS_DIR, specPath);

        if (!existsSync(specPath)) {
          throw new Error(`未找到规范 '${specId}'，路径：openspec/specs/${specId}/spec.md`);
        }

        const validator = new Validator(options.strict);
        assertSpecPath(SPECS_DIR, specPath);
        const report = await validator.validateSpec(specPath);

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          if (report.valid) {
            console.log(`规范 '${specId}' 有效`);
          } else {
            console.error(`规范 '${specId}' 存在问题`);
            report.issues.forEach(issue => {
              const label = issue.level === 'ERROR' ? 'ERROR' : issue.level;
              const prefix = issue.level === 'ERROR' ? '✗' : issue.level === 'WARNING' ? '⚠' : 'ℹ';
              console.error(`${prefix} [${label}] ${issue.path}: ${issue.message}`);
            });
          }
        }
        process.exitCode = report.valid ? 0 : 1;
      } catch (error) {
        console.error(`错误：${error instanceof Error ? error.message : '未知错误'}`);
        process.exitCode = 1;
      }
    });

  return specCommand;
}
