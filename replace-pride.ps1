$file = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $file -Encoding UTF8
$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'id="pride"' -and $start -eq -1) { $start = $i - 2 }
    if ($start -gt -1 -and $lines[$i] -match 'HOW IT WORKS' -and $end -eq -1) { $end = $i - 1 }
}
Write-Host "Start=$start End=$end Total=$($lines.Count)"
