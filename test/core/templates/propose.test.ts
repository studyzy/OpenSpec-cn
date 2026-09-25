import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

import {
  getOpsxProposeSkillTemplate,
  getOpsxProposeCommandTemplate,
  getFfChangeSkillTemplate,
  getOpsxFfCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';
import { loadSchema } from '../../../src/core/artifact-graph/schema.js';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';
import { generateCommand } from '../../../src/core/command-generation/generator.js';
import {
  formatCommandInvocation,
  getInvocationForAdapter,
} from '../../../src/core/command-generation/invocation.js';
import { getCommandContents } from '../../../src/core/shared/skill-generation.js';
import { MAX_CONTEXT_SIZE } from '../../../src/core/project-config.js';
import { resolveOptionalWorkflows } from '../../../src/core/templates/optional-workflow.js';
import { ALL_WORKFLOWS } from '../../../src/core/profiles.js';

// Templates carry optional-workflow conditionals; a body only means anything
// once resolved against a workflow set. Unless a test says otherwise, these are
// the bodies a profile with every workflow installed receives.
const withAll = (body: string) =>
  resolveOptionalWorkflows(body, new Set<string>(ALL_WORKFLOWS));
const withoutApply = (body: string) =>
  resolveOptionalWorkflows(
    body,
    new Set<string>(ALL_WORKFLOWS.filter((id) => id !== 'apply'))
  );

const proposeSkillBody = withAll(getOpsxProposeSkillTemplate().instructions);
const proposeCommandBody = withAll(getOpsxProposeCommandTemplate().content);
const asDeployed = <T extends { instructions: string }>(template: T): T => ({
  ...template,
  instructions: withAll(template.instructions),
});

const proposeBodies: Array<[string, string]> = [
  ['propose skill', generateSkillContent(asDeployed(getOpsxProposeSkillTemplate()), 'TEST')],
  ['propose command', proposeCommandBody],
];

// ff runs the byte-identical artifact loop, so it carries the identical guards.
const loopBodies: Array<[string, string]> = [
  ...proposeBodies,
  ['ff skill', withAll(getFfChangeSkillTemplate().instructions)],
  ['ff command', withAll(getOpsxFfCommandTemplate().content)],
];

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');
const defaultSchema = loadSchema(path.join(repoRoot, 'schemas', 'spec-driven', 'schema.yaml'));

/** The opening list that tells the agent which artifacts propose will produce. */
function artifactPreamble(body: string): string {
  const start = body.indexOf('我将创建你 schema 定义的产出物');
  const end = body.indexOf('当用户准备实现时');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return body.slice(start, end);
}

describe('propose preamble', () => {
  // #788/#1260: the preamble advertised proposal/design/tasks only, so agents
  // treated specs as optional and produced changes with no spec at all.
  // Derived from the schema so a new artifact cannot go unadvertised.
  it('advertises every artifact the default schema defines (#788, #1260)', () => {
    const ids = defaultSchema.artifacts.map(artifact => artifact.id);
    expect(ids).toContain('specs');

    for (const [label, body] of proposeBodies) {
      const preamble = artifactPreamble(body);
      for (const id of ids) {
        expect(preamble, `${label} preamble is missing the "${id}" artifact`).toContain(id);
      }
    }
  });
});

describe('default task guidance', () => {
  it('requires a concrete verification method in each task (#345)', () => {
    const tasks = defaultSchema.artifacts.find(artifact => artifact.id === 'tasks');
    expect(tasks).toBeDefined();
    expect(tasks!.instruction).toContain('每个任务必须（MUST）说明如何验证其已完成');
    expect(tasks!.instruction).toMatch(
      /测试、命令、\s+可观察行为或交付的产物/
    );
    expect(tasks!.instruction).toMatch(
      /把验证方式写进该任务的复选框描述/
    );
    expect(tasks!.instruction).toMatch(
      /只有当需要检查跨越多个实现任务的整体集成或系统行为时，\s+才单独使用一个验证任务/
    );

    const example = tasks!.instruction.match(/```\s*([\s\S]*?)```/)?.[1];
    expect(example).toBeDefined();
    const numberedTasks = example!.split('\n').filter(line => /^- \[ \] \d+\.\d+ /.test(line));
    expect(numberedTasks).toHaveLength(5);
    expect(numberedTasks.every(line => /验证/.test(line))).toBe(true);
    expect(numberedTasks[0]).toContain('预期文件已存在');
    expect(numberedTasks[1]).toContain('包安装成功');
    expect(numberedTasks[2]).toContain('导出测试通过');
    expect(numberedTasks[3]).toContain('单元测试覆盖引号和分隔符');
    expect(numberedTasks[4]).toContain('导出 API 文档');
    expect(example).not.toMatch(/^- \[ \] \d+\.\d+ (?:验证|运行(?:the )?验证)\b/im);
  });

  // #1952: agents parked testing and documentation in one trailing group, so a
  // failure seeded in group 1 only surfaced at the end and cascaded into rework.
  it('keeps tests and documentation inside the group that does the work (#1952)', () => {
    const tasks = defaultSchema.artifacts.find(artifact => artifact.id === 'tasks');
    expect(tasks).toBeDefined();
    expect(tasks!.instruction).toMatch(
      /每个任务组必须（MUST）把其自身工作所需的测试和文档一并完成/
    );
    expect(tasks!.instruction).toMatch(
      /不要（NOT）把测试或文档堆积到最后一个任务组/
    );
    // The rule is scoped to what a group's work actually needs, so the worked
    // example's scaffolding group can carry no tests or docs without
    // contradicting it.
    expect(tasks!.instruction).toMatch(
      /既不需要测试也不需要文档的组（如脚手架或依赖安装）\s*则两者皆可省略/
    );
    expect(tasks!.instruction).toMatch(
      /最后一个任务组只用于集成检查，\s*不用来偿还前面组欠下的测试和文档/
    );

    // The worked example has to show a docs task inside the implementation
    // group, not a trailing "testing and documentation" group of its own.
    const example = tasks!.instruction.match(/```\s*([\s\S]*?)```/)?.[1];
    expect(example).toBeDefined();
    const headings = example!
      .split('\n')
      .filter(line => /^## /.test(line.trim()))
      .map(line => line.trim());
    expect(headings).toHaveLength(2);
    expect(headings.some(heading => /\b(test|testing|documentation|docs)\b|测试|文档/i.test(heading))).toBe(
      false
    );

    const lastGroup = example!.slice(example!.lastIndexOf(headings[headings.length - 1]));
    expect(lastGroup).toMatch(/^- \[ \] \d+\.\d+ 在 docs\/export\.md 中编写导出 API/im);
  });
});

describe('propose project context', () => {
  it('loads project context before selecting the schema or creating the change (#1651)', () => {
    for (const [label, body] of proposeBodies) {
      const contextStep = body.indexOf('**加载项目上下文**');
      const schemaStep = body.indexOf('**确定工作流 schema**');
      const createStep = body.indexOf('**创建变更目录**');

      expect(contextStep, `${label} is missing the early context step`).toBeGreaterThanOrEqual(0);
      expect(contextStep, `${label} loads context after schema selection`).toBeLessThan(schemaStep);
      expect(contextStep, `${label} loads context after creating the change`).toBeLessThan(createStep);
    }
  });

  function contextSection(body: string): string {
    return body.slice(body.indexOf('**加载项目上下文**'), body.indexOf('**确定工作流 schema**'));
  }

  it('reads the resolved root and keeps explicit store selection', () => {
    for (const [label, body] of proposeBodies) {
      const section = contextSection(body);
      expect(section, label).toContain('`openspec-cn context --json`');
      expect(section, label).toContain('`openspec-cn context --json --store "<store-id>"`');
      expect(section, label).toContain('返回的 `root.path`');
      expect(section, label).toContain('`<root.path>/openspec/config.yaml`');
      expect(section, label).toContain('仅当 context 返回已解析的 `root.path` 时');
    }
  });

  it('matches config precedence and field validation', () => {
    for (const [label, body] of proposeBodies) {
      const section = contextSection(body);
      expect(section, label).toContain('仅当 `config.yaml` 不存在时才使用 `config.yml`');
      expect(section, label).toContain('若两个文件都不存在，则不加载项目上下文继续');
      expect(section, label).toContain('若 `config.yaml` 不可读或无效，不要回退到 `config.yml`');
      expect(section, label).toContain('可解析为 YAML 对象');
      expect(section, label).toContain('`context` 字段是 UTF-8 编码下');
      expect(section, label).toContain('不超过 51,200 字节的字符串');
      expect(section, label).toContain('应用该字段');
      expect(section, label).toContain('若文件无法读取或解析，或 context 字段无效或过大，则不加载项目上下文继续');
    }
  });

  it('stops without writing and offers initialization when no root is resolved', () => {
    for (const [label, body] of proposeBodies) {
      const section = contextSection(body);
      expect(section, label).toContain('context 报告 `no_openspec_root`');
      expect(section, label).toContain('请停止，不要创建或修改任何文件');
      expect(section, label).toContain('仅针对明确的 OpenSpec 请求才提议 `openspec-cn init`');
      expect(section, label).toContain('等待用户请求初始化');
      expect(section, label).toContain('不要自动初始化，也不要运行 `openspec-cn new change`');
      expect(section, label).toContain('初始化之后，在继续之前重新运行此上下文检查');
      expect(body, label).not.toContain('resolve the implicit root');
    }
  });

  it('preserves the selected store on resolution failures', () => {
    for (const [label, body] of proposeBodies) {
      const section = contextSection(body);
      expect(section, label).toContain('对于其他任何 context 失败，停止并报告错误');
      expect(section, label).toContain('不要在未选定 store 的情况下回退到当前目录');
      expect(section, label).toContain('运行后续 OpenSpec 命令');
    }
  });

  it('applies context before exploration without granting it authority', () => {
    for (const [label, body] of proposeBodies) {
      const section = contextSection(body);
      expect(section, label).toContain('在探索代码库或做出规划决策之前应用该字段');
      expect(section, label).toContain('视为项目提供的数据与约束');
      expect(section, label).toContain('不能覆盖用户授权');
      expect(section, label).toContain('规划边界');
      expect(section, label).toContain('工具限制');
      expect(section, label).toContain('制品与输出规则');
      expect(section, label).toContain('不要把 context 复制进制品');
    }
  });
});

describe('planning code inspection (#339)', () => {
  it('inspects the project after loading instructions and dependencies, before creating or delegating artifacts', () => {
    for (const [label, body] of loopBodies) {
      const instructions = body.indexOf('openspec-cn instructions <artifact-id>');
      const dependencies = body.indexOf('读取所有已完成的依赖文件');
      const inspection = body.indexOf('**起草前先检查相关项目**');
      const delegation = body.indexOf('若 `instruction` 字段将创建委托给特定 skill 或命令');
      expect(instructions, label).toBeGreaterThanOrEqual(0);
      expect(dependencies, label).toBeGreaterThan(instructions);
      expect(inspection, label).toBeGreaterThan(dependencies);
      expect(delegation, label).toBeGreaterThan(inspection);

      const guidance = body.slice(inspection, delegation);
      expect(guidance, label).toContain('先阅读 `context` 和 `rules`');
      expect(guidance, label).toContain('再检查 `openspec/` 之外的相关实现、邻近测试、配置和文档');
      expect(guidance, label).toContain('检查保持只读且与变更规模相称');
      expect(guidance, label).toContain('复用发现结果供后续产出物使用');
      expect(guidance, label).toContain('现在就做这些发现');
    }
  });

  it('handles separate stores, missing code, and uncertain findings without inventing facts', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain('规划主目录可能与代码分离');
      expect(body, label).toContain('若目标不明确，询问用户');
      expect(body, label).toContain('对于绿地项目或非代码变更，检查现有结构和相关文档');
      expect(body, label).toContain('若源码不可用，说明该局限');
      expect(body, label).toContain('区分观察到的行为与假设及建议的新增内容');
      expect(body, label).toContain('与现有规范冲突时显式呈现冲突，而不是默默裁定谁对谁错');
    }
  });

  it('preserves inspection guidance through every command adapter', () => {
    for (const command of getCommandContents(ALL_WORKFLOWS).filter(({ id }) =>
      ['propose', 'ff'].includes(id)
    )) {
      for (const adapter of CommandAdapterRegistry.getAll()) {
        const generated = generateCommand(command, adapter).fileContent;
        const inspection = generated.indexOf('**起草前先检查相关项目**');
        const delegation = generated.indexOf('若 `instruction` 字段将创建委托给特定 skill 或命令');
        const label = `${adapter.toolId} ${command.id}`;
        expect(inspection, label).toBeGreaterThanOrEqual(0);
        expect(delegation, label).toBeGreaterThan(inspection);
        expect(generated, label).toContain('检查保持只读且与变更规模相称');
      }
    }
  });
});

