# 测试 OOM 问题调查报告

**日期**: 2026-07-01  
**问题**: `make test` 运行全部测试时，vitest worker 进程 OOM 崩溃（即使 16GB 堆也耗尽）

## 现象

- `make test` 执行后，vitest 在 fork worker 中随机 OOM
- 单独运行 `npx vitest run test/commands/workset.test.ts` 也 OOM
- 设置 `NODE_OPTIONS="--max-old-space-size=16384"` 仍然 OOM
- 原版 OpenSpec（英文）仓库全部测试正常通过，不 OOM

## 排查过程

1. **排除源码逻辑问题**：对比 workset 相关源码（`workset.ts`、`worksets.ts`），仅有字符串汉化差异，无逻辑变更。

2. **排除 dist 问题**：用原版英文 dist 替换汉化版 dist，仍 OOM。

3. **排除依赖版本问题**：降级 vitest、完全重装 node_modules，均无效。

4. **定位到 vitest transform**：
   - 原版仓库 + 汉化测试文件 → 不 OOM
   - 汉化仓库 + 原版 `src/` → 不 OOM
   - 汉化仓库 + 汉化 `src/` → OOM
   - 测试 import 的 3 个汉化文件单独替换为汉化版 → 不 OOM

5. **确认**：vitest fork worker 在 transform 测试文件的 import 传递依赖链时，遇到汉化版 `src/` 中的中文 TypeScript 源文件导致 OOM。

## 根因

vitest v3 的 fork worker 在 transform（编译/转换）TypeScript 源文件时，处理中文字符串存在内存泄漏或无限分配问题。不是某个特定文件，而是 import 传递依赖链上的多个中文源文件累积触发。

具体触发条件：
- 测试文件直接 import 了 `src/` 中的模块（如 `workset.test.ts` import `src/core/global-config.js` 等）
- vitest transform 这些文件及其传递依赖时，中文源文件导致 worker 堆内存持续增长直至 OOM

## 证据

| 场景 | 结果 |
|------|------|
| 原版英文 src + 汉化测试 | 不 OOM |
| 汉化中文 src + 原版测试 | OOM |
| 汉化仓库 + 原版 src 替换 | 不 OOM |
| 手动修改 dist JS 添加中文 | 不 OOM |
| 原版仓库 + 汉化 dist | 不 OOM |

## 建议修复方向

在 `vitest.config.ts` 中配置避免 transform `src/` 目录：

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    // ... 现有配置
    server: {
      deps: {
        // 避免 transform src/ 中的源文件
        inline: [],
      },
    },
    // 或者
    deps: {
      optimizer: {
        ssr: {
          include: [],
        },
      },
    },
  },
});
```

或确保测试通过 `dist/` 运行 CLI 而非直接 import `src/` 模块。
