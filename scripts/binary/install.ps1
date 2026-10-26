# Installs the standalone `openspec-cn.exe` (no Node.js needed) on Windows.
#
#   irm https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.ps1 | iex
#
# $env:OPENSPEC_VERSION      release to install (default: the newest complete one), e.g. v1.15.0
# $env:OPENSPEC_INSTALL_DIR  where to put it (default: %LOCALAPPDATA%\Programs\openspec-cn)
# $env:OPENSPEC_INSTALL_NAME file name to install as (default: openspec-cn.exe)
# $env:OPENSPEC_RELEASES_URL releases page to install from (default: GitHub's; mirrors, testing)
# $env:OPENSPEC_DOWNLOAD_URL one folder holding the release files (mirrors, testing)
#
# Runs in Windows PowerShell 5.1 and PowerShell 7. It throws instead of
# calling exit, which would close the window of anyone who piped it into iex.
& {
  $ErrorActionPreference = 'Stop'
  # Windows PowerShell 5.1 may default to TLS 1.0, which GitHub refuses, and
  # draws a progress bar that slows downloads many times over.
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
  $ProgressPreference = 'SilentlyContinue'

  # The OS architecture, not this PowerShell's: an x64 shell on an ARM PC
  # should still get the native ARM build.
  $arch = switch ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture) {
    'X64' { 'x64' }
    'Arm64' { 'arm64' }
    default { throw "openspec-cn install: 不支持的 CPU $_。请改用 npm 安装：npm install -g @studyzy/openspec-cn" }
  }
  $asset = "openspec-cn-windows-$arch.exe"

  $version = if ($env:OPENSPEC_VERSION) { $env:OPENSPEC_VERSION } else { 'latest' }
  if ($version -ne 'latest' -and -not $version.StartsWith('v')) { $version = "v$version" }
  # The binary and SHA256SUMS come from the same place, so a remote plain HTTP
  # source could swap both: only https, or http to this machine. [Uri] parses
  # the host, so http://localhost:80@evil.example/ is evil.example, not loopback.
  function Assert-Source($label, $value) {
    $uri = $null
    if (-not [Uri]::TryCreate($value, 'Absolute', [ref]$uri) -or $uri.UserInfo -or
        -not ($uri.Scheme -eq 'https' -or ($uri.Scheme -eq 'http' -and $uri.IsLoopback))) {
      throw "openspec-cn install: $label must use https (or http to localhost): $value"
    }
  }
  $releases = if ($env:OPENSPEC_RELEASES_URL) { $env:OPENSPEC_RELEASES_URL.TrimEnd('/') } else { 'https://github.com/studyzy/OpenSpec-cn/releases' }
  Assert-Source 'OPENSPEC_RELEASES_URL' $releases
  if ($env:OPENSPEC_DOWNLOAD_URL) { Assert-Source 'OPENSPEC_DOWNLOAD_URL' $env:OPENSPEC_DOWNLOAD_URL }
  $npmHint = '或改用 npm 安装（Node.js 20.19+）：npm install -g @studyzy/openspec-cn'
  $dir = if ($env:OPENSPEC_INSTALL_DIR) { $env:OPENSPEC_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA 'Programs\openspec-cn' }
  # Absolute, so the user PATH entry works from any directory.
  $dir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($dir)
  $name = if ($env:OPENSPEC_INSTALL_NAME) { $env:OPENSPEC_INSTALL_NAME } else { 'openspec-cn.exe' }

  # Staged inside the install dir so the final move is a same-volume rename.
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  # Copies set aside by an earlier upgrade, once nothing runs them any more.
  Get-ChildItem -Path $dir -Filter "$name.old-*" -ErrorAction SilentlyContinue |
    Remove-Item -Force -ErrorAction SilentlyContinue
  $tmp = Join-Path $dir ('.openspec-install-' + [Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    $exe = Join-Path $tmp $asset
    $sums = Join-Path $tmp 'SHA256SUMS'
    if ($env:OPENSPEC_DOWNLOAD_URL) {
      $base = $env:OPENSPEC_DOWNLOAD_URL.TrimEnd('/')
    } elseif ($version -ne 'latest') {
      $base = "$releases/download/$version"
    } else {
      # The newest stable release whose files are all attached. GitHub calls a
      # release "latest" the moment it is published, minutes before the
      # Binaries workflow attaches the files (and for good, if that fails), so
      # "latest" is not trusted. SHA256SUMS is uploaded last: a release that
      # has it is complete.
      $feed = ''
      # .Content is a byte array for this feed, so the regex would see no tags.
      try {
        $feedPath = Join-Path $tmp 'releases.atom'
        Invoke-WebRequest -UseBasicParsing -Uri "$releases.atom" -OutFile $feedPath
        $feed = [IO.File]::ReadAllText($feedPath)
      } catch { Write-Verbose "No release feed: $_" }
      $tags = @([regex]::Matches($feed, '/releases/tag/(v\d+\.\d+\.\d+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
      foreach ($tag in $tags) {
        try {
          Invoke-WebRequest -UseBasicParsing -Uri "$releases/download/$tag/SHA256SUMS" -OutFile $sums
          $version = $tag
          break
        } catch {
          Write-Verbose "$tag is not complete yet: $_"
        }
      }
      if ($version -eq 'latest') { throw "openspec-cn install: 在 $releases 未找到包含独立版文件的发布版。$npmHint" }
      if ($tags.Count -gt 0 -and $version -ne $tags[0]) { Write-Host "$($tags[0]) is still being prepared; installing $version." }
      $base = "$releases/download/$version"
    }

    Write-Host "正在下载 $asset（$version）..."
    try {
      Invoke-WebRequest -UseBasicParsing -Uri "$base/$asset" -OutFile $exe
      if (-not (Test-Path $sums)) { Invoke-WebRequest -UseBasicParsing -Uri "$base/SHA256SUMS" -OutFile $sums }
    } catch {
      throw "openspec-cn install: 无法从 ${base} 下载：$($_.Exception.Message)。$npmHint"
    }

    $line = Get-Content $sums | Where-Object { ($_ -split '\s+')[1] -eq $asset } | Select-Object -First 1
    if (-not $line) { throw "openspec-cn install: SHA256SUMS 中未列出 $asset" }
    $expected = ($line -split '\s+')[0]
    $actual = (Get-FileHash -Algorithm SHA256 -Path $exe).Hash
    if ($actual -ne $expected) { throw "openspec-cn install: $asset 的校验和不匹配；已拒绝安装" }

    $installed = $null
    # A binary that cannot start at all throws instead of setting an exit code.
    try { $installed = & $exe --version } catch { Write-Verbose "openspec-cn --version 失败：$_" }
    if ($LASTEXITCODE -ne 0 -or -not $installed) {
      throw "openspec-cn install: 下载的 $asset 无法在本机运行（需要 Windows 10 或更高版本）"
    }

    $target = Join-Path $dir $name
    # Windows cannot overwrite a running exe, and `openspec-cn install` runs this
    # from the very exe it replaces. Renaming a running exe is allowed, so the
    # old copy moves aside: deleted now, or by the next install if still running.
    $old = $null
    if (Test-Path $target) {
      $old = "$target.old-" + [Guid]::NewGuid().ToString('N')
      Rename-Item -Path $target -NewName (Split-Path $old -Leaf)
    }
    try {
      Move-Item -Path $exe -Destination $target
    } catch {
      if ($old) { Rename-Item -Path $old -NewName $name -ErrorAction SilentlyContinue }
      throw "openspec-cn install: 无法安装到 ${target}：$($_.Exception.Message)"
    }
    if ($old) { Remove-Item -Force -Path $old -ErrorAction SilentlyContinue }
    # Clear any "downloaded from the internet" mark so Windows does not block it.
    Unblock-File -Path $target -ErrorAction SilentlyContinue
    Write-Host "已安装 openspec-cn $installed 到 $target"
  } finally {
    Remove-Item -Recurse -Force -Path $tmp -ErrorAction SilentlyContinue
  }

  # Unlike a shell profile, the user PATH is the standard place for this on
  # Windows. Only appended to, and only when missing. Read and written raw:
  # [Environment]::SetEnvironmentVariable would save it expanded, turning
  # entries like %USERPROFILE%\bin into fixed paths for good.
  $key = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment', $true)
  try {
    $raw = [string]$key.GetValue('Path', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
    $entries = @($raw -split ';' | Where-Object { $_ })
    if ($entries -notcontains $dir) {
      $key.SetValue('Path', (($entries + $dir) -join ';'), [Microsoft.Win32.RegistryValueKind]::ExpandString)
      # Setting any user variable broadcasts the change, so new terminals see it.
      [Environment]::SetEnvironmentVariable('OPENSPEC_INSTALL_PATH_CHANGED', '1', 'User')
      [Environment]::SetEnvironmentVariable('OPENSPEC_INSTALL_PATH_CHANGED', $null, 'User')
      $env:Path = "$env:Path;$dir"
      Write-Host "已将 $dir 添加到你的用户 PATH。请打开新的终端，以便在任何位置使用 openspec-cn。"
    }
  } finally {
    $key.Close()
  }
}
