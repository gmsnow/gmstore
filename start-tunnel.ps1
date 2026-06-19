$log = "$env:TEMP\tunnel.log"
"Starting tunnel at $(Get-Date)" | Out-File $log
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3000 serveo.net 2>&1 | Out-File $log -Append
