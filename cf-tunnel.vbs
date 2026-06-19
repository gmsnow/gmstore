CreateObject("WScript.Shell").Run "C:\Users\GMSNOW\cloudflared.exe tunnel --url http://127.0.0.1:80 > %TEMP%\cf.log 2>&1", 0, False
