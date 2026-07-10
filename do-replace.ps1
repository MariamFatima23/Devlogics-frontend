$file = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $file -Encoding UTF8

$newSection = @'
      {/* ══ OUR STUDENTS OUR PRIDE — Full width, no box, blue-persian theme ══ */}
      <section id="pride" className="relative overflow-hidden py-24 px-6"
        style={{ background: 'linear-gradient(135deg, #03045e 0%, #023e8a 35%, #0077b6 65%, #03045e 100%)' }}>

        {/* Animated background glow */}
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-[#0096c7]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 bottom-1/4 h-72 w-72 rounded-full bg-[#48cae4]/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0077b6]/20 blur-2xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="rounded-full border border-[#48cae4]/40 bg-[#023e8a]/50 px-4 py-1 text-xs font-bold text-[#90e0ef]">OUR STUDENTS</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Our Students, Our Pride</h2>
            <p className="mt-2 text-[#90e0ef]">Click any glowing circle to explore their journey</p>
          </div>

          {/* Full-width scattered circles area — NO BOX */}
          <div className="relative mx-auto h-[520px] w-full max-w-3xl">

            {/* CENTER: "Our Students Our Pride" — visible when no student selected */}
            <AnimatePresence>
              {activeStudent === null && (
                <motion.div
                  key="center-text"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ scale: { repeat: Infinity, duration: 3.5 }, opacity: { duration: 0.4 } }}
                  className="absolute left-1/2 top-1/2 z-20 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #03045e, #0077b6)',
                    boxShadow: '0 0 50px rgba(0,119,182,0.7), 0 0 100px rgba(0,150,199,0.3), inset 0 0 30px rgba(72,202,228,0.1)',
                    border: '2px solid rgba(144,224,239,0.4)',
                  }}
                >
                  <div className="px-3 text-center">
                    <p className="text-[11px] font-extrabold uppercase leading-tight tracking-wider text-[#ade8f4]">
                      Our<br />Students<br />Our Pride
                    </p>
                    <div className="mt-2 flex justify-center gap-0.5">
                      {[1,2,3].map(s => <span key={s} className="text-[11px] text-[#48cae4]">✦</span>)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STUDENT CARD — overlays center when student selected */}
            <AnimatePresence>
              {sel && (
                <motion.div
                  key={activeStudent}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="absolute left-1/2 top-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #03045e, #023e8a)',
                    border: '1.5px solid rgba(72,202,228,0.4)',
                    boxShadow: '0 0 40px rgba(0,119,182,0.5), 0 0 80px rgba(0,96,199,0.2)',
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setActiveStudent(null)}
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white/60 hover:bg-white/20 transition"
                  >✕</button>

                  {/* Student photo + name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl shrink-0"
                      style={{ boxShadow: '0 0 16px rgba(72,202,228,0.5)' }}>
                      <img src={sel.img} alt={sel.name} className="h-full w-full object-cover"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                      <div className={`hidden h-full w-full items-center justify-center bg-gradient-to-br ${sel.color} text-lg font-extrabold text-white`}>
                        {sel.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div>
                      <span className="rounded-full bg-[#48cae4]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#48cae4]">Student</span>
                      <p className="mt-0.5 font-extrabold text-white">{sel.name}</p>
                      <p className="text-xs text-[#90e0ef]">{sel.role} · {sel.batch}</p>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#48cae4]/30 bg-[#0077b6]/30 px-3 py-1">
                    <motion.span animate={{ scale:[1,1.5,1] }} transition={{ repeat:Infinity, duration:1.5 }}
                      className="h-1.5 w-1.5 rounded-full bg-[#48cae4]" />
                    <span className="text-[10px] font-bold text-[#48cae4]">{sel.badge}</span>
                  </div>

                  {/* Quote */}
                  <div className="rounded-xl bg-white/5 border border-[#0077b6]/30 p-3">
                    <p className="text-[11px] italic leading-relaxed text-[#ade8f4]">"{sel.quote}"</p>
                  </div>

                  {/* Dot nav */}
                  <div className="mt-3 flex justify-center gap-1.5">
                    {students.map((_,i) => (
                      <button key={i} onClick={() => setActiveStudent(i)}
                        className={`rounded-full transition-all ${i===activeStudent?'h-1.5 w-5 bg-[#48cae4]':'h-1.5 w-1.5 bg-white/20'}`} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 8 STUDENT CIRCLES — scattered, floating, no box/container */}
            {students.map((student, index) => {
              const pos = CIRCLE_POS[index]
              const isSelected = activeStudent === index
              const floatAmt = [7, 9, 6, 8, 10, 7, 9, 6][index]
              const dur = [3.2, 3.8, 2.9, 4.1, 3.5, 4.3, 2.7, 3.9][index]
              return (
                <motion.button
                  key={index}
                  onClick={() => setActiveStudent(isSelected ? null : index)}
                  animate={{ y: [0, -floatAmt, 0] }}
                  transition={{ repeat: Infinity, duration: dur, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute overflow-hidden rounded-full transition-all duration-300"
                  style={{
                    top: pos.top, left: pos.left, width: pos.w, height: pos.h,
                    border: isSelected ? '2.5px solid #48cae4' : '2px solid rgba(144,224,239,0.4)',
                    boxShadow: isSelected
                      ? '0 0 25px rgba(72,202,228,0.8), 0 0 50px rgba(0,119,182,0.4)'
                      : '0 0 18px rgba(0,119,182,0.6), 0 0 36px rgba(0,96,199,0.2)',
                    zIndex: isSelected ? 25 : 10,
                  }}
                  title={student.name}
                >
                  <img src={student.img} alt={student.name} className="h-full w-full object-cover"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                  <div className={`hidden h-full w-full items-center justify-center bg-gradient-to-br ${student.color} text-lg font-extrabold text-white`}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {isSelected && (
                    <motion.div className="absolute inset-0 rounded-full border-2 border-[#48cae4]"
                      animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.1 }} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

'@

$before = $lines[0..299]
$after  = $lines[473..($lines.Count-1)]
$result = $before + $newSection.Split("`n") + $after
Set-Content $file $result -Encoding UTF8
Write-Host "Done! Lines: $($result.Count)"
