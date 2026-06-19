$log = "$env:TEMP\cf3.log"
$proc = Start-Process -NoNewWindow -FilePath "C:\Users\GMSNOW\cloudflared.exe" -ArgumentList "tunnel --url http://127.0.0.1:80 --protocol http2" -RedirectStandardOutput $log -RedirectStandardError "$env:TEMP\cf3.err" -PassThru
$proc.Id | Out-File "$env:TEMP\cf3.pid"
# انتظار اتصال
Start-Sleep 20
$url = Select-String -Path $log -Pattern "https://[a-z-]+\.trycloudflare\.com" | Select-Object -Last 1
if ($url) { $url.Matches.Value | Out-File "$env:TEMP\cf3.url"; Write-Output "URL: $($url.Matches.Value)" }
else { Write-Output "No URL found yet" }
