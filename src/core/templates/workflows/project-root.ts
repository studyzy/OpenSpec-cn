/**
 * Shared project-root guidance for skill template workflows.
 *
 * Generated skills and commands are installed once per machine, so they are
 * offered in every repository the agent opens - including repositories that
 * never ran `openspec init`. Nothing stops the workflow there: `openspec new
 * change` falls back to an implicit root and creates `openspec/` in whatever
 * directory the agent happens to be in.
 *
 * This guidance is interpolated into every workflow so the agent checks for a
 * root before writing. `openspec list --json` is the check because it refuses
 * to fabricate an implicit root: it reports `root: null` both when nothing is
 * set up and when only stores are registered.
 *
 * What follows the check depends on how the workflow was reached, because the
 * two cases want opposite things (#1645). A skill the model picked on its own
 * in an unrelated repository must get out of the way: the user asked for help,
 * not for OpenSpec, and answering with a setup menu is the reported bug. A
 * user who named OpenSpec, named the skill, or ran its slash command is owed
 * an answer about OpenSpec, so that case stops and asks.
 *
 * One text serves both surfaces. `apply-change` and `onboard` render a single
 * body into the skill and the command alike, so a command-only variant would
 * mean threading a surface flag through bodies that deliberately have none.
 * The bullets scope themselves instead: a slash command is an explicit
 * invocation, so its branch is the only one that can apply there.
 */
export const PROJECT_ROOT_GUARD = `**项目检查：** 以下步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（\`new change\`、\`archive\`、\`sync specs\`，或撰写任何产出物文件），确认项目已有根目录：运行 \`openspec-cn list --json\`（当选择了 store 时加上 \`--store <id>\`，因为此时 store 就是根目录），并读取 \`root\`。root 是一个对象表示项目已配置好。\`"root": null\` 表示尚未配置 —— 这里没有 \`openspec/\` 目录，而像 \`openspec-cn new change\` 这样的写入操作会作为副作用创建它。该命令还会以非零状态退出，这是它给出的答案而不是 CLI 坏了，因此请读取 JSON，不要重试或绕过它。

有一种 \`"root": null\` 与配置无关：当某条 \`status\` 错误消息以 \`中声明\` 或 \`中的 store 声明无效\` 结尾，并指向本项目的 \`openspec/config.yaml\`（或 \`config.yml\`）时，说明本项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 \`store:\` 行格式有误）。不要把它当作未初始化而跳过下面的分支：请在写入前停下，把该错误的 \`message\` 和 \`fix\` 展示给用户。

否则，在没有根目录的情况下，接下来怎么做取决于这个工作流是如何被触发的：

- **自动选用**：这个工作流是你自己选的，用户没有提到 OpenSpec、没有点名这个 skill，也没有运行它的斜杠命令。停止使用 OpenSpec，按平常方式回答请求，就像没安装 OpenSpec 一样。不要要求他们做任何配置，也不要提及 OpenSpec 配置。
- **明确要求 OpenSpec**：用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令。在写入前停下并询问如何继续：为本项目做配置（\`openspec-cn init\`）、指向他们已有的某个 store（\`--store <id>\`），还是本次请求不使用 OpenSpec 继续。等待他们的答复。

无论走哪个分支，都绝不能把创建根目录当作副作用：在用户要求之前不要运行 \`openspec-cn init\`，不要手工创建 \`openspec/\` 文件，也不要让任何命令创建它。`;
