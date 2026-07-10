$file = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$content = Get-Content $file -Raw -Encoding UTF8

$oldStudents = @'
const studentPride = [
  {
    img: '/gallery/images (2).jpg',
    name: 'Mariam Fatima',
    role: 'Computer Science Student',
    quote: 'The E-Portal made scholarship and hostel applications so much easier and faster.',
  },
  {
    img: '/gallery/entranceiub.png',
    name: 'Ahmed Raza',
    role: 'Software Engineering Student',
    quote: 'IUB student services are now online — no more long queues or paperwork.',
  },
  {
    img: '/gallery/bagdad.png',
    name: 'Sana Malik',
    role: 'Business Administration Student',
    quote: 'Tracking my application status in real time helped me stay calm and prepared.',
  },
  {
    img: '/gallery/universitycampus.png',
    name: 'Usman Ali',
    role: 'Electrical Engineering Student',
    quote: 'The portal is intuitive and makes every student feel supported by IUB.',
  },
  {
    img: '/gallery/faculty.png',
    name: 'Hira Khan',
    role: 'Architecture Student',
    quote: 'IUB\u2019s student portal keeps everything visible, fast, and friendly for every department.',
  },
]
'@

$newStudents = @'
const studentPride = [
  { img: '/gallery/images (2).jpg',      name: 'Mariam Fatima',  role: 'Computer Science',        dept: 'CS Dept',   batch: '6th batchester', quote: 'The E-Portal made scholarship and hostel applications so much easier and faster. No more waiting in lines!' },
  { img: '/gallery/entranceiub.png',     name: 'Ahmed Raza',     role: 'Software Engineering',    dept: 'SE Dept',   batch: '4th batchester', quote: 'IUB student services are now online — no more long queues or paperwork. Highly recommend!' },
  { img: '/gallery/bagdad.png',          name: 'Sana Malik',     role: 'Business Administration', dept: 'BA Dept',   batch: '2nd batchester', quote: 'Tracking my application status in real time helped me stay calm and prepared throughout.' },
  { img: '/gallery/universitycampus.png',name: 'Usman Ali',      role: 'Electrical Engineering',  dept: 'EE Dept',   batch: '8th batchester', quote: 'The portal is intuitive and makes every student feel supported by IUB administration.' },
  { img: '/gallery/faculty.png',         name: 'Hira Khan',      role: 'Architecture',            dept: 'ARCH Dept', batch: '5th batchester', quote: 'DATAFRAME keeps everything visible, fast, and friendly for every department.' },
  { img: '/gallery/campus1.jpg',         name: 'Bilal Hussain',  role: 'Mathematics',             dept: 'MATH Dept', batch: '3rd batchester', quote: 'Getting my transcript was just a few clicks. Fast processing and great admin response.' },
  { img: '/gallery/campus2.jpg',         name: 'Zainab Noor',    role: 'Physics',                 dept: 'PHY Dept',  batch: '7th batchester', quote: 'The scholarship application process was transparent and hassle-free via the portal.' },
  { img: '/gallery/Sirdasdiqlibaray.jpg',name: 'Hamza Sheikh',   role: 'English Literature',      dept: 'ENG Dept',  batch: '1st batchester', quote: 'I submitted my certificate request online and got it approved within 24 hours!' },
  { img: '/gallery/Multimediaroom.jpg',  name: 'Ayesha Tariq',   role: 'Chemistry',               dept: 'CHEM Dept', batch: '4th batchester', quote: 'Hostel allocation process was smooth and I could track every update on the portal.' },
  { img: '/gallery/logo.png',            name: 'Faisal Iqbal',   role: 'Mechanical Engineering',  dept: 'ME Dept',   batch: '6th batchester', quote: 'Best thing about DATAFRAME is the real-time notifications. Always kept informed!' },
]
'@

$updated = $content.Replace($oldStudents.Trim(), $newStudents.Trim())
if ($content -ne $updated) {
    Set-Content $file $updated -Encoding UTF8
    Write-Host "studentPride updated!"
} else {
    Write-Host "No change — checking..."
    # Try line-by-line replacement
    $lines = Get-Content $file -Encoding UTF8
    $start = -1
    $end = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'const studentPride') { $start = $i }
        if ($start -ge 0 -and $lines[$i] -match '^\]$' -and $i -gt $start) { $end = $i; break }
    }
    if ($start -ge 0 -and $end -ge 0) {
        Write-Host "Found at lines $start to $end"
        $newLines = $newStudents.Trim() -split "`n"
        $result = $lines[0..($start-1)] + $newLines + $lines[($end+1)..($lines.Count-1)]
        Set-Content $file $result -Encoding UTF8
        Write-Host "Replaced via line method!"
    }
}
