$srcPath = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src"
$files = Get-ChildItem -Path $srcPath -Recurse -Filter "*.jsx"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $updated = $content `
        -replace '#5B21B6', '#0077b6' `
        -replace '#7C3AED', '#0096c7' `
        -replace '#6D28D9', '#023e8a' `
        -replace '#8B5CF6', '#48cae4' `
        -replace '#A78BFA', '#90e0ef' `
        -replace '#DDD6FE', '#caf0f8' `
        -replace '#EDE9FE', '#e0f7fa' `
        -replace '#F5F3FF', '#f0f9ff' `
        -replace '#4C1D95', '#03045e' `
        -replace '#3B1FA8', '#023e8a' `
        -replace '#29187A', '#03045e' `
        -replace '#1F1047', '#03045e' `
        -replace '#C4B5FD', '#90e0ef' `
        -replace 'text-\[#5B21B6\]', 'text-[#0077b6]' `
        -replace 'bg-\[#EDE9FE\]', 'bg-[#e0f7fa]' `
        -replace 'bg-\[#F5F3FF\]', 'bg-[#f0f9ff]' `
        -replace 'border-\[#DDD6FE\]', 'border-[#caf0f8]' `
        -replace 'text-indigo-600', 'text-[#0077b6]' `
        -replace 'text-indigo-700', 'text-[#023e8a]' `
        -replace 'bg-indigo-600', 'bg-[#0077b6]' `
        -replace 'bg-indigo-50', 'bg-[#e0f7fa]' `
        -replace 'border-indigo-200', 'border-[#caf0f8]' `
        -replace 'ring-indigo', 'ring-[#0077b6]'

    if ($content -ne $updated) {
        Set-Content -Path $file.FullName -Value $updated -Encoding UTF8
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Persian Blue applied to all files!"
