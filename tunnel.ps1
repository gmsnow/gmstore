$tries = 0
$maxTries = 10
while ($tries -lt $maxTries) {
  try {
    $proc = Start-Process -FilePath "ssh" -ArgumentList "-o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3000 serveo.net" -NoNewWindow -PassThru
    $proc.WaitForExit()
  } catch {
    Write-Output "Tunnel crashed, restarting (attempt $($tries+1))..."
  }
  Start-Sleep 5
  $tries++
}
