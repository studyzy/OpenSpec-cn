#!/usr/bin/env bash
# Smoke-tests a standalone binary from build.mjs: version, built-in schemas,
# and a real init → change → status → instructions run in a scratch project.
#
#   bash scripts/binary/smoke.sh dist-bin/openspec-cn-<os>-<arch>
set -euo pipefail

expected=$(sed -nE 's/^  "version": "([^"]+)".*/\1/p' "$(dirname "$0")/../../package.json")
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Run it from, and keep its data under, paths with a space and non-ASCII
# characters, as on a machine whose user name has them. Renamed too, as a
# user would after downloading.
mkdir -p "$work/bin dir ü"
bin="$work/bin dir ü/openspec-cn"
case "$1" in *.exe) bin="$bin.exe" ;; esac
cp "$1" "$bin"

# Keep the run off the user's real config and data, and offline.
export XDG_CONFIG_HOME="$work/config ü" XDG_DATA_HOME="$work/data ü"
export OPENSPEC_TELEMETRY=0 OPENSPEC_NO_UPDATE_CHECK=1 NO_COLOR=1
node "$(dirname "$0")/../../test/helpers/skill-release.mjs" "$work/release"
export GH_HOST=skills.example.invalid GIT_CONFIG_GLOBAL="$work/release/gitconfig"
mkdir "$work/project" && cd "$work/project"

fail() { echo "FAIL: $*" >&2; exit 1; }

version=$("$bin" --version)
[ "$version" = "$expected" ] || fail "--version 输出 '$version'，期望 '$expected'"

"$bin" schemas --json | grep -q '"source": "package"' || fail "未找到内置 Schema"
"$bin" init --scope project --tools claude > /dev/null
[ -f .claude/skills/openspec-propose/SKILL.md ] || fail "Claude 无法读取带标签的 propose skill"
[ -f openspec/config.yaml ] || fail "init 未写入 openspec/config.yaml"
"$bin" new change demo > /dev/null
"$bin" status --change demo --json | grep -q '"schemaName": "spec-driven"' || fail "status 未解析到 Schema"
"$bin" instructions proposal --change demo | grep -q '<template>' || fail "instructions 缺少 proposal 模板"

# A damaged copy of the extracted schemas is repaired, not trusted.
find "$XDG_DATA_HOME" -path '*binary-schemas*' -name proposal.md -delete
"$bin" instructions proposal --change demo | grep -q '<template>' || fail "损坏的 Schema 副本未被修复"

# The CLI must run once per invocation, not once per entry point.
[ "$("$bin" schemas | grep -c '可用 Schema')" = 1 ] || fail "CLI 运行了不止一次"

echo "OK: $(basename "$1") ($version)"
