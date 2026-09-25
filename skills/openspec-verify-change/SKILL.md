---
name: openspec-verify-change
description: 验证实现是否匹配 OpenSpec 变更产出物。当用户想在归档前确认实现完整、正确且连贯时使用。也在用户说 "openspec verify" 或 "opsx verify" 时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

验证实现是否匹配变更产出物（specs、tasks、design）。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**项目检查：** 以下步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（`new change`、`archive`、`sync specs`，或撰写任何产出物文件），确认项目已有根目录：运行 `openspec-cn list --json`（当选择了 store 时加上 `--store <id>`，因为此时 store 就是根目录），并读取 `root`。root 是一个对象表示项目已配置好。`"root": null` 表示尚未配置 —— 这里没有 `openspec/` 目录，而像 `openspec-cn new change` 这样的写入操作会作为副作用创建它。该命令还会以非零状态退出，这是它给出的答案而不是 CLI 坏了，因此请读取 JSON，不要重试或绕过它。

有一种 `"root": null` 与配置无关：当某条 `status` 错误消息以 `中声明` 或 `中的 store 声明无效` 结尾，并指向本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明本项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当作未初始化而跳过下面的分支：请在写入前停下，把该错误的 `message` 和 `fix` 展示给用户。

否则，在没有根目录的情况下，接下来怎么做取决于这个工作流是如何被触发的：

- **自动选用**：这个工作流是你自己选的，用户没有提到 OpenSpec、没有点名这个 skill，也没有运行它的斜杠命令。停止使用 OpenSpec，按平常方式回答请求，就像没安装 OpenSpec 一样。不要要求他们做任何配置，也不要提及 OpenSpec 配置。
- **明确要求 OpenSpec**：用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令。在写入前停下并询问如何继续：为本项目做配置（`openspec-cn init`）、指向他们已有的某个 store（`--store <id>`），还是本次请求不使用 OpenSpec 继续。等待他们的答复。

无论走哪个分支，都绝不能把创建根目录当作副作用：在用户要求之前不要运行 `openspec-cn init`，不要手工创建 `openspec/` 文件，也不要让任何命令创建它。

