$base = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\public\gallery\"

$images = @{
    "library.jpg"    = "https://www.iub.edu.pk/uploads/1823/news-letters/april-july-2021.pdf"
    "campus3.jpg"    = "https://www.iub.edu.pk/uploads/765/pop-up/1674729129-1.jpg"
    "campus4.jpg"    = "https://www.iub.edu.pk/uploads/765/pop-up/1674729838-2.jpg"
    "event.jpg"      = "https://www.iub.edu.pk/uploads/1/events/1700000000-event.jpg"
}

# Try IUB main site images
$iubImages = @(
    @{ name="slide1.jpg"; url="https://www.iub.edu.pk/uploads/1/sliders/1748343268-slide-1.jpg" },
    @{ name="slide2.jpg"; url="https://www.iub.edu.pk/uploads/1/sliders/1748343268-slide-2.jpg" },
    @{ name="slide3.jpg"; url="https://www.iub.edu.pk/uploads/1/sliders/1740647256-slider-1.jpg" },
    @{ name="slide4.jpg"; url="https://www.iub.edu.pk/uploads/1/sliders/1740647256-slider-2.jpg" },
    @{ name="slide5.jpg"; url="https://www.iub.edu.pk/uploads/1/sliders/1740647256-slider-3.jpg" },
    @{ name="slide6.jpg"; url="https://www.iub.edu.pk/uploads/1/sliders/1740647256-slider-4.jpg" }
)

foreach ($img in $iubImages) {
    $outPath = $base + $img.name
    try {
        Invoke-WebRequest -Uri $img.url -OutFile $outPath -UseBasicParsing -ErrorAction Stop
        Write-Host "Downloaded: $($img.name)"
    } catch {
        Write-Host "Failed: $($img.name) - $($_.Exception.Message)"
    }
}
Write-Host "Done!"
