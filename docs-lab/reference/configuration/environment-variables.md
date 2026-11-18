# 环境变量

> OpenSpec 读取的每一个环境变量。

<!-- Skeleton: headings only. This page is the telemetry opt-out's home
(README TODO): OPENSPEC_TELEMETRY=0, DO_NOT_TRACK=1, auto-disabled in CI, plus
what's collected. start/installation.md's Deno section links here to explain
its network-permission flag. XDG vars move the config/data directories. -->

## OPENSPEC_TELEMETRY

## DO_NOT_TRACK

## XDG_CONFIG_HOME and XDG_DATA_HOME

## OPENSPEC_SKILLS_SCOPE

设置为 `global` 或 `project`，用于决定 `openspec-cn init` 为新仓库把 skills 安装到哪里。显式的 `--scope` 优先。仓库中已有的 skills 保持原位。

对于需要在检出目录中使用 agent skills 的 CI 任务：

```bash
OPENSPEC_SKILLS_SCOPE=project openspec-cn init --tools claude
```

只做校验的任务可以直接运行 `openspec-cn validate --all`。
