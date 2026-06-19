$log = "$env:TEMP\lt.log"
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"
$psi.Arguments = "/c localtunnel --port 3000 --subdomain gmstorewano 2>&1"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)
Start-Sleep 20
$proc.Kill()
$output = $proc.StandardOutput.ReadToEnd()
$error = $proc.StandardError.ReadToEnd()
$output + $error | Out-File $log
Write-Output "Done"
