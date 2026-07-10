$file = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $file -Encoding UTF8

$newHero = @'

      {/* ══ HERO — Full screen image slider ══ */}
      <section id="home" className="relative h-screen w-full overflow-hidden">
        {/* Slides */}
        {['/gallery/Ai.jpg','/gallery/Ai2.jpg','/gallery/Ai3.jpg','/gallery/Ai4.jpg'].map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: heroSlide === i ? 1 : 0, zIndex: heroSlide === i ? 1 : 0 }}
          >
            <img src={src} alt={`slide-${i}`}
              className="h-full w-full object-cover"
              onError={e => { e.target.src = '/gallery/1.png' }} />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        ))}

        {/* Text content on top of slider */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
          <motion.div
            key={heroSlide}
            initial={{ opacity:0, y:30 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7 }}
          >
            <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
              DataFrame  E-Portal — Online Application System
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl">
              {['Learn. Apply.', 'Grow. Succeed.', 'Track. Achieve.', 'Join. Enroll.'][heroSlide]}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
              Submit applications for courses, internships, certificates and more — all online, all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="rounded-xl bg-[#0077b6] px-8 py-3.5 font-bold text-white shadow-xl transition hover:scale-105 hover:bg-[#023e8a]">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="rounded-xl bg-[#0077b6] px-8 py-3.5 font-bold text-white shadow-xl transition hover:scale-105 hover:bg-[#023e8a]">
                    Join for Free
                  </Link>
                  <Link to="/login" className="rounded-xl border-2 border-white/40 px-8 py-3.5 font-semibold backdrop-blur-sm transition hover:border-white hover:bg-white/10">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {[0,1,2,3].map(i => (
            <button key={i} onClick={() => setHeroSlide(i)}
              className={`rounded-full transition-all duration-300 ${i===heroSlide?'h-3 w-8 bg-white':'h-3 w-3 bg-white/50 hover:bg-white/80'}`} />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={() => setHeroSlide(p => (p-1+4)%4)}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60">
          ‹
        </button>
        <button onClick={() => setHeroSlide(p => (p+1)%4)}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60">
          ›
        </button>

        {/* Stats bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4">
            {stats.map((s,i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-extrabold text-[#48cae4]">{s.value}</p>
                <p className="text-[11px] text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

'@

$before = $lines[0..120]
$after  = $lines[202..($lines.Count-1)]
$result = $before + $newHero.Split("`n") + $after
Set-Content $file $result -Encoding UTF8
Write-Host "Done! Lines: $($result.Count)"
