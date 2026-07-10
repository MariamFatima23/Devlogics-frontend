$f = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $f -Encoding UTF8
Write-Host "Total lines: $($lines.Count)"
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "export default function Home") {
        Write-Host "Found at line $($i+1): $($lines[$i])"
    }
    if ($lines[$i] -match "^import .* from") {
        if ($i -gt 10) { Write-Host "Import at line $($i+1): $($lines[$i])" }
    }
}
