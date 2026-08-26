# Sync api/ source to a Hugging Face Space (Docker SDK).
# Usage:
#   .\scripts\sync-to-hf.ps1 -HfUser <hf-username> -HfToken <hf-token> [-SpaceName recall-ai-api]
#
# What it does:
#   1. Stage api source files (src, package.json, package-lock.json, Dockerfile) + HF README
#   2. Clone the target Space repo via HTTPS (token used in-memory, never stored)
#   3. Copy staged files in, commit and push
#   4. Delete the staging folder (removes token traces from disk)
param(
    [Parameter(Mandatory = $true)][string]$HfUser,
    [Parameter(Mandatory = $true)][string]$HfToken,
    [string]$SpaceName = "recall-ai-api"
)

$ErrorActionPreference = "Stop"

$repoRoot      = Split-Path -Parent $PSScriptRoot
$apiDir        = Join-Path $repoRoot "api"
$stageDir      = Join-Path $repoRoot ".hf-stage"
$readmeTemplate = Join-Path $PSScriptRoot "hf-space-readme.md"

if (-not (Test-Path $readmeTemplate)) { throw "README template not found: $readmeTemplate" }

# 1) Build staging folder (whitelist only - never copy .env / logs / node_modules)
if (Test-Path $stageDir) { Remove-Item $stageDir -Recurse -Force }
New-Item -ItemType Directory -Path $stageDir | Out-Null

Copy-Item (Join-Path $apiDir "src")              (Join-Path $stageDir "src") -Recurse
Copy-Item (Join-Path $apiDir "package.json")     $stageDir
Copy-Item (Join-Path $apiDir "package-lock.json") $stageDir
Copy-Item (Join-Path $apiDir "Dockerfile")       $stageDir
Copy-Item $readmeTemplate (Join-Path $stageDir "README.md")

Write-Host "[1/4] Staged files:" -ForegroundColor Cyan
Get-ChildItem $stageDir | ForEach-Object { Write-Host "    $($_.Name)" }

# 2) Clone the Space repo
$spaceUrl = "https://$($HfUser):$($HfToken)@huggingface.co/spaces/$($HfUser)/$($SpaceName)"
$cloneDir = Join-Path $stageDir "space"
Write-Host "[2/4] Cloning space $HfUser/$SpaceName ..." -ForegroundColor Cyan
git clone -q $spaceUrl $cloneDir
if ($LASTEXITCODE -ne 0) { throw "git clone failed. Check HfUser / HfToken / SpaceName, and make sure the Space exists." }

# 3) Copy staged files into the Space repo
Get-ChildItem $stageDir -Exclude "space" | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $cloneDir $_.Name) -Recurse -Force
}

# 4) Commit and push
Push-Location $cloneDir
git add -A
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "sync: recall-ai api ($stamp)"
if ($LASTEXITCODE -ne 0) { Write-Host "    nothing new to commit (already up to date)" }
git push origin HEAD
$pushOk = ($LASTEXITCODE -eq 0)
Pop-Location

# 5) Cleanup staging (removes token from disk)
Remove-Item $stageDir -Recurse -Force
Write-Host "[4/4] Staging cleaned." -ForegroundColor Cyan

if ($pushOk) {
    $sub = "$($HfUser.ToLower())-$($SpaceName)".ToLower()
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "  Space  : https://huggingface.co/spaces/$HfUser/$SpaceName"
    Write-Host "  App    : https://$sub.hf.space"
    Write-Host "  Health : https://$sub.hf.space/api/v1/health"
} else {
    throw "git push failed."
}