**Input**: 可选地指定变更名。若省略，检查能否从对话上下文推断。若模糊或歧义，必须提示用户从可用变更中选择。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec-cn list --json` 获取可用变更并让用户选择

   提示时，显示列表返回的所有活跃变更，包括 `status: "no-tasks"` 的变更。
   若可用，包含每个变更使用的 schema。
   将有未完成任务的变更标记为 "(进行中)"。

   始终宣告："使用变更：<name>"，以及如何覆盖（例如 `/openspec-verify-change <other>`）。

2. **检查状态以了解 schema**
   ```bash
   openspec-cn status --change "<name>" --json
   ```
   解析 JSON 以了解：
   - `schemaName`：使用的工作流（例如 "spec-driven"）
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径与范围上下文
   - 此变更存在哪些产出物

3. **获取规划上下文并加载产出物**

   ```bash
   openspec-cn instructions apply --change "<name>" --json
   ```

   这返回变更目录、`contextFiles`（产出物 ID -> 具体文件路径数组）、`taskTrackingConfigured`，以及从 schema 的 `apply.tracks` 配置匹配到的所有可读具体文件聚合出的顶层 `tasks` 和 `progress`。从 `contextFiles` 读取所有可用产出物。

   将 apply 的 `state` 和 `instruction` 视为上下文，而非验证结论。验证过程中不要实现任务或归档变更。

4. **初始化验证报告结构**

   创建包含三个维度的报告结构：
   - **完整性**：跟踪任务和 spec 覆盖
   - **正确性**：跟踪需求实现和场景覆盖
   - **连贯性**：跟踪设计遵循和模式一致性

   每个维度可有 CRITICAL、WARNING 或 SUGGESTION 问题。

   验证是建议性的。尊重有意的省略，例如 `skip_specs: true`、可选的设计文档，以及没有任务追踪的 schema。不要为了得到干净的报告而要求或虚构可选的、被有意省略的产出物。`未验证` 描述的是本报告的局限，不是新的归档前置条件。归档保留其自身的检查与用户确认行为。

   将 schema 未定义的检查、或 status 报告为有意跳过的产出物，标记为**不适用**。当变更中可读的 delta specs 只包含 REMOVED 或 RENAMED 需求而没有 ADDED 或 MODIFIED 需求时，其正确性检查同样**不适用**（见步骤 6）。将它们排除在跳过检查计数和归档就绪评估之外。**未验证**专用于证据缺失或不可用的适用检查。

   若适用检查仅有任务证据可用，只验证任务完成情况，并将其余适用检查（包括**代码模式一致性**）标记为未验证，原因写 "仅有任务证据可用"。

   若产出物无法读取，或不含可用的需求、场景或设计决策，将受影响的检查标记为未验证并写明具体原因。继续执行其余证据支持的检查，但部分检查过的输入集不算完全验证过的检查。需求缺失影响 Spec 覆盖和需求实现映射；场景缺失影响场景覆盖；设计决策缺失影响设计遵循。

5. **验证完整性**

   **任务完成情况**：
   - 若 `taskTrackingConfigured` 为 false，将**任务完成情况**报告为不适用。不要把空的 `tasks` 当作缺失证据。
   - 否则，使用顶层 `tasks` 和 `progress` 字段。它们已经聚合了 `apply.tracks` 匹配到的所有可读具体文件，与被追踪产出物的 ID 无关；不要从 `contextFiles` 的键推断追踪情况。
   - 若 `unavailableTrackingFiles` 非空，将**任务完成情况**标记为未验证，并附上每个不可用路径及原因。可继续使用任何可读的任务证据，但不要从残缺的 `tasks` 和 `progress` 字段推断完成情况。
   - 若 `taskTrackingConfigured` 为 true 且 `tasks` 为空，将**任务完成情况**标记为未验证，并记录 apply 的 `state` 和 `instruction` 中的原因。仅凭非零总数不能确立可评估的任务描述。
   - 从 `progress` 报告已完成与总任务数。
   - 若 `progress.remaining` 大于 0：
     - 为每个列出的未完成任务添加 CRITICAL 问题。若剩余数量超过列出的未完成任务，还要报告没有描述的未完成复选框，并建议补充描述并完成它们。不要仅凭列出的任务推断完成情况。
     - 建议："完成任务：<描述>" 或 "若已实现则标记为完成"

   **Spec 覆盖**：
   - 若 status 因 `skip_specs: true` 标记 spec 产出物被跳过，或 schema 未定义 spec 产出物，将依赖 spec 的检查报告为不适用。
   - 否则，`contextFiles` 以产出物 ID 为键，产出物 ID 来自活跃 schema。若 `contextFiles.specs` 缺失或为空，将 **Spec 覆盖**、**需求实现映射**和**场景覆盖**标记为未验证；不要把它们中的任何一个当作通过。
   - 若 `contextFiles.specs` 中存在 delta specs：
     - 提取所有需求（以 "### Requirement:" 标记，或在 `## RENAMED Requirements` 下列为 `FROM:`/`TO:` 对），并记录每条需求所在的 delta 区块：`## ADDED`、`## MODIFIED`、`## REMOVED` 或 `## RENAMED Requirements`。区块决定检查什么。
     - 对每条 ADDED 或 MODIFIED 需求（MODIFIED 检查 delta 中的文本，而非旧措辞）：
       - 在代码库中搜索与需求相关的关键词
       - 评估实现是否可能存在
     - 若 ADDED 或 MODIFIED 需求似乎未实现：
       - 添加 CRITICAL 问题："未找到需求：<需求名>"
       - 建议："实现需求 X：<描述>"
     - 对每条 REMOVED 需求，变更要求该行为消失，因此反转检查：
       - 在代码库中搜索被移除的行为。`openspec/` 产出物或文档中的匹配，或仅服务于 Migration 说明或某条 ADDED 需求的代码，本身不构成证据。报告任何仍在提供被移除行为的代码路径，包括与 ADDED 需求共享的路径。
       - 找不到实现是预期结果。绝不把 REMOVED 需求报告为 "未找到需求"，也不建议实现它。
       - 若行为仍然存在：
         - 添加 CRITICAL 问题："被移除的需求仍有实现：<需求名>"
         - 建议："移除 <file>:<lines> 处的剩余实现；若该需求有 Migration 说明，请遵循它"
     - 对每条 RENAMED 条目（`FROM:`/`TO:`），名称改变但行为保持，因此检查 TO 需求所保留的该行为：
       - 不要把 FROM 名称报告为缺失，也不要要求重命名代码符号、标识符或文件名。
       - 若 TO 名称也出现在 MODIFIED 下，其行为在彼处对照 MODIFIED 文本检查；此处跳过。
       - 否则，读取主 spec 中 `<planningHome.root>/openspec/specs/<capability-path>/spec.md` 的基线需求，使用与 delta spec 相同的 capability 路径：优先取 FROM 名称下的需求；仅当 FROM 名称不存在（主 spec 已同步）时取 TO 名称。其正文和场景就是 TO 需求所保留行为的证据。
       - 在代码库中搜索该行为并评估是否仍有实现。
       - 若似乎未实现：
         - 添加 CRITICAL 问题："未找到重命名需求：<TO 名称>"
         - 建议："恢复 <TO 名称>（由 <FROM 名称> 重命名而来）的行为；重命名不得改变行为"
       - 若找不到或无法读取基线需求，将该条目的 **Spec 覆盖**标记为未验证并写明原因。绝不把未检查的重命名计为通过。

