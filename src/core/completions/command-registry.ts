import { CommandDefinition, FlagDefinition } from './types.js';

/**
 * Common flags used across multiple commands
 */
const COMMON_FLAGS = {
  json: {
    name: 'json',
    description: '以 JSON 格式输出',
  } as FlagDefinition,
  jsonValidation: {
    name: 'json',
    description: '以 JSON 格式输出验证结果',
  } as FlagDefinition,
  strict: {
    name: 'strict',
    description: '启用严格验证模式',
  } as FlagDefinition,
  noInteractive: {
    name: 'no-interactive',
    description: '禁用交互式提示',
  } as FlagDefinition,
  type: {
    name: 'type',
    description: '当项目类型不明确时指定类型',
    takesValue: true,
    values: ['change', 'spec'],
  } as FlagDefinition,
} as const;

/**
 * Registry of all OpenSpec CLI commands with their flags and metadata.
 * This registry is used to generate shell completion scripts.
 */
export const COMMAND_REGISTRY: CommandDefinition[] = [
  {
    name: 'init',
    description: '在您的项目中初始化 OpenSpec',
    acceptsPositional: true,
    positionalType: 'path',
    flags: [
      {
        name: 'tools',
        description: '非交互式配置 AI 工具（例如 "all"、"none" 或以逗号分隔的工具 ID 列表）',
        takesValue: true,
      },
    ],
  },
  {
    name: 'update',
    description: '更新 OpenSpec 指令文件',
    acceptsPositional: true,
    positionalType: 'path',
    flags: [],
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
    name: 'change',
    description: '管理 OpenSpec 变更提案（已弃用）',
    flags: [],
    subcommands: [
      {
        name: 'show',
        description: '显示变更提案',
        acceptsPositional: true,
        positionalType: 'change-id',
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
        flags: [],
      },
      {
        name: 'install',
        description: '安装指定 Shell 的补全脚本',
        acceptsPositional: true,
        positionalType: 'shell',
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
        flags: [],
      },
      {
        name: 'set',
        description: '设置值（自动转换类型）',
        acceptsPositional: true,
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
    ],
  },
];
