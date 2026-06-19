# Cloudflare Dynamic DNS — تحديث IP تلقائياً
# يُشغّل في Windows Task Scheduler كل 5 دقائق

param(
    [string]$ZoneName = "wanostore.eu.org",      # النطاق
    [string]$RecordName = "wanostore.eu.org",     # السجل (@ أو subdomain)
    [string]$ApiToken = "",                       # مفتاح Cloudflare API
    [string]$LogFile = "$env:TEMP\ddns-update.log"
)

function Write-Log { param([string]$Msg) "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $Msg" | Out-File $LogFile -Append }

if (-not $ApiToken) {
    Write-Log "ERROR: API_TOKEN غير موجود. أنشئ من https://dash.cloudflare.com/profile/api-tokens"
    exit 1
}

# جلب IP الحالي
try {
    $currentIp = (Invoke-WebRequest -Uri "https://ifconfig.me/ip" -UseBasicParsing -TimeoutSec 10).Content.Trim()
} catch {
    Write-Log "ERROR: فشل الحصول على IP الحالي"
    exit 1
}

# الحصول على Zone ID
$headers = @{ Authorization = "Bearer $ApiToken"; "Content-Type" = "application/json" }
try {
    $zones = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$ZoneName" -Headers $headers -Method Get
    if (-not $zones.success -or $zones.result.Count -eq 0) {
        Write-Log "ERROR: Zone '$ZoneName' غير موجود في Cloudflare"
        exit 1
    }
    $zoneId = $zones.result[0].id
} catch {
    Write-Log "ERROR: فشل الاتصال بـ Cloudflare API"
    exit 1
}

# الحصول على DNS record الحالي
try {
    $records = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?name=$RecordName&type=A" -Headers $headers -Method Get
} catch {
    Write-Log "ERROR: فشل الحصول على DNS records"
    exit 1
}

if ($records.result.Count -eq 0) {
    # إنشاء سجل جديد
    $body = @{ type = "A"; name = $RecordName; content = $currentIp; ttl = 120; proxied = $true } | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers -Method Post -Body $body
        if ($result.success) {
            Write-Log "OK: تم إنشاء سجل A → $currentIp"
        }
    } catch { Write-Log "ERROR: فشل إنشاء السجل" }
} else {
    $recordId = $records.result[0].id
    $oldIp = $records.result[0].content
    if ($oldIp -ne $currentIp) {
        # تحديث السجل
        $body = @{ type = "A"; name = $RecordName; content = $currentIp; ttl = 120; proxied = $true } | ConvertTo-Json
        try {
            $result = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records/$recordId" -Headers $headers -Method Put -Body $body
            if ($result.success) {
                Write-Log "OK: تم تحديث $oldIp → $currentIp"
            }
        } catch { Write-Log "ERROR: فشل تحديث السجل" }
    } else {
        Write-Log "INFO: IP لم يتغير ($currentIp)"
    }
}
