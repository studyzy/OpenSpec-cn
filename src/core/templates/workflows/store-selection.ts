/**
 * Shared store-selection guidance for skill template workflows.
 *
 * Interpolated into every workflow's instructions so generated skills
 * consistently teach how to target a registered store with `--store <id>`.
 */
export const STORE_SELECTION_GUIDANCE = `**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 \`openspec-cn store list --json\` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 \`--store <id>\`（\`new change\`、\`status\`、\`instructions\`、\`list\`、\`show\`、\`validate\`、\`archive\`、\`doctor\`、\`context\`、\`schemas\`、\`view\`）。选定后，将 \`--store <id>\` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 \`openspec-cn status --change "<name>" --json --store "<id>"\`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 \`openspec/\` 根目录生效。`;
