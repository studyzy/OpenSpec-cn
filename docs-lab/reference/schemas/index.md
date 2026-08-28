# 概述

> 每个可用的工作流 schema，以及它定义的制品。

<!-- This group states the formats. How schemas shape artifacts and how to
change or write one is customize/schemas.md's job. -->

一个 schema 定义变更提案产生哪些制品，以及按什么顺序产生。在磁盘上它是一个包含 schema.yaml 的目录。该文件的每个字段都在 [schema.yaml](schema-yaml.md) 页面上。

## 可用的 schemas

CLI 附带一个 schema：

| Schema | 制品 |
|---|---|
| [spec-driven](spec-driven/index.md)（默认） | `proposal`, `specs`, `design`, `tasks` |

项目可以添加自己的 schemas，机器也可以全局覆盖。这些目录放在哪里、哪份副本生效，见 schema.yaml 的[位置](schema-yaml.md#location)一节。

在终端中，[`openspec-cn schemas`](../cli.md#openspec-schemas) 会打印你的项目能看到的每个 schema。
