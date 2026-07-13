@echo off
title 실험셋업연구소 build - generate static category pages
cd /d "%~dp0"

python --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Install Python 3.10+ from python.org
    pause
    exit /b 1
)

echo.
echo Running build...
echo.
python _build\build.py
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed. Check the message above.
    pause
    exit /b 1
)

echo.
echo OK. Generated files at workspace root:
echo   pump.html / tubing.html / syringe.html / pumphead.html / fitting.html / other.html
echo   sitemap.xml
echo.
pause
