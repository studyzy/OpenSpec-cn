# 概述

> 每个能改变 OpenSpec 行为的文件和设置，以及它们各自所在的位置。

| 文件 | 位置 | 控制 |
| --- | --- | --- |
| [项目配置（config.yaml）](config-yaml.md) | `openspec/config.yaml` | 这个项目规划时使用的 schema、上下文与规则 |
| [变更元数据（.openspec.yaml）](change-metadata.md) | `openspec/changes/<name>/.openspec.yaml` | 单个变更的工作流 schema、目标、范围与 spec 例外 |
| [CLI 设置（config.json）](config-json.md) | `~/.config/openspec/config.json`（Windows 不同） | openspec-cn CLI 在你的机器上的行为方式 |
| [环境变量](environment-variables.md) | 你的 shell 或 CI 环境 | 遥测退出开关，以及配置和数据目录的位置 |
| [Stores](stores.md) | `~/.local/share/openspec/stores/`（Windows 不同） | 多仓库 store 背后的注册表与元数据 |
