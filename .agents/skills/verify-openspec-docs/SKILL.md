---
name: verify-openspec-docs
description: 用全新上下文的子代理对 OpenSpec 用户文档做事实核查，子代理重新运行命令并对照源码检查断言。手动触发；不是起草循环的一部分。在用户要求验证、事实核查或准确性检查一个文档页面、章节或一组改动的断言时使用。
argument-hint: page or section
---

# 验证 OpenSpec 文档

对照现实检查完成的文档行文。全新上下文的意义在于评审者没有看着行文写出来，所以它不会被说服接受作者的前提假设。

本 skill 只在用户要求时运行。起草由 `write-openspec-docs` 负责；除非用户请求一次验证，否则不要在起草会话中调用本 skill。

## 界定运行范围

1. 确认目标：一个页面、一个 `##` 章节，或一份改动的断言列表。如果未带目标调用，就询问。
2. 阅读目标所在文档树根部的 README；它的不变式和页面地图是会被检查的一部分。
3. 每个单元一个子代理（一个 `##` 章节，或声明的断言列表）。一个完整页面是几个子代理，并行运行。

## 启动评审者

通用子代理。子代理不继承 skills，所以提示词按路径把一切都交给评审者。填好每个占位符，让每个路径都绝对化，然后发送：

```
You are reviewing one unit of OpenSpec's user documentation before it reaches the docs owner. Be the two hardest readers it will meet: a skeptical developer reading it cold, and a fact-checker with the repo open.

Repo root: <ABSOLUTE REPO ROOT>. Use absolute paths with every tool.

Read first:
1. <DOCS TREE ROOT>/README.md: the page map and standing invariants.
2. <ABSOLUTE REPO ROOT>/.agents/skills/write-openspec-docs/writing.md: the house writing rules.
3. <PAGE PATH>: review only <the section "<HEADING>" | these changed claims: <LIST>>; read the rest of the page for context.

Then check, in this order:

1. Facts. Every command, flag, path, config key, output block, default, and behavior claim. Re-run the terminal commands shown: read-only commands anywhere, anything that mutates state in a scratch directory or not at all. Commands for the AI chat surface (like /opsx:propose) can't run in a shell; verify their names and behavior against the skill sources this repo ships. Check names against src/ and the CLI's own --help. An output block must match what the command actually prints.
2. Examples. Any example spec or change must pass `openspec validate`. Run it when the example exists on disk.
3. Structure. Flag anything that re-explains a topic whose canonical home is another page, or breaks a rule the docs tree's README states.
4. Job fit. Does the unit serve the page's stated job (the one-line statement under the title, if present)? Does the arriving reader get what they came for quickly?
5. Trust and slop. Flag: hype or comfort adjectives (easy, simple, powerful, seamless), claims with no shown evidence, vague generalization where a specific fact belongs, binary contrasts ("not X, it's Y"), colon reveals, importance puffery, summary endings, em dashes, bullet lists that should be prose, and three parallel punchy sentences in a row.

Report findings only, most severe first. For each: quote the line, say what is wrong, and give the fix in one line. For every fact you verified, say how (the command you ran, or the file and line you checked). List any claim you could not verify and why. Do not rewrite the unit. If the unit is clean, say so and list exactly what you verified.
```

## 处理报告

- 默认是报告，不是重写：向用户展示按严重度从高到低排列的发现，每条带引用行和一行修复，加上核验了什么及如何核验，以及评审者无法核实的任何断言。
- 只在用户要求验证并修复或批准发现时才应用修复。验证者也可能出错：被拒绝的内容连同你的理由放进报告，让用户能推翻你。
- 如果应用的修复改变了一个事实断言，再次验证，范围限定在改动的断言。拼写和措辞修复不需要第二遍。
- 两遍仍未收敛意味着停下并把问题交给用户。不要在循环里打磨。
