$log = "$env:TEMP\cf-tunnel.log"
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "C:\Users\GMSNOW\cloudflared.exe"
$psi.Arguments = "tunnel --url http://127.0.0.1:3000"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$proc = [System.Diagnostics.Process]::Start($psi)
Start-Sleep 15
$proc.Kill()
$output = $proc.StandardOutput.ReadToEnd()
$error = $proc.StandardError.ReadToEnd()
($output + $error) | Out-File $log
Write-Output "Done"
