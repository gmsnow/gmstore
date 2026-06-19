@echo off
:loop
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3000 serveo.net
timeout /t 5 /nobreak >nul
goto loop
