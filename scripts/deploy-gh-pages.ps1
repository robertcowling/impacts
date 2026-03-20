# deploy-gh-pages.ps1
# Reliable one-command deploy of frontend/ -> gh-pages branch.
# Uses a temp clone so it always works regardless of history divergence.

$ErrorActionPreference = "Stop"

$repoRoot   = Split-Path $PSScriptRoot -Parent
$frontendDir = Join-Path $repoRoot "frontend"
$tmpDir      = Join-Path $env:TEMP "impacts-gh-pages-deploy"
$remoteUrl   = "https://github.com/robertcowling/impacts"
$branch      = "gh-pages"

Write-Host "==> Cleaning up any previous temp dir..." -ForegroundColor Cyan
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }

Write-Host "==> Cloning $branch branch..." -ForegroundColor Cyan
git clone --branch $branch --single-branch $remoteUrl $tmpDir

Write-Host "==> Copying frontend files..." -ForegroundColor Cyan
# Copy everything from frontend/ into the root of the gh-pages clone
Get-ChildItem -Path $frontendDir | ForEach-Object {
    $dest = Join-Path $tmpDir $_.Name
    Copy-Item $_.FullName $dest -Recurse -Force
}

Write-Host "==> Staging changes..." -ForegroundColor Cyan
Push-Location $tmpDir
git add --all

$status = git status --porcelain
if (-not $status) {
    Write-Host "Nothing to deploy - gh-pages is already up to date." -ForegroundColor Yellow
    Pop-Location
    Remove-Item $tmpDir -Recurse -Force
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Deploy: $timestamp"

Write-Host "==> Pushing to $branch..." -ForegroundColor Cyan
git push origin $branch

Pop-Location

Write-Host "==> Cleaning up..." -ForegroundColor Cyan
Remove-Item $tmpDir -Recurse -Force

Write-Host "==> Done! Site will update at https://robertcowling.github.io/impacts/ shortly." -ForegroundColor Green
