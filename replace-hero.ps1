$file = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $file -Encoding UTF8
$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'id="home"' -and $start -eq -1) { $start = $i - 2 }
    if ($start -gt -1 -and $lines[$i] -match 'MARQUEE' -and $end -eq -1) { $end = $i - 1 }
}
Write-Host "Hero: $start to $end  Total: $($lines.Count)"