6. **验证正确性**

   若 delta specs 可读且至少包含一条 REMOVED 或 RENAMED 需求、但没有 ADDED 或 MODIFIED 需求（变更只移除或重命名需求），将**需求实现映射**和**场景覆盖**报告为**不适用**。此类变更的证据就是 Spec 覆盖下的 REMOVED 和 RENAMED 检查（每条 RENAMED 条目在那里对照其基线行为检查），因此不要把这两项检查标记为未验证。完全没有可解析需求的 delta spec 属于不可用证据，而非仅移除的变更：将这些检查标记为未验证。

   **需求实现映射**：
   - 对 delta specs 中的每条 ADDED 或 MODIFIED 需求（REMOVED 条目以及没有 MODIFIED 块的 RENAMED 条目已在 Spec 覆盖下处理）：
     - 在代码库中搜索实现证据
     - 若找到，记录文件路径和行范围
     - 评估实现是否匹配需求意图
     - 若检测到偏离：
       - 添加 WARNING："实现可能偏离 spec：<详情>"
       - 建议："对照需求 X 审查 <file>:<lines>"

   **场景覆盖**：
   - 对 delta specs 中 ADDED 或 MODIFIED 需求下的每个场景（以 "#### Scenario:" 标记）：
     - 检查代码中是否处理了这些条件
     - 检查是否存在覆盖该场景的测试
     - 若场景似乎未覆盖：
       - 添加 WARNING："场景未覆盖：<场景名>"
       - 建议："为场景添加测试或实现：<描述>"
   - 跳过 REMOVED 需求下的场景；该行为本就应消失。

7. **验证连贯性**

   **设计遵循**：
   - 若 schema 未定义 design 产出物，将**设计遵循**报告为不适用。
   - 若 `contextFiles.design` 存在：
     - 提取关键决策（查找 "Decision:"、"Approach:"、"Architecture:" 等章节）
     - 验证实现是否遵循这些决策
     - 若检测到矛盾：
       - 添加 WARNING："未遵循设计决策：<决策>"
       - 建议："更新实现或修订 design.md 以匹配现实"
   - 否则，若 `contextFiles.design` 缺失或为空：将**设计遵循**标记为未验证。有其他支撑产出物时**代码模式一致性**仍然执行；仅有任务的情形仍限于任务完成情况。

   **代码模式一致性**：
   - 若无法识别实现变更，将**代码模式一致性**标记为未验证，并说明缺失的证据。
   - 否则，审查新代码与项目模式的一致性
   - 检查文件命名、目录结构、编码风格
   - 若发现显著偏差：
     - 添加 SUGGESTION："代码模式偏差：<详情>"
     - 建议："考虑遵循项目模式：<示例>"

8. **生成验证报告**

   **汇总记分卡**：
   ```markdown
   ## 验证报告：<change-name>

   ### 汇总
   | 维度         | 状态               |
   |--------------|------------------|
   | 完整性       | X/Y 任务，N 个需求|
   | 正确性       | M/N 需求已覆盖    |
   | 连贯性       | 已遵循/问题       |
   ```

   在每个状态格中，报告已执行检查的结果，每个跳过的检查写 `未验证（<原因>）`。若某维度的全部检查都被跳过，状态格以 `未验证` 开头。绝不把跳过的检查计为通过。最终评估中把每个未验证或部分验证的检查视为跳过。N 只统计 ADDED 和 MODIFIED 需求，REMOVED 和 RENAMED 需求单独报告（例如 "确认 1 项移除，验证 1 项重命名"）。对仅移除或重命名需求的变更，正确性格写 `不适用（无 ADDED 或 MODIFIED 需求）`。

   **按优先级分组的问题**：

   1. **CRITICAL**（归档前必须修复）：
      - 未完成任务
      - 缺失的需求实现
      - 被移除的需求仍有实现
      - 行为不再实现的重命名需求
      - 每个附带具体、可操作的建议

   2. **WARNING**（应修复）：
      - Spec/设计偏离
      - 缺失的场景覆盖
      - 每个附带具体建议

   3. **SUGGESTION**（最好修复）：
      - 模式不一致
      - 次要改进
      - 每个附带具体建议

   **最终评估**：
   - 若有 CRITICAL 问题："发现 X 个严重问题。归档前请修复。"若有检查被跳过，还要列出每个被跳过的检查及其原因。
   - 若无 CRITICAL 问题、有一个或多个警告、且没有检查被跳过："无严重问题。有 Y 个警告需考虑。可归档（带有注明的改进）。"
   - 若仅有建议且没有检查被跳过："无严重问题或警告。有 Z 个建议需考虑。可归档（带有注明的改进）。"
   - 若无任何问题且没有检查被跳过："所有检查通过。可以归档。"
   - 若有检查被跳过且没有 CRITICAL 问题：不要声称可归档。说 "已执行的检查中未发现严重问题。<检查> 未验证：<原因>。"警告数非零时一并给出。
   - 每个最终评估中，建议数非零时都要给出。

**验证启发式**

- **完整性**：聚焦客观清单项（复选框、需求列表）
- **正确性**：使用关键词搜索、文件路径分析、合理推断 - 不要求完全确定
- **连贯性**：寻找明显不一致，不挑剔风格
- **误报**：不确定时，优先 SUGGESTION 而非 WARNING，WARNING 而非 CRITICAL
- **可操作性**：每个问题必须有具体建议，适用时附文件/行引用

**输出格式**

使用清晰的 markdown：
- 表格用于汇总记分卡
- 分组列表用于问题（CRITICAL/WARNING/SUGGESTION）
- 代码引用格式：`file.ts:123`
- 具体、可操作的建议
- 不要模糊建议如"考虑审查"
