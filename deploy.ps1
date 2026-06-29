# Cellab GitHub Pages Deploy Script
# Usage:
#   .\deploy.ps1                    (auto commit message)
#   .\deploy.ps1 "commit message"
#
# First run: auto-init git repo + connect remote + preserve CNAME
# Subsequent runs: only push changes

param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

# --- UTF-8 강제 (한글 커밋 메시지 깨짐 방지) ---
# PowerShell이 git에 인자를 넘길 때 콘솔 인코딩(기본 cp949)으로 변환하면
# 한글이 '?'로 손상된다. 콘솔/출력 인코딩을 UTF-8로 고정하고 git도 UTF-8로 설정.
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::InputEncoding  = [System.Text.Encoding]::UTF8
} catch {}
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:LC_ALL = "C.UTF-8"
git config i18n.commitEncoding utf-8 2>$null
git config i18n.logOutputEncoding utf-8 2>$null

$RepoUrl  = "https://github.com/emergent-co/cellab.git"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Cellab GitHub Pages Deploy" -ForegroundColor Cyan
Write-Host "  Repo: emergent-co/cellab" -ForegroundColor Cyan
Write-Host "  Live: https://cellab.kr" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check git
try {
    $gitVer = git --version
    Write-Host "[OK] $gitVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] git command not found." -ForegroundColor Red
    Write-Host "        Install: https://git-scm.com/download/win" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# First run - init repo
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "[!] First run: git repo init required." -ForegroundColor Yellow
    Write-Host "    Old GitHub files (index.html etc) will be overwritten by local files." -ForegroundColor Yellow
    Write-Host "    CNAME (cellab.kr domain) will be preserved." -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Proceed? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled."
        exit 0
    }

    Write-Host ""
    Write-Host "[INFO] git init" -ForegroundColor Yellow
    git init | Out-Null
    git branch -M main

    Write-Host "[INFO] remote add origin $RepoUrl" -ForegroundColor Yellow
    git remote add origin $RepoUrl

    Write-Host "[INFO] fetch origin (preserve CNAME)" -ForegroundColor Yellow
    git fetch origin main

    # Preserve CNAME
    if (-not (Test-Path "CNAME")) {
        Write-Host "[INFO] checkout CNAME from remote..." -ForegroundColor Yellow
        git checkout origin/main -- CNAME 2>$null
        if (Test-Path "CNAME") {
            $cnameContent = (Get-Content "CNAME" -Raw).Trim()
            Write-Host "[OK] CNAME preserved: $cnameContent" -ForegroundColor Green
        } else {
            Write-Host "[!] No CNAME on remote - creating cellab.kr" -ForegroundColor Yellow
            "cellab.kr" | Out-File -FilePath "CNAME" -Encoding ASCII -NoNewline
            Write-Host "[OK] CNAME created: cellab.kr" -ForegroundColor Green
        }
    } else {
        Write-Host "[OK] Local CNAME exists" -ForegroundColor Green
    }

    # Connect to remote history, local files take precedence
    git reset --soft origin/main
    Write-Host "[OK] Remote history connected" -ForegroundColor Green
}

# .gitignore
if (-not (Test-Path ".gitignore")) {
    @'
# Python
__pycache__/
*.pyc
*.pyo

# OS
.DS_Store
Thumbs.db
desktop.ini

# Editor
.vscode/
.idea/
*.swp

# OneDrive / Office temp
*.tmp

# Logs
*.log
'@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "[INFO] .gitignore created" -ForegroundColor Green
}

# Show changes
Write-Host ""
Write-Host "[Changed files]" -ForegroundColor Cyan
git status --short
Write-Host ""

# Exit if no changes
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "[INFO] No changes - nothing to deploy." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

# add + commit + push
Write-Host "[INFO] git add ." -ForegroundColor Yellow
git add .

if ([string]::IsNullOrEmpty($Message)) {
    $Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
Write-Host "[INFO] commit: $Message" -ForegroundColor Yellow
# 메시지를 UTF-8(BOM 없음) 임시파일로 써서 -F 로 커밋 → 콘솔 인코딩 무관하게 한글 보존
$msgFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($msgFile, $Message, (New-Object System.Text.UTF8Encoding($false)))
git commit -F $msgFile | Out-Null
Remove-Item $msgFile -ErrorAction SilentlyContinue

# Pull first — sync with GitHub Actions auto-build commits
Write-Host "[INFO] git pull origin main (sync auto-build commits)" -ForegroundColor Yellow
git pull origin main --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "  [FAILED] git pull error — resolve manually" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] push to origin/main..." -ForegroundColor Yellow
Write-Host "       (First push may open browser for GitHub login)" -ForegroundColor DarkGray
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "  [FAILED] git push error — see message above" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Deploy Complete" -ForegroundColor Green
Write-Host "  https://cellab.kr" -ForegroundColor Green
Write-Host "  GitHub Pages build: 1-3 minutes" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
