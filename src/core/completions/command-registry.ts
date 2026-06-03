import { COMMON_FLAGS } from './shared-flags.js';
import type { CommandDefinition } from './types.js';

export const COMMAND_REGISTRY: CommandDefinition[] = [
  {
    name: 'init',
    description: '在您的项目中初始化 OpenSpec',
    acceptsPositional: true,
    positionalType: 'path',
    positionals: [{ name: 'path', type: 'path', optional: true }],
    flags: [
      {
        name: 'tools',
        description: '非交互式配置 AI 工具（例如 "all"、"none" 或以逗号分隔的工具 ID 列表）',
        takesValue: true,
      },
      {
        name: 'force',
        description: 'Auto-cleanup legacy files without prompting',
      },
      {
        name: 'profile',
        description: 'Override global config profile (core or custom)',
        takesValue: true,
        values: ['core', 'custom'],
      },
    ],
  },
  {
    name: 'update',
    description: '更新 OpenSpec 指令文件',
    acceptsPositional: true,
    positionalType: 'path',
    positionals: [{ name: 'path', type: 'path', optional: true }],
    flags: [
      {
        name: 'force',
        description: 'Force update even when tools are up to date',
      },
    ],
  },
  {
    name: 'list',
    description: '列出项目（默认列出变更，使用 --specs 列出规范）',
    flags: [
      {
        name: 'specs',
        description: '列出规范而非变更',
      },
      {
        name: 'changes',
        description: '明确列出变更（默认）',
      },
      {
        name: 'sort',
        description: 'Sort order: "recent" (default) or "name"',
        takesValue: true,
        values: ['recent', 'name'],
      },
      COMMON_FLAGS.json,
    ],
  },
  {
    name: 'view',
    description: '显示规范和变更的交互式仪表板',
    flags: [],
  },
  {
    name: 'validate',
    description: '验证变更和规范',
    acceptsPositional: true,
    positionalType: 'change-or-spec-id',
    positionals: [{ name: 'item-name', type: 'change-or-spec-id', optional: true }],
    flags: [
      {
        name: 'all',
        description: '验证所有变更和规范',
      },
      {
        name: 'changes',
        description: '验证所有变更',
      },
      {
        name: 'specs',
        description: '验证所有规范',
      },
      COMMON_FLAGS.type,
      COMMON_FLAGS.strict,
      COMMON_FLAGS.jsonValidation,
      {
        name: 'concurrency',
        description: '最大并发验证数（默认为环境变量 OPENSPEC_CONCURRENCY 或 6）',
        takesValue: true,
      },
      COMMON_FLAGS.noInteractive,
    ],
  },
  {
    name: 'show',
    description: '显示变更或规范',
    acceptsPositional: true,
    positionalType: 'change-or-spec-id',
    positionals: [{ name: 'item-name', type: 'change-or-spec-id', optional: true }],
    flags: [
      COMMON_FLAGS.json,
      COMMON_FLAGS.type,
      COMMON_FLAGS.noInteractive,
      {
        name: 'deltas-only',
        description: '仅显示增量（仅限 JSON，针对变更）',
      },
      {
        name: 'requirements-only',
        description: '--deltas-only 的别名（已弃用，针对变更）',
      },
      {
        name: 'requirements',
        description: '仅显示需求，排除场景（仅限 JSON，针对规范）',
      },
      {
        name: 'no-scenarios',
        description: '排除场景内容（仅限 JSON，针对规范）',
      },
      {
        name: 'requirement',
        short: 'r',
        description: '按 ID 显示特定需求（仅限 JSON，针对规范）',
        takesValue: true,
      },
    ],
  },
  {
    name: 'archive',
    description: '归档已完成的变更并更新主规范',
    acceptsPositional: true,
    positionalType: 'change-id',
    positionals: [{ name: 'change-name', type: 'change-id', optional: true }],
    flags: [
      {
        name: 'yes',
        short: 'y',
        description: '跳过确认提示',
      },
      {
        name: 'skip-specs',
        description: '跳过规范更新操作',
      },
      {
        name: 'no-validate',
        description: '跳过验证（不推荐）',
      },
    ],
  },
  {
    name: 'status',
    description: 'Display artifact completion status for a change',
    flags: [
      {
        name: 'change',
        description: 'Change name to show status for',
        takesValue: true,
      },
      {
        name: 'schema',
        description: 'Schema override',
        takesValue: true,
      },
      COMMON_FLAGS.json,
    ],
  },
  {
    name: 'instructions',
    description: 'Output enriched instructions for creating an artifact or applying tasks',
    acceptsPositional: true,
    positionals: [{ name: 'artifact', optional: true }],
    flags: [
      {
        name: 'change',
        description: 'Change name',
        takesValue: true,
      },
      {
        name: 'schema',
        description: 'Schema override',
        takesValue: true,
      },
      COMMON_FLAGS.json,
    ],
  },
  {
    name: 'templates',
    description: 'Show resolved template paths for all artifacts in a schema',
    flags: [
      {
        name: 'schema',
        description: 'Schema to use',
        takesValue: true,
      },
      COMMON_FLAGS.json,
    ],
  },
  {
    name: 'schemas',
    description: 'List available workflow schemas with descriptions',
    flags: [
      COMMON_FLAGS.json,
    ],
  },
  {
    name: 'new',
    description: 'Create new items',
    flags: [],
    subcommands: [
      {
        name: 'change',
        description: 'Create a new change directory',
        acceptsPositional: true,
        positionals: [{ name: 'name' }],
        flags: [
          {
            name: 'description',
            description: 'Description to add to README.md',
            takesValue: true,
          },
          {
            name: 'goal',
            description: 'Workspace product goal to store with the change',
            takesValue: true,
          },
          {
            name: 'areas',
            description: 'Comma-separated affected workspace link names',
            takesValue: true,
          },
          {
            name: 'initiative',
            description: 'Link the repo-local change to an initiative',
            takesValue: true,
          },
          {
            name: 'store',
            description: 'Context store id for --initiative',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root for --initiative',
            takesValue: true,
          },
          {
            name: 'schema',
            description: 'Workflow schema to use',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
    ],
  },
  {
    name: 'set',
    description: 'Set checked-in OpenSpec metadata',
    flags: [],
    subcommands: [
      {
        name: 'change',
        description: 'Set repo-local change metadata',
        acceptsPositional: true,
        positionalType: 'change-id',
        positionals: [{ name: 'name', type: 'change-id' }],
        flags: [
          {
            name: 'initiative',
            description: 'Link the repo-local change to an initiative',
            takesValue: true,
          },
          {
            name: 'store',
            description: 'Context store id for --initiative',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root for --initiative',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
    ],
  },
  {
    name: 'workspace',
    description: 'Set up and inspect coordination workspaces',
    flags: [],
    subcommands: [
      {
        name: 'setup',
        description: 'Set up a workspace and link existing repos or folders',
        flags: [
          {
            name: 'name',
            description: 'Workspace name',
            takesValue: true,
          },
          {
            name: 'link',
            description: 'Repo or folder link. Use <path> or <name>=<path>',
            takesValue: true,
          },
          {
            name: 'opener',
            description: 'Preferred opener: codex-cli, claude, github-copilot, or editor',
            takesValue: true,
            values: ['codex-cli', 'claude', 'github-copilot', 'editor'],
          },
          {
            name: 'tools',
            description: 'Install OpenSpec skills for agents (all, none, or comma-separated tool IDs)',
            takesValue: true,
          },
          COMMON_FLAGS.json,
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'list',
        description: 'List known OpenSpec workspaces',
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'ls',
        description: 'List known OpenSpec workspaces',
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'link',
        description: 'Link an existing repo or folder to a workspace',
        acceptsPositional: true,
        positionals: [
          { name: 'name-or-path', type: 'path', optional: true },
          { name: 'path', type: 'path', optional: true },
        ],
        flags: [
          {
            name: 'workspace',
            description: 'Workspace name from local workspace views',
            takesValue: true,
          },
          COMMON_FLAGS.json,
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'relink',
        description: 'Update the local path for an existing workspace link',
        acceptsPositional: true,
        positionals: [
          { name: 'name' },
          { name: 'path', type: 'path' },
        ],
        flags: [
          {
            name: 'workspace',
            description: 'Workspace name from local workspace views',
            takesValue: true,
          },
          COMMON_FLAGS.json,
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'doctor',
        description: 'Check what a workspace can resolve on this machine',
        flags: [
          {
            name: 'workspace',
            description: 'Workspace name from local workspace views',
            takesValue: true,
          },
          COMMON_FLAGS.json,
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'update',
        description: 'Refresh workspace-local OpenSpec guidance and agent skills',
        acceptsPositional: true,
        positionals: [{ name: 'name', optional: true }],
        flags: [
          {
            name: 'workspace',
            description: 'Workspace name from local workspace views',
            takesValue: true,
          },
          {
            name: 'tools',
            description: 'Select agents for workspace skills-only delivery; global profile selects workflows',
            takesValue: true,
          },
          COMMON_FLAGS.json,
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'open',
        description: 'Open a workspace in an agent or VS Code editor',
        acceptsPositional: true,
        positionals: [{ name: 'name', optional: true }],
        flags: [
          {
            name: 'workspace',
            description: 'Workspace name from local workspace views',
            takesValue: true,
          },
          {
            name: 'initiative',
            description: 'Open an initiative as a local workspace view',
            takesValue: true,
          },
          {
            name: 'store',
            description: 'Context store id for --initiative',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root for --initiative',
            takesValue: true,
          },
          {
            name: 'agent',
            description: 'Use an agent for this session: codex-cli, claude, or github-copilot',
            takesValue: true,
            values: ['codex-cli', 'claude', 'github-copilot'],
          },
          {
            name: 'editor',
            description: 'Open the workspace in VS Code editor mode',
          },
          {
            name: 'prepare-only',
            description: 'Unsupported: preview surfaces belong to a future context/query command',
          },
          COMMON_FLAGS.json,
          {
            name: 'change',
            description: 'Unsupported: change-scoped open belongs to future workspace change planning',
            takesValue: true,
          },
          COMMON_FLAGS.noInteractive,
        ],
      },
    ],
  },
  {
    name: 'context-store',
    description: 'Set up and inspect context stores',
    flags: [],
    subcommands: [
      {
        name: 'setup',
        description: 'Create or register a local context store',
        acceptsPositional: true,
        positionals: [{ name: 'id', optional: true }],
        flags: [
          {
            name: 'path',
            description: 'Directory to use for the context store',
            takesValue: true,
          },
          {
            name: 'init-git',
            description: 'Initialize a Git repository in the context store',
          },
          {
            name: 'no-init-git',
            description: 'Skip Git repository initialization',
          },
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'register',
        description: 'Register an existing context store directory',
        acceptsPositional: true,
        positionals: [{ name: 'path', type: 'path', optional: true }],
        flags: [
          {
            name: 'id',
            description: 'Context store id',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'unregister',
        description: 'Forget a local context-store registration without deleting files',
        acceptsPositional: true,
        positionals: [{ name: 'id' }],
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'remove',
        description: 'Forget a local context-store registration and delete its local folder',
        acceptsPositional: true,
        positionals: [{ name: 'id' }],
        flags: [
          {
            name: 'yes',
            description: 'Confirm local context-store folder deletion',
          },
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'list',
        description: 'List registered context stores',
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'ls',
        description: 'List registered context stores',
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'doctor',
        description: 'Check local context-store registration and metadata',
        acceptsPositional: true,
        positionals: [{ name: 'id', optional: true }],
        flags: [
          COMMON_FLAGS.json,
        ],
      },
    ],
  },
  {
    name: 'initiative',
    description: 'Create and list coordinated initiatives',
    flags: [],
    subcommands: [
      {
        name: 'create',
        description: 'Create an initiative in a context store',
        acceptsPositional: true,
        positionals: [{ name: 'id', optional: true }],
        flags: [
          {
            name: 'store',
            description: 'Context store id from the local context-store registry',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root',
            takesValue: true,
          },
          {
            name: 'title',
            description: 'Initiative title',
            takesValue: true,
          },
          {
            name: 'summary',
            description: 'Initiative summary',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'show',
        description: 'Show where an initiative lives and how to read it',
        acceptsPositional: true,
        positionals: [{ name: 'id' }],
        flags: [
          {
            name: 'store',
            description: 'Context store id from the local context-store registry',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'list',
        description: 'List initiatives across registered context stores',
        flags: [
          {
            name: 'store',
            description: 'Context store id from the local context-store registry',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'ls',
        description: 'List initiatives across registered context stores',
        flags: [
          {
            name: 'store',
            description: 'Context store id from the local context-store registry',
            takesValue: true,
          },
          {
            name: 'store-path',
            description: 'Existing local context store root',
            takesValue: true,
          },
          COMMON_FLAGS.json,
        ],
      },
    ],
  },
  {
    name: 'feedback',
    description: '提交关于 OpenSpec 的反馈',
    acceptsPositional: true,
    positionals: [{ name: 'message' }],
    flags: [
      {
        name: 'body',
        description: '反馈的详细描述',
        takesValue: true,
      },
    ],
  },
  {
    name: 'change',
    description: '管理 OpenSpec 变更提案（已弃用）',
    flags: [],
    subcommands: [
      {
        name: 'show',
        description: '显示变更提案',
        acceptsPositional: true,
        positionalType: 'change-id',
        positionals: [{ name: 'change-name', type: 'change-id', optional: true }],
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'deltas-only',
            description: '仅显示增量（仅限 JSON）',
          },
          {
            name: 'requirements-only',
            description: '--deltas-only 的别名（已弃用）',
          },
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'list',
        description: '列出所有活动变更（已弃用）',
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'long',
            description: '显示 ID、标题及计数',
          },
        ],
      },
      {
        name: 'validate',
        description: '验证变更提案',
        acceptsPositional: true,
        positionalType: 'change-id',
        positionals: [{ name: 'change-name', type: 'change-id', optional: true }],
        flags: [
          COMMON_FLAGS.strict,
          COMMON_FLAGS.jsonValidation,
          COMMON_FLAGS.noInteractive,
        ],
      },
    ],
  },
  {
    name: 'spec',
    description: '管理 OpenSpec 规范',
    flags: [],
    subcommands: [
      {
        name: 'show',
        description: '显示规范',
        acceptsPositional: true,
        positionalType: 'spec-id',
        positionals: [{ name: 'spec-id', type: 'spec-id', optional: true }],
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'requirements',
            description: '仅显示需求，排除场景（仅限 JSON）',
          },
          {
            name: 'no-scenarios',
            description: '排除场景内容（仅限 JSON）',
          },
          {
            name: 'requirement',
            short: 'r',
            description: '按 ID 显示特定需求（仅限 JSON）',
            takesValue: true,
          },
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'list',
        description: '列出所有规范',
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'long',
            description: '显示 ID、标题及计数',
          },
        ],
      },
      {
        name: 'validate',
        description: '验证规范',
        acceptsPositional: true,
        positionalType: 'spec-id',
        positionals: [{ name: 'spec-id', type: 'spec-id', optional: true }],
        flags: [
          COMMON_FLAGS.strict,
          COMMON_FLAGS.jsonValidation,
          COMMON_FLAGS.noInteractive,
        ],
      },
    ],
  },
  {
    name: 'completion',
    description: '管理 OpenSpec CLI 的 Shell 补全',
    flags: [],
    subcommands: [
      {
        name: 'generate',
        description: '为指定的 Shell 生成补全脚本（输出到 stdout）',
        acceptsPositional: true,
        positionalType: 'shell',
        positionals: [{ name: 'shell', type: 'shell', optional: true }],
        flags: [],
      },
      {
        name: 'install',
        description: '安装指定 Shell 的补全脚本',
        acceptsPositional: true,
        positionalType: 'shell',
        positionals: [{ name: 'shell', type: 'shell', optional: true }],
        flags: [
          {
            name: 'verbose',
            description: '显示详细安装输出',
          },
        ],
      },
      {
        name: 'uninstall',
        description: '卸载指定 Shell 的补全脚本',
        acceptsPositional: true,
        positionalType: 'shell',
        positionals: [{ name: 'shell', type: 'shell', optional: true }],
        flags: [
          {
            name: 'yes',
            short: 'y',
            description: '跳过确认提示',
          },
        ],
      },
    ],
  },
  {
    name: 'config',
    description: '查看并修改全局 OpenSpec 配置',
    flags: [
      {
        name: 'scope',
        description: '配置作用域（目前仅支持 "global"）',
        takesValue: true,
        values: ['global'],
      },
    ],
    subcommands: [
      {
        name: 'path',
        description: '显示配置文件位置',
        flags: [],
      },
      {
        name: 'list',
        description: '显示当前所有设置',
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'get',
        description: '获取特定值（原始格式，可用于脚本）',
        acceptsPositional: true,
        positionals: [{ name: 'key' }],
        flags: [],
      },
      {
        name: 'set',
        description: '设置值（自动转换类型）',
        acceptsPositional: true,
        positionals: [{ name: 'key' }, { name: 'value' }],
        flags: [
          {
            name: 'string',
            description: '强制将值存为字符串',
          },
          {
            name: 'allow-unknown',
            description: '允许设置未知的键',
          },
        ],
      },
      {
        name: 'unset',
        description: '移除键（恢复为默认值）',
        acceptsPositional: true,
        positionals: [{ name: 'key' }],
        flags: [],
      },
      {
        name: 'reset',
        description: '将配置重置为默认值',
        flags: [
          {
            name: 'all',
            description: '重置所有配置（必填）',
          },
          {
            name: 'yes',
            short: 'y',
            description: '跳过确认提示',
          },
        ],
      },
      {
        name: 'edit',
        description: '在 $EDITOR 中打开配置文件',
        flags: [],
      },
      {
        name: 'profile',
        description: 'Configure workflow profile (interactive picker or preset shortcut)',
        acceptsPositional: true,
        positionals: [{ name: 'preset', optional: true }],
        flags: [],
      },
    ],
  },
  {
    name: 'schema',
    description: '管理工作流 Schema',
    flags: [],
    subcommands: [
      {
        name: 'which',
        description: '显示 Schema 从何处解析',
        acceptsPositional: true,
        positionalType: 'schema-name',
        positionals: [{ name: 'name', type: 'schema-name', optional: true }],
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'all',
            description: '列出所有 Schema 及其解析来源',
          },
        ],
      },
      {
        name: 'validate',
        description: '验证 Schema 结构和模板',
        acceptsPositional: true,
        positionalType: 'schema-name',
        positionals: [{ name: 'name', type: 'schema-name', optional: true }],
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'verbose',
            description: '显示详细的验证步骤',
          },
        ],
      },
      {
        name: 'fork',
        description: '复制现有 Schema 到项目以进行自定义',
        acceptsPositional: true,
        positionalType: 'schema-name',
        positionals: [
          { name: 'source', type: 'schema-name' },
          { name: 'name', optional: true },
        ],
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'force',
            description: '覆盖现有目标',
          },
        ],
      },
      {
        name: 'init',
        description: '创建新的项目本地 Schema',
        acceptsPositional: true,
        positionals: [{ name: 'name' }],
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'description',
            description: 'Schema 描述',
            takesValue: true,
          },
          {
            name: 'artifacts',
            description: '逗号分隔的产出物 ID',
            takesValue: true,
          },
          {
            name: 'default',
            description: '设置为项目默认 Schema',
          },
          {
            name: 'no-default',
            description: '不提示设置为默认',
          },
          {
            name: 'force',
            description: '覆盖现有 Schema',
          },
        ],
      },
    ],
  },
];
