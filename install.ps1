# ZhuyinTranslate — one-shot installer (Windows PowerShell)
#
# Usage (paste into PowerShell):
#   iwr -useb https://raw.githubusercontent.com/herrylai246-bit/vencord-zhuyin-translate/main/install.ps1 | iex
#
# What it does:
#   1. Checks for git + Node.js (prompts to install if missing).
#   2. Clones Vencord into %LOCALAPPDATA%\VencordZhuyin (or reuses existing).
#   3. Clones this plugin into src\userplugins\zhuyinTranslate.
#   4. Runs pnpm install + pnpm build via npx (no global pnpm required).
#   5. Closes Discord and patches it to load the freshly-built Vencord.
#   6. Relaunches Discord.

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn2($msg) { Write-Host "    $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "    $msg" -ForegroundColor Red }

$VencordRepo = "https://github.com/Vendicated/Vencord.git"
$PluginRepo  = "https://github.com/herrylai246-bit/vencord-zhuyin-translate.git"
$InstallRoot = Join-Path $env:LOCALAPPDATA "VencordZhuyin"
$VencordDir  = Join-Path $InstallRoot "Vencord"
$PluginDir   = Join-Path $VencordDir "src\userplugins\zhuyinTranslate"

# --- 1. Prereqs ------------------------------------------------------------
Write-Step "Checking prerequisites"

function Test-Command($name) {
    try { Get-Command $name -ErrorAction Stop | Out-Null; return $true }
    catch { return $false }
}

if (-not (Test-Command git)) {
    Write-Err "git not found. Install from https://git-scm.com/download/win and re-run."
    exit 1
}
Write-Ok "git found"

if (-not (Test-Command node)) {
    Write-Err "Node.js not found. Install LTS from https://nodejs.org and re-run."
    exit 1
}
$nodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 18) {
    Write-Err "Node.js >= 18 required (you have $(node --version)). Update from https://nodejs.org."
    exit 1
}
Write-Ok "node $(node --version)"

# --- 2. Clone / update Vencord --------------------------------------------
Write-Step "Setting up Vencord source tree"
New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null

if (Test-Path (Join-Path $VencordDir ".git")) {
    Write-Ok "Vencord already cloned, pulling latest"
    git -C $VencordDir pull --ff-only 2>&1 | Out-Null
} else {
    Write-Ok "Cloning Vencord into $VencordDir"
    git clone --depth=1 $VencordRepo $VencordDir 2>&1 | Out-Null
}

# --- 3. Clone / update the plugin -----------------------------------------
Write-Step "Installing ZhuyinTranslate plugin"
if (Test-Path (Join-Path $PluginDir ".git")) {
    Write-Ok "Plugin already cloned, pulling latest"
    git -C $PluginDir pull --ff-only 2>&1 | Out-Null
} else {
    New-Item -ItemType Directory -Force -Path (Split-Path $PluginDir) | Out-Null
    Write-Ok "Cloning plugin into $PluginDir"
    git clone --depth=1 $PluginRepo $PluginDir 2>&1 | Out-Null
}

# --- 4. Install deps + build ---------------------------------------------
Write-Step "Installing dependencies (this takes a minute)"
Push-Location $VencordDir
try {
    & npx --yes pnpm@latest install --silent 2>&1 | Out-Null
    Write-Ok "Dependencies installed"

    Write-Step "Building Vencord with the plugin baked in"
    & npx --yes pnpm@latest build 2>&1 | Select-String "error" | Write-Host
    if (-not (Test-Path (Join-Path $VencordDir "dist\patcher.js"))) {
        Write-Err "Build failed — no dist\patcher.js produced. Check output above."
        exit 1
    }
    Write-Ok "Build finished"
} finally {
    Pop-Location
}

# --- 5. Close Discord + patch --------------------------------------------
Write-Step "Patching Discord"
Get-Process -Name "Discord","DiscordSystemHelper","DiscordPTB","DiscordCanary" -ErrorAction SilentlyContinue |
    ForEach-Object { try { $_.Kill() } catch {} }
Start-Sleep -Seconds 2

$cli = Join-Path $VencordDir "dist\Installer\VencordInstallerCli.exe"
if (-not (Test-Path $cli)) {
    Write-Err "Installer CLI missing at $cli. The build step should have downloaded it."
    exit 1
}

# Point the installer at our freshly built dist so Discord loads *this* build.
$env:VENCORD_USER_DATA_DIR = Join-Path $env:APPDATA "Vencord"
& $cli -install -branch stable 2>&1 | Where-Object { $_ -match "INFO|ERROR|Success" } | Write-Host

# Overwrite the installed Vencord dist with our freshly built one so the
# plugin is included. (The installer stub loads from %APPDATA%\Vencord\dist.)
$installedDist = Join-Path $env:APPDATA "Vencord\dist"
New-Item -ItemType Directory -Force -Path $installedDist | Out-Null
$files = @(
    "patcher.js","patcher.js.LEGAL.txt","patcher.js.map",
    "preload.js","preload.js.map",
    "renderer.js","renderer.js.LEGAL.txt","renderer.js.map",
    "renderer.css","renderer.css.map"
)
foreach ($f in $files) {
    $src = Join-Path $VencordDir "dist\$f"
    if (Test-Path $src) { Copy-Item $src $installedDist -Force }
}
Write-Ok "Deployed bundle to $installedDist"

# --- 6. Launch Discord ---------------------------------------------------
Write-Step "Launching Discord"
$update = Join-Path $env:LOCALAPPDATA "Discord\Update.exe"
if (Test-Path $update) {
    & $update --processStart Discord.exe
    Write-Ok "Discord launched"
} else {
    Write-Warn2 "Could not find Discord Update.exe — please start Discord manually."
}

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "Open Discord → User Settings → Vencord → Plugins → enable 'ZhuyinTranslate'." -ForegroundColor Green
Write-Host "`nTo update later, just re-run this command." -ForegroundColor DarkGray
