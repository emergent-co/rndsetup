@echo off
REM UTF-8 코드페이지로 전환 (한글 커밋 메시지 깨짐 방지)
chcp 65001 >nul
title 실험셋업연구소 GitHub Pages 배포
cd /d "%~dp0"

REM PowerShell 실행 정책 우회로 deploy.ps1 실행
REM 인자 전체를 그대로 PowerShell에 전달

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
