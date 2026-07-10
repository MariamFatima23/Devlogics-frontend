import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CourseApplyModal from './CourseApplyModal'
import api from '../utils/api'

export default function StackedCourses() {
  const scrollRef               = useRef(null)
  const { user }                = useAuth()
  const navigate                = useNavigate()
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [applyModal, setApplyModal] = useState(null)

  useEffect(() => {
    api.get('/courses')
      .then(r => setCourses(r.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -620, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  620, behavior: 'smooth' })

  const handleApply = (course) => {
    if (!user) { navigate('/login'); return }
    setApplyModal(course)
  }

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="h-80 w-80 shrink-0 animate-pulse rounded-3xl bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!courses.length) {
    return (
      <section id="courses" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="rounded-full bg-[#caf0f8] px-4 py-1 text-xs font-bold text-[#03045e]">AVAILABLE COURSES</span>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-5xl">
            Our <span className="bg-gradient-to-r from-[#0077b6] to-[#48cae4] bg-clip-text text-transparent">Courses</span>
          </h2>
          <p className="mt-6 text-gray-400">Courses will appear here once admin adds them.</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="courses" className="bg-white py-20">

        {/* ── Heading row — same 24px side padding as content ── */}
        <div className="px-6 mb-10">
          <div className="mx-auto max-w-7xl flex items-end justify-between">
            <div>
              <span className="rounded-full bg-[#caf0f8] px-4 py-1 text-xs font-bold text-[#03045e]">AVAILABLE COURSES</span>
              <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-5xl">
                Our{' '}
                <span className="bg-gradient-to-r from-[#0077b6] to-[#48cae4] bg-clip-text text-transparent">
                  Courses
                </span>
              </h2>
              <p className="mt-2 text-gray-500">
                Explore all available courses &amp; internships — apply online, fast and transparent
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button onClick={scrollLeft}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0077b6] text-[#0077b6] transition hover:bg-[#0077b6] hover:text-white">‹</button>
              <button onClick={scrollRight}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0077b6] text-[#0077b6] transition hover:bg-[#0077b6] hover:text-white">›</button>
            </div>
          </div>
        </div>

        {/* ── Scroll track — left margin = 24px, matches heading ── */}
   <div
  ref={scrollRef}
  className="scrollbar-hide"
  style={{
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '24px',
    paddingLeft: '16px',
    paddingRight: '16px',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
  }}
>       {courses.map((course, i) => {
            const bg     = `linear-gradient(135deg,${course.bgFrom||'#03045e'} 0%,${course.bgTo||'#0077b6'} 100%)`
            const accent = course.accent || '#48cae4'
            return (
              <motion.div
                key={course._id}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  flexShrink: 0,
                  
width: 'clamp(300px, 45vw, 560px)',                  minHeight: 360,
                  background: bg,
                  scrollSnapAlign: 'start',
                  borderRadius: '1.5rem',
                  boxShadow: '0 8px 32px rgba(3,4,94,0.18)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div className="flex h-full flex-col justify-between p-8 sm:p-10">
                  {/* Top */}
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                        style={{ backgroundColor:`${accent}25`, color:accent, border:`1px solid ${accent}45` }}>
                        {course.tag || course.type}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white/80">{course.mode}</span>
                      {course.certified && (
                        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/80">🎓 Certified</span>
                      )}
                      <span className="text-3xl">{course.icon}</span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-white sm:text-3xl">{course.title}</h3>
                    <p className="mt-1 text-sm font-semibold" style={{ color:accent }}>
                      {course.subtitle || `${course.duration} · ${course.level}`}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">{course.description}</p>

                    {course.features?.length > 0 && (
                      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
                        {course.features.slice(0,6).map((f,j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-white/85">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor:accent }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom */}
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-white">{course.duration}</p>
                        <p className="text-[11px]" style={{ color:accent }}>Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-white">{course.seats}</p>
                        <p className="text-[11px]" style={{ color:accent }}>Seats</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-white">
                          {course.isPaid ? `PKR ${course.price?.toLocaleString()}` : 'Free'}
                        </p>
                        <p className="text-[11px]" style={{ color:accent }}>Fee</p>
                      </div>
                      {course.type === 'internship' && course.stipend && (
                        <div className="text-center">
                          <p className="text-xl font-extrabold text-white">{course.stipend}</p>
                          <p className="text-[11px]" style={{ color:accent }}>Stipend</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleApply(course)}
                      className="rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95"
                      style={{ backgroundColor:accent, color:'#03045e' }}>
                      Apply Now →
                    </button>
                  </div>

                  {course.deadline && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">
                      ⏰ Deadline: {new Date(course.deadline).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-1 w-full" style={{ backgroundColor:`${accent}25` }}>
                  <div className="h-full" style={{ width:`${Math.min(100,((course.enrolled||0)/course.seats)*100)||((i+1)*20)}%`, backgroundColor:accent }} />
                </div>

                {/* Card number */}
                <div className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold"
                  style={{ backgroundColor:`${accent}20`, color:accent, border:`1px solid ${accent}40` }}>
                  {i+1}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {courses.map((_,i) => (
            <button key={i}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollTo({ left: i * (el.children[0]?.offsetWidth + 20 || 580), behavior:'smooth' })
              }}
              className="h-2.5 w-2.5 rounded-full bg-[#0077b6]/30 transition hover:bg-[#0077b6]" />
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          All courses available online · No office visit required
        </p>

        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </section>

      {applyModal && (
        <CourseApplyModal course={applyModal} onClose={() => setApplyModal(null)} />
      )}
    </>
  )
}
