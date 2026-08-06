# 编写优秀的 Specs

你很少从空白页开始写一个 spec。你用平白语言描述一个变更，`/opsx:propose` 起草需求和场景，然后你把它们改好。本页讲的就是最后这部分——"好"长什么样，以及如何引导 AI 朝那个方向走。

它是 [Reviewing a Change](reviewing-changes.md) 的姊妹篇：审阅是抓住草案里的薄弱环节，编写是知道一个强的草案由什么构成。

## spec 是行为，不是代码

spec 说的是你的系统*做什么*，用任何人都能检查的方式来表述——而不是它如何被构建。它由**需求（requirements）**（行为陈述）和**场景（scenarios）**（证明它们的具体例子）构成。

```markdown
### Requirement: Session Timeout
The system SHALL expire a session after 30 minutes of inactivity.

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 30 minutes pass with no activity
- THEN the session is invalidated and the user must re-authenticate
```

把*如何做*——队列、库、表 schema——留在 `design.md` 或代码里。当行为和实现混进同一个需求，这个需求就不再是可测试的，并且会在代码一改动就开始过时。

## 什么造就一个好的需求

一个好的需求是一个行为，陈述得足够平白，你都能交给别人去测试。

- **一个陈述，一个 `SHALL`/`MUST`。** 如果一个需求有三句"而且还要"，它其实是三个需求。拆开。
- **可观察。** 代码之外的人应当能判断它是否成立。"系统 SHALL 在上传超过 10 MB 时显示错误横幅"是可观察的。"系统 SHALL 优雅地处理大上传"则不是。
- **合适的强度。** OpenSpec 使用 RFC 2119 关键词，它们含义不同：

  | 关键词 | 含义 |
  |---------|---------|
  | `MUST` / `SHALL` | 硬性需求。不可商量。 |
  | `SHOULD` | 强建议，允许有正当理由的例外。 |
  | `MAY` | 真正可选的。 |

  默认就选 `MUST`/`SHALL`。只有当你真正意思是"除非有充分理由不这么做"时才用 `SHOULD`。

对一个需求的检验：*一个从没见过代码的测试人员能不能判断它通没通过？* 如果不能，它需要 sharpen。

## 什么造就一个好的场景

场景是一个需求兑现价值的地方。每个都是具体的 GIVEN / WHEN / THEN，可能变成自动化测试。

- **它演练它的需求。** 一个只是用别的词重述需求的场景什么也没测。把它做成一个有具体结果的具体情况。
- **覆盖重要的案例，不只是 happy path。** 有效登录很容易。空输入、过期的令牌、第二次点击、出错的东西——bug 就藏在那里，也是场景最有价值的地方。
- **在标题里给案例命名。** "Scenario: Rejects an expired token" 让审阅者一眼就知覆盖了什么；"Scenario: Test 2" 不行。

一个有用的习惯：在批准前问*我最不情愿看到 broken 的是哪个案例？*——并确保有一个场景点名它。

## 选对增量的类型

一个变更用三种小节类型来描述它对 specs 的编辑。用对类型能保持你归档后的 specs 诚实：

- **`## ADDED Requirements`** —— 之前不存在的全新行为。
- **`## MODIFIED Requirements`** —— 已存在并正在改变的行为。包含完整的新版本；一行关于改了什么的小注能帮审阅者。
- **`## REMOVED Requirements`** —— 正在消失的行为，附一行说明原因。

On archive, ADDED gets appended to the main spec, MODIFIED replaces the old version, and REMOVED is dropped from it. Remove the last requirement a capability has and you retire it: rather than leave a spec with nothing in it, archive deletes `openspec/specs/<capability>/spec.md`. Because that is the one archive step that removes a file, it has to be asked for — add `retire_capabilities: true` to the change's `.openspec.yaml`, alongside the `schema:` that file already needs. Without it the archive aborts and tells you so. For a spec in the caller's checkout, the archive output also names the `git checkout` that restores a committed file; selected stores receive checkout-scoped recovery guidance instead. If you mark a real change as ADDED, you end up with two competing requirements; if you describe new behavior as MODIFIED, there's nothing to replace. When in doubt, open the current spec and see whether the requirement is already there.

One more section is worth knowing about. When your delta creates a capability that doesn't exist yet, open it with `## Purpose` — a sentence or two on what the capability is for. Archive uses it as the Purpose of the main spec it creates; skip it and you get a `TBD` placeholder to fill in by hand. An existing spec already has a Purpose, so a delta's is ignored there — edit `openspec/specs/<capability-path>/spec.md` directly to change one. Here, `<capability-path>` is the directory relative to `specs/`, such as `user-auth` in a flat project or `identity/user-auth` in a project organized by domain.

## 合理控制变更规模

最常见的一个编写错误不是措辞糟糕的需求——而是一个试图当三个变更的变更。

**一个好的变更有一个你能用一句话说清的意图。** "加一个暗色模式开关。" "给登录端点加上限流。" "把会话从 cookie 迁走。" 如果描述变更需要一大堆"而且还要"，那就是该拆分的信号。

变更太大的迹象：

- proposal 的范围读起来像一列不相关的功能。
- 审阅它要花一下午，于是没人会去审。
- 两个人没法不撞车地一起做它。
- 一半的任务都能自己交付。

更小的变更更易审阅、更易在一段专注会话里构建，也更易在六个月后归档成为唯一遗留时去推理。你随时可以并行跑多个变更——见 [Editing & iterating](editing-changes.md) 和 [Workflows](workflows.md)。

反面也会发生：一行字的错别字修复不需要三个需求加一份 design 文档。让仪式匹配风险大小。

## 如何引导 AI 起草好草案

因为 `/opsx:propose` 做第一稿，你拿回来的质量取决于你给它的质量。你不必手写需求——你只需把 AI 瞄准好：

- **陈述意图和边界。** *"加一个首次加载时跟随系统设置的暗色模式开关——别碰现有的主题 API。"* 范围外那半和范围内那半一样重要。
- **点名你在意的案例。** *"确保有一个场景覆盖手动已选过主题的用户。"* AI 会覆盖你指向的地方。
- **然后编辑。** 它是纯 Markdown。收紧一个模糊的 `SHALL`、删掉一个什么也没测的场景、补上它漏掉的案例——或让 AI 来：*"超时需求太模糊，把它钉死在 30 分钟。"*

起草、打磨、重复。几轮下来就能产生一个你会信任的 spec，这就是全部意义。

## 快速清单

- [ ] 每个需求是一个带 `SHALL`/`MUST` 的可观察行为。
- [ ] 没有任何实现细节被写进需求。
- [ ] 每个需求至少有一个真正演练它的场景。
- [ ] 重要的边界和错误案例都有场景，不只是 happy path。
- [ ] 增量对照当前 spec 正确使用了 ADDED / MODIFIED / REMOVED。
- [ ] 整个变更有一个你能用一句话说清的意图。

## 下一步去哪

- [Reviewing a Change](reviewing-changes.md) — 抓住漏网之鱼的两分钟检查。
- [Concepts](concepts.md) — specs、changes、deltas 背后的更深模型。
- [Examples & Recipes](examples.md) — 从开始到结束的真实变更。
