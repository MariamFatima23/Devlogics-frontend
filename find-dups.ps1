$f = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $f -Encoding UTF8
$keywords = @("id=`"home`"", "id=`"services`"", "id=`"pride`"", "id=`"howitworks`"", "id=`"reviews`"", "id=`"about`"", "id=`"contact`"", "HERO", "MARQUEE", "SERVICES", "HOW IT WORKS", "FEATURES", "REVIEWS", "ABOUT", "FOOTER", "STACKED")
foreach ($kw in $keywords) {
    $found = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match [regex]::Escape($kw)) { $found += ($i+1) }
    }
    if ($found.Count -gt 1) { Write-Host "DUPLICATE '$kw' at lines: $($found -join ', ')" }
    elseif ($found.Count -eq 1) { Write-Host "OK '$kw' at line: $($found[0])" }
}