describe('propose implementation boundary', () => {
  it('makes the planning-only boundary prominent (#232, #258, #262)', () => {
    for (const [label, body] of proposeBodies) {
      const boundary = body.indexOf('**规划边界**');
      const steps = body.indexOf('**步骤**');
      expect(boundary, `${label} is missing its planning boundary`).toBeGreaterThanOrEqual(0);
      expect(boundary, `${label} boundary should appear before its steps`).toBeLessThan(steps);
      expect(body, label).toContain(
        '选择或触发此工作流的用户请求仅授权规划'
      );
      expect(body, label).toContain('不要编辑项目代码');
    }
  });

  it('ends by requiring a separate apply workflow (#258, #262)', () => {
    for (const [label, body] of proposeBodies) {
      expect(body, label).toContain(
        '调用此工作流的请求仅授权规划'
      );
      expect(body, label).toContain('不要实现变更');
      expect(body, label).toContain('编辑项目代码');
      expect(body, label).toContain(
        '不要在同一回复中开始实现'
      );
      expect(body, label).toContain(
        '任何实现或 apply 指令不会延续'
      );
      expect(body, label).toContain(
        '等待新用户请求以启动 apply 工作流'
      );
      expect(
        body.lastIndexOf('展示制品后，停止'),
        `${label} should end with its stop guard`
      ).toBeGreaterThan(body.indexOf('**输出**'));
    }
  });

  it('asks before resolving ambiguity that could change user-visible outcomes (#258)', () => {
    for (const [label, body] of proposeBodies) {
      expect(body, label).toContain(
        '范围、外部可见行为、兼容性或验收标准'
      );
      expect(body, label).toContain('在创建变更前询问用户');
      expect(body, label).toContain(
        '对于次要细节，做出合理假设并记录在规划制品中'
      );
      expect(body.indexOf('在创建变更前询问用户'), label)
        .toBeLessThan(body.indexOf('**创建变更目录**'));
    }
  });

  it('hands command-only tools to apply instead of advertising direct coding (#258)', () => {
    expect(proposeCommandBody).toContain('当你准备就绪时，运行 `/opsx:apply`。');
    expect(proposeCommandBody).not.toContain('ask me to implement');
    expect(proposeCommandBody).not.toContain('ask me to apply this change');

    expect(proposeSkillBody).toContain(
      '运行 `/opsx:apply`，或者让我来应用这个变更'
    );
    expect(proposeSkillBody).not.toContain('ask me to implement');
  });

  // The same boundary has to hold when `apply` is not installed: the command
  // surface may name the CLI, never a conversational handoff (#1734).
  it('keeps command-only tools off direct coding when apply is not installed', () => {
    const command = withoutApply(getOpsxProposeCommandTemplate().content);
    const skill = withoutApply(getOpsxProposeSkillTemplate().instructions);
    const ffCommand = withoutApply(getOpsxFfCommandTemplate().content);

    for (const body of [command, skill, ffCommand]) {
      expect(body).not.toContain('/opsx:apply');
    }

    expect(command).toContain(
      '运行 `openspec-cn instructions apply --change "<name>" --json` 获取任务列表'
    );
    expect(command).not.toContain('ask me to implement');
    expect(command).not.toContain('ask me to apply this change');

    expect(ffCommand).toContain(
      '运行 `openspec-cn instructions apply --change "<name>" --json` 获取任务列表'
    );
    expect(ffCommand).not.toContain('ask me to implement');

    expect(skill).toContain('让我来应用这个变更');
    expect(skill).not.toContain('ask me to implement');
  });

  it('preserves planning and initialization boundaries through every command adapter', () => {
    // Resolve against every workflow: this asserts the apply handoff, which
    // is only emitted when `apply` is installed.
    const propose = getCommandContents(ALL_WORKFLOWS).find(({ id }) => id === 'propose');
    expect(propose?.id).toBe('propose');

    for (const adapter of CommandAdapterRegistry.getAll()) {
      const generated = generateCommand(propose, adapter).fileContent;
      const applyInvocation = formatCommandInvocation(
        getInvocationForAdapter(adapter),
        'apply'
      );
      expect(generated, adapter.toolId).toContain(
        '选择或触发此工作流的用户请求仅授权规划'
      );
      expect(generated, adapter.toolId).toContain('不要实现变更');
      expect(generated, adapter.toolId).toContain(
        '不要在同一回复中开始实现'
      );
      expect(generated, adapter.toolId).toContain(
        '任何实现或 apply 指令不会延续'
      );
      expect(generated, adapter.toolId).toContain(
        '等待新用户请求以启动 apply 工作流'
      );
      expect(generated, adapter.toolId).toContain(
        `当你准备就绪时，运行 \`${applyInvocation}\`。`
      );
      expect(generated, adapter.toolId).not.toContain('ask me to implement');
      expect(generated, adapter.toolId).toContain('请停止，不要创建或修改任何文件');
      expect(generated, adapter.toolId).toContain('仅针对明确的 OpenSpec 请求才提议 `openspec-cn init`');
      expect(generated, adapter.toolId).toContain('不要自动初始化，也不要运行 `openspec-cn new change`');
    }
  });
});

