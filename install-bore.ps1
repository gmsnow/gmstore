$url = "https://github.com/ekzhang/bore/releases/download/v0.5.2/bore-v0.5.2-x86_64-pc-windows-msvc.zip"
$zip = "$env:TEMP\bore.zip"
$dest = "C:\Users\GMSNOW\bore.exe"

try {
  $wc = New-Object System.Net.WebClient
  $wc.DownloadFile($url, $zip)
  Expand-Archive -Path $zip -DestinationPath $env:TEMP -Force
  Move-Item -Path "$env:TEMP\bore.exe" -Destination $dest -Force
  Write-Output "bore installed"
} catch {
  Write-Output "Download failed"
}
