# Horizon Chill — publication GitHub Pages
# Usage: clic droit > Exécuter avec PowerShell
# ou: powershell -ExecutionPolicy Bypass -File deploy-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Horizon Chill — déploiement GitHub" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git n'est pas installé. Installe-le depuis https://git-scm.com" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path .git)) {
  git init
  Write-Host "Dépôt git initialisé."
}

git add .
$status = git status --porcelain
if ($status) {
  git commit -m "Horizon Chill: app roadtrip mobile premium (GitHub Pages ready)"
  Write-Host "Commit créé."
} else {
  Write-Host "Rien à committer."
}

git branch -M main

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "GitHub CLI (gh) non trouvé." -ForegroundColor Yellow
  Write-Host "1. Installe: https://cli.github.com"
  Write-Host "2. Crée le dépôt 'horizon-chill' sur github.com/new"
  Write-Host "3. Puis:"
  Write-Host '   git remote add origin https://github.com/TON-USERNAME/horizon-chill.git'
  Write-Host "   git push -u origin main"
  Write-Host "4. Settings > Pages > branch main / root"
  exit 0
}

gh auth status 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host "Connecte-toi: gh auth login" -ForegroundColor Yellow
  exit 1
}

$login = gh api user -q .login
$exists = gh repo view "$login/horizon-chill" 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Dépôt existant — push..."
  git remote remove origin 2>$null
  git remote add origin "https://github.com/$login/horizon-chill.git"
  git push -u origin main
} else {
  gh repo create horizon-chill --public --source=. --remote=origin --push
}

Write-Host ""
Write-Host "Activer GitHub Pages:" -ForegroundColor Green
Write-Host "  https://github.com/$login/horizon-chill/settings/pages"
Write-Host "  Source: Deploy from branch > main > / (root)"
Write-Host ""
Write-Host "URL de l'app (après 1-2 min):" -ForegroundColor Green
Write-Host "  https://$login.github.io/horizon-chill/"