describe('propose schema selection', () => {
  // #770: the CLI and new workflow already accept an explicit schema, but
  // propose used to discard that request and always create with the default.
  it('shows both concrete creation forms after an explicit schema choice (#770)', () => {
    for (const [label, body] of proposeBodies) {
      const schemaStep = body.indexOf('**确定工作流 schema**');
      const createStep = body.indexOf('**创建变更目录**');
      const statusStep = body.indexOf('**获取产出物构建顺序**');

      expect(schemaStep, `${label} is missing schema selection`).toBeGreaterThanOrEqual(0);
      expect(createStep, `${label} is missing change creation`).toBeGreaterThan(schemaStep);
      expect(statusStep, `${label} is missing status lookup`).toBeGreaterThan(createStep);

      const createSection = body.slice(createStep, statusStep);
      expect(createSection, label).toMatch(/^\s*openspec-cn new change "<name>"\s*$/m);
      expect(createSection, label).toMatch(
        /^\s*openspec-cn new change "<name>" --schema "<schema-name>"\s*$/m
      );
      expect(createSection, label).toContain(
        '若选中了注册的存储，在该命令及后续每个接受 `--store` 的 OpenSpec 命令中追加'
      );
      expect(createSection, label).not.toContain('every follow-up command');
    }
  });

  it('discovers schemas from the authoritative project or store root', () => {
    for (const [label, body] of proposeBodies) {
      const schemaStep = body.indexOf('**确定工作流 schema**');
      const createStep = body.indexOf('**创建变更目录**');
      const schemaSection = body.slice(schemaStep, createStep);

      expect(schemaSection, label).toContain('使用配置的默认 schema');
      expect(schemaSection, label).toContain('明确按名称请求特定 schema');
      const contextCommand = schemaSection.indexOf('`openspec-cn context --json`');
      const schemasCommand = schemaSection.indexOf('`openspec-cn schemas --json`');
      expect(contextCommand, `${label} is missing root resolution`).toBeGreaterThanOrEqual(0);
      expect(schemasCommand, `${label} lists schemas before resolving the root`).toBeGreaterThan(
        contextCommand
      );
      expect(schemaSection, label).toContain('从当前工作目录');
      expect(schemaSection, label).toContain(
        '`openspec-cn context --json --store "<store-id>"`'
      );
      expect(schemaSection, label).toContain(
        '在其工作目录设置为返回的 `root.path` 的情况下运行 `openspec-cn schemas --json`'
      );
      expect(schemaSection, label).toContain('返回的 `root.path`');
      expect(schemaSection, label).toContain('本地 `store:` 指针');
      expect(schemaSection, label).toContain('全局 `defaultStore`');
      expect(schemaSection, label).toContain(
        '请同样向 `openspec-cn schemas --json` 追加 `--store "<store-id>"`'
      );
      expect(schemaSection, label).not.toContain('`schemas` 不接受 `--store`');
      expect(schemaSection, label).toContain(
        '若 context 失败，按「加载项目上下文」步骤所述停止'
      );
      expect(schemaSection, label).toContain('不要回退到当前目录');
      expect(schemaSection, label).not.toContain('改为从当前工作目录运行 `openspec-cn schemas --json`');
      expect(schemaSection, label).toContain(
        '否则，省略 `--schema` 以保留配置的默认值'
      );
    }
  });
});

