#!/bin/sh
# Installs the standalone `openspec-cn` binary (no Node.js needed) on Linux or macOS.
#
#   curl -fsSL https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.sh | sh
#
# OPENSPEC_VERSION      release to install (default: the newest complete one), e.g. v1.15.0
# OPENSPEC_INSTALL_DIR  where to put it (default: ~/.local/bin)
# OPENSPEC_INSTALL_NAME file name to install as (default: openspec-cn)
# OPENSPEC_RELEASES_URL releases page to install from (default: GitHub's; mirrors, testing)
# OPENSPEC_DOWNLOAD_URL one folder holding the release files (mirrors, testing)
set -eu

fail() { echo "openspec-cn install: $*" >&2; exit 1; }

# The binary and SHA256SUMS come from the same place, so a remote plain HTTP
# source could swap both: only https, or http to this machine. The host is
# parsed, not prefix-matched: http://localhost:80@evil.example/ names
# evil.example, so anything with a user part is refused.
check_source() {
  case "$2" in
    https://*) scheme=https authority=${2#https://} ;;
    http://*) scheme=http authority=${2#http://} ;;
    *) fail "$1 must use https (or http to localhost): $2" ;;
  esac
  authority=${authority%%/*}
  authority=${authority%%\?*}
  authority=${authority%%#*}
  case "$authority" in *@*) fail "$1 must use https (or http to localhost): $2" ;; esac
  [ "$scheme" = https ] && return 0
  host=$authority
  case "$authority" in
    "[::1]:"* | localhost:* | 127.0.0.1:*)
      host=${authority%:*}
      case "${authority##*:}" in "" | *[!0-9]*) fail "$1 has an invalid port: $2" ;; esac
      ;;
  esac
  case "$host" in
    localhost | 127.0.0.1 | "[::1]") return 0 ;;
    *) fail "$1 must use https (or http to localhost): $2" ;;
  esac
}

# Everything runs from main, so a download cut short while piped into sh
# runs nothing instead of half a script.
main() {
  case "$(uname -s)" in
    Linux) os=linux ;;
    Darwin) os=darwin ;;
    *) fail "不支持的操作系统 $(uname -s)。在 Windows 上，请从发布页下载 openspec-cn-windows-x64.exe。" ;;
  esac
  case "$(uname -m)" in
    x86_64 | amd64) arch=x64 ;;
    arm64 | aarch64) arch=arm64 ;;
    *) fail "不支持的 CPU $(uname -m)。请改用 npm 安装：npm install -g @studyzy/openspec-cn" ;;
  esac
  # An x64 shell under Rosetta still runs on an Apple Silicon Mac.
  if [ "$os" = darwin ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" = 1 ]; then
    arch=arm64
  fi
  asset="openspec-cn-$os-$arch"
  # Alpine and other musl distros cannot run the glibc build. Ask glibc first:
  # a glibc system can have musl installed alongside, loader and all.
  if [ "$os" = linux ] && ! getconf GNU_LIBC_VERSION >/dev/null 2>&1 &&
    { ldd --version 2>&1 | grep -qi musl || ls /lib/ld-musl-* >/dev/null 2>&1; }; then
    asset="$asset-musl"
  fi

  version="${OPENSPEC_VERSION:-latest}"
  case "$version" in latest | v*) ;; *) version="v$version" ;; esac
  releases="${OPENSPEC_RELEASES_URL:-https://github.com/studyzy/OpenSpec-cn/releases}"
  releases=${releases%/}
  check_source OPENSPEC_RELEASES_URL "$releases"
  if [ -n "${OPENSPEC_DOWNLOAD_URL:-}" ]; then
    check_source OPENSPEC_DOWNLOAD_URL "$OPENSPEC_DOWNLOAD_URL"
  fi
  if [ -n "${OPENSPEC_INSTALL_DIR:-}" ]; then
    dir="$OPENSPEC_INSTALL_DIR"
  elif [ -n "${HOME:-}" ]; then
    dir="$HOME/.local/bin"
  else
    fail "未设置 HOME；请设置 OPENSPEC_INSTALL_DIR 指定安装位置"
  fi

  # Staged inside the install dir, not /tmp: /tmp is often mounted noexec, and
  # a same-filesystem mv replaces an existing copy atomically.
  mkdir -p "$dir" || fail "无法创建 $dir"
  # Absolute, so the PATH advice below works from any directory.
  dir=$(cd "$dir" && pwd) || fail "无法使用 $dir"
  name="${OPENSPEC_INSTALL_NAME:-openspec-cn}"
  tmp=$(mktemp -d "$dir/.openspec-install.XXXXXX") || fail "无法写入 $dir"
  trap 'rm -rf "$tmp"' EXIT
  download() {
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL --retry 3 -o "$2" "$1"
    elif command -v wget >/dev/null 2>&1; then
      wget -q -O "$2" "$1"
    else
      fail "需要 curl 或 wget"
    fi
  }
  fetch() {
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL --retry 3 "$1"
    elif command -v wget >/dev/null 2>&1; then
      wget -q -O - "$1"
    else
      fail "需要 curl 或 wget"
    fi
  }

  npm_hint="或改用 npm 安装（Node.js 20.19+）：npm install -g @studyzy/openspec-cn"
  if [ -n "${OPENSPEC_DOWNLOAD_URL:-}" ]; then
    base=${OPENSPEC_DOWNLOAD_URL%/}
  elif [ "$version" != latest ]; then
    base="$releases/download/$version"
  else
    # The newest stable release whose files are all attached. GitHub calls a
    # release "latest" the moment it is published, minutes before the Binaries
    # workflow attaches the files (and for good, if that fails), so "latest"
    # is not trusted. SHA256SUMS is uploaded last: a release that has it is
    # complete.
    newest=""
    tags=$(fetch "$releases.atom" 2>/dev/null |
      grep -o '/releases/tag/v[0-9]*\.[0-9]*\.[0-9]*"' | sed 's#.*/tag/##; s/"$//' | awk '!seen[$0]++') || tags=""
    for tag in $tags; do
      [ -n "$newest" ] || newest=$tag
      if download "$releases/download/$tag/SHA256SUMS" "$tmp/SHA256SUMS" 2>/dev/null; then
        version=$tag
        break
      fi
    done
    if [ "$version" = latest ]; then
      fail "在 $releases 未找到包含独立版文件的发布版；$npm_hint"
    fi
    if [ "$version" != "$newest" ]; then
      echo "$newest is still being prepared; installing $version."
    fi
    base="$releases/download/$version"
  fi

  # Braces: macOS bash 3.2 folds the next UTF-8 byte into an unbraced name.
  echo "正在下载 ${asset}（${version}）..."
  download "$base/$asset" "$tmp/$asset" || fail "无法下载 $base/${asset}；$npm_hint"
  if [ ! -s "$tmp/SHA256SUMS" ]; then
    download "$base/SHA256SUMS" "$tmp/SHA256SUMS" || fail "无法下载 $base/SHA256SUMS；$npm_hint"
  fi

  expected=$(awk -v f="$asset" '$2 == f { print $1 }' "$tmp/SHA256SUMS")
  [ -n "$expected" ] || fail "SHA256SUMS 中未列出 $asset"
  if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "$tmp/$asset" | awk '{ print $1 }')
  else
    actual=$(shasum -a 256 "$tmp/$asset" | awk '{ print $1 }')
  fi
  [ "$actual" = "$expected" ] || fail "$asset 的校验和不匹配；已拒绝安装"

  chmod 755 "$tmp/$asset"
  if ! installed=$("$tmp/$asset" --version); then
    case "$asset" in
      *-musl) fail "$asset 需要 C++ 运行时（Alpine 3.17+）：apk add libstdc++ libgcc" ;;
      openspec-cn-darwin-*) fail "$asset 需要 macOS 13 或更高版本" ;;
      *) fail "下载的 $asset 无法在本机运行" ;;
    esac
  fi
  mv -f "$tmp/$asset" "$dir/$name"
  echo "已安装 openspec-cn $installed 到 $dir/$name"

  case ":$PATH:" in
    *":$dir:"*) ;;
    *) echo "请将 $dir 添加到 PATH 以便运行，例如：export PATH=\"$dir:\$PATH\"" ;;
  esac
}

main "$@"
