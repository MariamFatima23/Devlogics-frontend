$src = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src"
Get-ChildItem -Path $src -Recurse -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw -Encoding UTF8
    $updated = $content -replace 'iub-logo\.svg', 'iub-logo.png'
    if ($content -ne $updated) {
        Set-Content -Path $_.FullName -Value $updated -Encoding UTF8
        Write-Host "Updated: $($_.Name)"
    }
}
Write-Host "All done!"