describe('artifact loop guards (propose and ff)', () => {
  // `status` is file-existence based (detectCompleted), so writing tasks.md before
  // specs flips tasks to done and satisfies a bare applyRequires stop condition
  // with specs never created. That is the #1260 failure chain.
  it('warns that a done applyRequires artifact does not imply its deps exist (#788, #1260)', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toMatch(/仅基于文件存在性/i);
      expect(body, label).toMatch(/并不意味着其依赖项存在/i);
    }
  });

  // Scoped to the applyRequires closure, not to every `ready` artifact: a custom
  // schema may define artifacts outside it (e.g. a post-implementation retro)
  // that propose has no business creating.
  it('scopes the required set to the applyRequires dependency closure', () => {
    for (const [label, body] of loopBodies) {
      // Names the seed the walk starts from (`from those`) so an agent cannot
      // read it as "every artifact that has requires edges" = the whole list.
      expect(body, label).toContain('通过跟踪 `status --json` 中的 `requires` 边从这些产出物可达的每个产出物');
      // Points at status --json specifically (instructions calls the edges `dependencies`).
      expect(body, label).toContain('`status --json` 中的');
      expect(body, label).toContain('传递地遍历它们');
      expect(body, label).toContain('不要触碰此集合之外的产出物');
    }
  });

  // alfred's PR #1412 blocker: `status --json` must carry the `requires` edges,
  // and the loop must derive the set from those edges rather than from `status`.
  // A `done` artifact hides nothing about its deps if the agent reads its edges.
  it('builds the required set from requires edges, not from status (#1412 review)', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '使用每个产出物的 `requires` 边而非其 `status` 来构建所需集合'
      );
      expect(body, label).toContain('一个 `done` 产出物仍然列出其依赖项');
    }
  });

  // The status-JSON parse list must document the `requires` field the loop relies on.
  it('documents the requires edges in the status JSON it tells the agent to parse', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '每个包含其 `status` 和 `requires` 边'
      );
    }
  });

  it('creates every missing artifact in the set and re-checks for cascades', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain('创建所需集合中缺失的每个产出物');
      expect(body, label).toMatch(/重新检查 - 创建一个可能会解锁其他产出物/i);
    }
  });

  // specs must not be skippable on the agent's own judgment. "Required" is not
  // machine-readable (the graph has tasks requiring both specs and design), but
  // the artifact's own instruction is: spec-driven's design says "create only if
  // any apply", specs says nothing of the kind. The one legitimate way to skip
  // specs is the `skipped` status the CLI reports for a change declaring
  // `skip_specs` (#1399) — a decision the tool makes, never the agent.
  it('permits skipping only artifacts their own instruction marks conditional', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '或其自身 `instruction` 表明是条件性的时才跳过'
      );
      expect(body, label).toContain('不要重新考虑');
    }
  });

  // The skip_specs carve-out must stay explicit in the loop: an artifact the CLI
  // already reports as `skipped` is satisfied and must never be written, or the
  // agent creates spec files that `openspec validate` then rejects as
  // conflicting with the marker (#1399).
  it('treats a `skipped` status as satisfied and never creates it (#1399)', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain('status: "skipped"');
      expect(body, label).toContain('其文件必须不存在');
    }
  });

  // The skip decision hinges on reading the artifact's `instruction` field, so
  // the loop must explicitly tell the agent to fetch it before skipping -
  // otherwise a momentum-driven agent can skip specs without ever checking.
  it('makes the agent fetch and read the instruction field before skipping', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '运行 `openspec-cn instructions <artifact-id> --change "<name>" --json`，仅当其 `instruction` 字段标记为可选时才跳过'
      );
      expect(body, label).toContain('绝不能凭你的判断');
    }
  });

  // The 4b heading must not re-state the buggy stop condition (apply.requires
  // alone); it has to point the agent at the whole required set.
  it('frames the loop around the required set, not apply.requires alone', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '持续创建直到所需集合中的每个产出物都存在（不仅仅是 `apply.requires`）'
      );
      expect(body, label).not.toContain(
        'Continue until every artifact the apply phase depends on exists'
      );
    }
  });

  // The artifact-creation TITLE must not use "apply-ready" either: in the
  // prewritten-tasks case the change is already apply-ready when this step
  // begins, so a title of
  // "create ... until apply-ready" invites the exact early-stop this PR kills.
  it('titles the create step around the required set, not "apply-ready"', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain('**创建所需集合中的每个产出物**');
      expect(body, label).not.toContain('Create artifacts in sequence until apply-ready');
      expect(body, label).not.toMatch(/^\s*4\.\s.*apply-ready/m);
    }
  });

  // Without this the loop deadlocks: skipping design leaves tasks blocked
  // forever, no artifact is ready, and the stop condition can never be met.
  // docs/concepts.md: "Dependencies are enablers, not gates."
  it('authorizes writing a blocked artifact whose only blocker was skipped', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain('依赖项是使能因素而非关卡');
      expect(body, label).toMatch(
        /仍 `blocked` 仅因为你跳过了条件性依赖项，照样写入/
      );
    }
  });

  // The stop condition must cover the whole required set. A bare "stop when
  // applyRequires is done" is the lenient rule #1260 blames.
  it('stops on the whole required set, not on applyRequires alone', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '当所需集合中的每个产出物为 `done`、`skipped` 或已被有意跳过时停止'
      );
      expect(body, label).not.toContain('Stop when all `applyRequires` artifacts are done');
    }
  });

  // The Guardrails section used to define completeness as `apply.requires`,
  // which is exactly the premise this fix refutes.
  it('does not define completeness as apply.requires in the guardrails', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).not.toMatch(
        /Create ALL artifacts needed for implementation \(as defined by schema's `apply\.requires`\)/
      );
      expect(body, label).toMatch(
        /(创建 apply 阶段传递依赖的每个产出物，不仅仅是 `apply\.requires` 中列出的 ID|Create every artifact the apply phase transitively depends on, not just the ids listed in `apply\.requires`)/
      );
    }
  });

  // specs `generates` a glob (specs/**/*.md), so an agent told only to "write it
  // to resolvedOutputPath" would create a directory literally named `**`.
  it('tells the agent how to resolve a glob output path', () => {
    for (const [label, body] of loopBodies) {
      expect(body, label).toContain(
        '是一个 glob，遵循 `instruction` 选择具体文件路径'
      );
    }
  });
});
