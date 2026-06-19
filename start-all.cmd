@echo off
cd /d D:\GMstore
start /b "" C:\nginx\nginx.exe -p C:\nginx
pm2 resurrect
timeout /t 5 /nobreak >nul
wscript.exe D:\GMstore\tunnel.vbs
timeout /t 15 /nobreak >nul
powershell -Command "Select-String -Path $env:TEMP\lhr.log -Pattern 'https://[a-z0-9]+\.lhr\.life' | Select-Object -Last 1 | ForEach-Object { $_.Matches.Value }" > D:\GMstore\current-url.txt
