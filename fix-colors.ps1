$srcPath = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.jsx"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $updated = $content `
        -replace 'bg-indigo-600', 'bg-[#1a5c38]' `
        -replace 'hover:bg-indigo-700', 'hover:bg-[#154d2f]' `
        -replace 'hover:bg-indigo-600', 'hover:bg-[#1a5c38]' `
        -replace 'text-indigo-600', 'text-[#1a5c38]' `
        -replace 'text-indigo-700', 'text-[#154d2f]' `
        -replace 'text-indigo-100', 'text-green-200' `
        -replace 'text-indigo-200', 'text-green-300' `
        -replace 'bg-indigo-50', 'bg-[#1a5c38]/10' `
        -replace 'bg-indigo-100', 'bg-[#1a5c38]/15' `
        -replace 'border-indigo-500', 'border-[#1a5c38]' `
        -replace 'border-indigo-200', 'border-[#1a5c38]/30' `
        -replace 'border-indigo-300', 'border-[#1a5c38]/40' `
        -replace 'border-indigo-400', 'border-[#1a5c38]' `
        -replace 'ring-indigo-100', 'ring-[#1a5c38]/10' `
        -replace 'focus:border-indigo-500', 'focus:border-[#1a5c38]' `
        -replace 'focus:ring-indigo-100', 'focus:ring-[#1a5c38]/10' `
        -replace 'hover:bg-indigo-50', 'hover:bg-[#1a5c38]/10'
    
    if ($content -ne $updated) {
        Set-Content -Path $file.FullName -Value $updated -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done!"
