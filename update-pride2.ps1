$file = "c:\Users\Raza Computer\Desktop\E-portal\frontend\eportal\src\pages\Home.jsx"
$lines = Get-Content $file -Encoding UTF8
$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'id="pride"' -and $start -eq -1) { $start = $i - 1 }
    if ($start -gt -1 -and $lines[$i] -match 'HOW IT WORKS' -and $end -eq -1) { $end = $i - 1 }
}
Write-Host "Pride: $start to $end"

$newSection = @'

      {/* ══ OUR STUDENTS OUR PRIDE ══ */}
      <section id="pride" className="relative overflow-hidden py-24"
        style={{ background: 'linear-gradient(135deg, #03045e 0%, #023e8a 40%, #0077b6 70%, #03045e 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-[#0096c7]/20 blur-3xl" />
          <div className="absolute right-1/3 bottom-1/3 h-72 w-72 rounded-full bg-[#48cae4]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <span className="rounded-full border border-[#48cae4]/30 bg-[#023e8a]/50 px-4 py-1 text-xs font-bold text-[#90e0ef]">OUR STUDENTS</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Our Students, Our Pride</h2>
            <p className="mt-2 text-[#90e0ef]">Click any glowing circle to explore their journey</p>
          </div>

          {/* Layout: when no selection — circles centered; when selected — circles left, card right */}
          <div className={`flex transition-all duration-500 ${activeStudent !== null ? 'flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between' : 'flex-col items-center'}`}>

            {/* Circles area */}
            <div className={`relative transition-all duration-500 ${activeStudent !== null ? 'h-[480px] w-full max-w-[480px]' : 'h-[480px] w-full max-w-3xl'}`}>

              {/* Center text — visible when no student selected */}
              <AnimatePresence>
                {activeStudent === null && (
                  <motion.div key="center-text"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: [1, 1.07, 1] }} exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ scale: { repeat: Infinity, duration: 3.5 }, opacity: { duration: 0.4 } }}
                    className="absolute left-1/2 top-1/2 z-20 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{ background: 'linear-gradient(135deg, #03045e, #0077b6)', boxShadow: '0 0 50px rgba(0,119,182,0.7), 0 0 100px rgba(72,202,228,0.3)', border: '2px solid rgba(144,224,239,0.4)' }}>
                    <div className="px-3 text-center">
                      <p className="text-[11px] font-extrabold uppercase leading-tight tracking-wider text-[#ade8f4]">Our<br/>Students<br/>Our Pride</p>
                      <div className="mt-2 flex justify-center gap-0.5">{[1,2,3].map(s=><span key={s} className="text-[11px] text-[#48cae4]">✦</span>)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 8 student circles */}
              {students.map((student, index) => {
                const pos = CIRCLE_POS[index]
                const isSelected = activeStudent === index
                const floatAmt = [7,9,6,8,10,7,9,6][index]
                const dur = [3.2,3.8,2.9,4.1,3.5,4.3,2.7,3.9][index]
                return (
                  <motion.button key={index}
                    onClick={() => setActiveStudent(isSelected ? null : index)}
                    animate={{ y: [0, -floatAmt, 0] }}
                    transition={{ repeat: Infinity, duration: dur, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.14 }} whileTap={{ scale: 0.9 }}
                    className="absolute overflow-hidden rounded-full transition-all duration-300"
                    style={{ top: pos.top, left: pos.left, width: pos.w, height: pos.h,
                      border: isSelected ? '2.5px solid #48cae4' : '2px solid rgba(144,224,239,0.4)',
                      boxShadow: isSelected ? '0 0 25px rgba(72,202,228,0.8), 0 0 50px rgba(0,119,182,0.4)' : '0 0 18px rgba(0,119,182,0.6), 0 0 36px rgba(0,96,199,0.2)',
                      zIndex: isSelected ? 25 : 10 }} title={student.name}>
                    <img src={student.img} alt={student.name} className="h-full w-full object-cover"
                      onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex'}} />
                    <div className={`hidden h-full w-full items-center justify-center bg-gradient-to-br ${student.color} text-lg font-extrabold text-white`}>
                      {student.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    {isSelected && (
                      <motion.div className="absolute inset-0 rounded-full border-2 border-[#48cae4]"
                        animate={{ scale:[1,1.35], opacity:[0.8,0] }} transition={{ repeat:Infinity, duration:1.1 }} />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Student card — right side, only when selected */}
            <AnimatePresence>
              {sel && (
                <motion.div key={activeStudent}
                  initial={{ opacity:0, x:60, scale:0.9 }} animate={{ opacity:1, x:0, scale:1 }} exit={{ opacity:0, x:60, scale:0.9 }}
                  transition={{ type:'spring', stiffness:280, damping:24 }}
                  className="w-full max-w-md rounded-3xl p-7 shadow-2xl"
                  style={{ background:'linear-gradient(135deg,#03045e,#023e8a)', border:'1.5px solid rgba(72,202,228,0.3)', boxShadow:'0 0 50px rgba(0,119,182,0.4)' }}>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl" style={{ boxShadow:'0 0 20px rgba(72,202,228,0.5)' }}>
                        <img src={sel.img} alt={sel.name} className="h-full w-full object-cover"
                          onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex'}} />
                        <div className={`hidden h-full w-full items-center justify-center bg-gradient-to-br ${sel.color} text-xl font-extrabold text-white`}>
                          {sel.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                      </div>
                      <div>
                        <span className="rounded-full bg-[#48cae4]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#48cae4]">Student</span>
                        <h3 className="mt-1 text-xl font-extrabold text-white">{sel.name}</h3>
                        <p className="text-sm text-[#90e0ef]">{sel.role} · {sel.sem}</p>
                      </div>
                    </div>
                    <button onClick={()=>setActiveStudent(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/60 hover:bg-white/20 transition">✕</button>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#48cae4]/30 bg-[#0077b6]/20 px-4 py-1.5">
                    <motion.span animate={{ scale:[1,1.5,1] }} transition={{ repeat:Infinity, duration:1.5 }} className="h-1.5 w-1.5 rounded-full bg-[#48cae4]" />
                    <span className="text-xs font-bold text-[#48cae4]">{sel.badge}</span>
                  </div>

                  <div className="relative mt-4 rounded-2xl border border-[#0077b6]/30 bg-white/5 p-5">
                    <span className="absolute left-4 top-1 text-4xl font-bold leading-none text-[#48cae4]/15">"</span>
                    <p className="pl-4 text-sm italic leading-relaxed text-[#ade8f4]">{sel.quote}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {['Applications','Experience'].map((label,i)=>(
                      <div key={i} className="rounded-2xl border border-[#0077b6]/30 bg-white/5 p-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#90e0ef]">{label}</p>
                        <p className="mt-1 text-xs text-[#caf0f8]">{i===0?'Multiple services online':'Fast, reliable 24/7'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-center gap-1.5">
                    {students.map((_,i)=>(
                      <button key={i} onClick={()=>setActiveStudent(i)}
                        className={`rounded-full transition-all ${i===activeStudent?'h-2 w-6 bg-[#48cae4]':'h-2 w-2 bg-white/20'}`} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

'@

$before = $lines[0..($start-1)]
$after  = $lines[$end..($lines.Count-1)]
$result = $before + $newSection.Split("`n") + $after
Set-Content $file $result -Encoding UTF8
Write-Host "Done! Lines: $($result.Count)"
