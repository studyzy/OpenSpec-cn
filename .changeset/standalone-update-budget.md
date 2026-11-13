---
"@studyzy/openspec-cn": patch
---

独立版 `openspec-cn version --check` 检查更新时，GitHub Releases feed 与 `SHA256SUMS` 探测改为共享 5 秒总预算（此前沿用 1.5 秒），feed 响应较慢时不再把正常发布误报为 `offline`。