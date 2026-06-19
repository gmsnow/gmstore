CreateObject("WScript.Shell").Run "cmd /c ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:127.0.0.1:3000 nokey@localhost.run > %TEMP%\tunnel3.log 2>&1", 0, False
