# The Sun Road — publication GitHub Pages
# Clic droit sur ce fichier > Exécuter avec PowerShell

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$RepoName = "the-sun-road"

Write-Host ""
Write-Host "  The Sun Road — envoi sur GitHub" -ForegroundColor Cyan
Write-Host "  Dossier: $PSScriptRoot" -ForegroundColor DarkGray
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "ERREUR: Git non installé -> https://git-scm.com" -ForegroundColor Red
  Read-Host "Appuie sur Entrée pour fermer"
  exit 1
}

if (-not (Test-Path .git)) {
  git init | Out-Host
}

git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "The Sun Road: version a jour (banniere + design mobile)"
  Write-Host "OK: commit créé." -ForegroundColor Green
} else {
  Write-Host "Info: aucun changement à committer." -ForegroundColor Yellow
}

git branch -M main 2>$null

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "GitHub CLI (gh) absent." -ForegroundColor Yellow
  Write-Host "1. Installe: https://cli.github.com"
  Write-Host "2. Crée un dépôt vide '$RepoName' sur https://github.com/new"
  Write-Host "3. Puis dans ce dossier:"
  Write-Host "   git remote add origin https://github.com/TON-USERNAME/$RepoName.git"
  Write-Host "   git push -u origin main --force"
  Write-Host "4. Settings > Pages > GitHub Actions (ou branch main / root)"
  Read-Host "Appuie sur Entrée pour fermer"
  exit 0
}

$auth = gh auth status 2>&1
$auth | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host "Lance: gh auth login" -ForegroundColor Yellow
  Read-Host "Appuie sur Entrée pour fermer"
  exit 1
}

$login = gh api user -q .login
Write-Host "Compte GitHub: $login" -ForegroundColor Green

git remote remove origin 2>$null
$repoExists = $false
gh repo view "$login/$RepoName" 2>$null
if ($LASTEXITCODE -eq 0) { $repoExists = $true }

if ($repoExists) {
  Write-Host "Dépôt existant — push en cours..."
  git remote add origin "https://github.com/$login/$RepoName.git"
  git push -u origin main --force
} else {
  Write-Host "Création du dépôt $RepoName..."
  gh repo create $RepoName --public --source=. --remote=origin --push
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Site (attends 1-3 min après le push):" -ForegroundColor Green
Write-Host "  https://$login.github.io/$RepoName/" -ForegroundColor White
Write-Host ""
Write-Host "  Si la page est vide, va sur:" -ForegroundColor Yellow
Write-Host "  https://github.com/$login/$RepoName/settings/pages" -ForegroundColor Yellow
Write-Host "  Source: GitHub Actions" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Read-Host "Appuie sur Entrée pour fermer"
