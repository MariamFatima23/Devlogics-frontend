import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import StackedCourses from '../components/StackedCourses'
import api from '../utils/api'

const FALLBACK_SLIDES = [
  { imageUrl: '/gallery/Ai.png',  text: 'Learn. Apply. Grow.' },
  { imageUrl: '/gallery/Ai2.png', text: 'Track Your Progress.' },
  { imageUrl: '/gallery/Ai3.png', text: 'Achieve Your Goals.' },
  { imageUrl: '/gallery/Ai4.png', text: 'Join Thousands of Students.' },
]

const FALLBACK_SERVICES = [
  { _id:'1', icon:'💰', tag:'Financial Aid',  title:'Fee Concession',       description:'Apply for fee relief or installment plans.', bgFrom:'#03045e', bgTo:'#0077b6' },
  { _id:'2', icon:'🎓', tag:'Scholarship',    title:'Scholarship',          description:'Merit & need-based scholarships.',           bgFrom:'#023e8a', bgTo:'#0096c7' },
  { _id:'3', icon:'📜', tag:'Documents',      title:'Character Certificate',description:'Official certificate in 24 hours.',          bgFrom:'#03045e', bgTo:'#0077b6' },
  { _id:'4', icon:'🏠', tag:'Campus Life',    title:'Hostel Allocation',    description:'Apply for hostel room or transfer.',         bgFrom:'#023e8a', bgTo:'#0096c7' },
  { _id:'5', icon:'📋', tag:'Academic',       title:'Transcript Request',   description:'Official transcripts for admissions.',       bgFrom:'#03045e', bgTo:'#0077b6' },
  { _id:'6', icon:'⚠️', tag:'Support',        title:'Complaint',            description:'Submit formal complaints to admin.',         bgFrom:'#023e8a', bgTo:'#0096c7' },
]

const FALLBACK_REVIEWS = [
  { _id:'r1', studentName:'Ahmed Raza',  courseType:'Course',    rating:5, description:'Applying for the course was so easy! Approved within 2 days without visiting office.',     studentImage:'' },
  { _id:'r2', studentName:'Fatima Noor', courseType:'Internship',rating:5, description:'Internship portal processed everything in 24 hours. Excellent system for students.',       studentImage:'' },
  { _id:'r3', studentName:'Usman Ali',   courseType:'Course',    rating:4, description:'Fee concession was simple. Notifications kept me updated throughout the whole process.', studentImage:'' },
  { _id:'r4', studentName:'Sana Malik',  courseType:'Course',    rating:5, description:'Real-time tracking with full timeline. I could see every step clearly.',                 studentImage:'' },
]

const FALLBACK_STUDENTS = []  // Admin adds students via dashboard → Student Pride tab

// Positions arranged in a ring AROUND the center — center badge sits at ~50%/50%
// These positions form an orbit so nothing overlaps the center badge
const CPOS = [
  { top: '4%',  left: '6%',  w: 80, h: 80 },   // top-left
  { top: '2%',  left: '40%', w: 72, h: 72 },   // top-center
  { top: '4%',  left: '70%', w: 76, h: 76 },   // top-right
  { top: '35%', left: '76%', w: 70, h: 70 },   // mid-right
  { top: '65%', left: '70%', w: 78, h: 78 },   // bottom-right
  { top: '72%', left: '38%', w: 72, h: 72 },   // bottom-center
  { top: '65%', left: '4%',  w: 80, h: 80 },   // bottom-left
  { top: '35%', left: '0%',  w: 72, h: 72 },   // mid-left
]

const stats = [
  { value:'1000+', label:'Students' },
  { value:'50+',   label:'Programs' },
  { value:'98%',   label:'Satisfaction' },
]

const partners = [
  'Web Development','Artificial Intelligence','Digital Marketing','React Native','Python',
  'Machine Learning','Data Science','Cybersecurity','UI/UX Design','Cloud Computing',
  'Java','JavaScript','SEO','Graphic Design','DevOps',
]

const steps = [
  { step:'01', icon:'👤', title:'Create Account',    desc:'Register and complete your profile.' },
  { step:'02', icon:'📝', title:'Submit Application', desc:'Choose course, fill form, attach CV.' },
  { step:'03', icon:'🔍', title:'Admin Review',       desc:'Admin reviews and updates your status.' },
  { step:'04', icon:'✅', title:'Get Decision',       desc:'Receive Approved or Rejected with feedback.' },
]

const features = [
  { icon:'🔒', title:'Secure Login',       desc:'JWT auth with encrypted passwords.' },
  { icon:'📱', title:'Mobile Friendly',    desc:'Works on any device perfectly.' },
  { icon:'⚡', title:'Real-time Alerts',   desc:'Instant notifications on status change.' },
  { icon:'📊', title:'Track Applications', desc:'Full timeline for every application.' },
  { icon:'📎', title:'Document Upload',    desc:'Attach PDFs, images, Word docs.' },
  { icon:'🛡️', title:'Admin Dashboard',   desc:'Powerful panel to manage everything.' },
]

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`h-4 w-4 ${i<=n?'text-yellow-400':'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [slide, setSlide]                 = useState(0)
  const [slides, setSlides]               = useState(FALLBACK_SLIDES)
  const [services, setServices]           = useState(FALLBACK_SERVICES)
  const [reviews, setReviews]             = useState(FALLBACK_REVIEWS)
  const [students, setStudents]           = useState(FALLBACK_STUDENTS)
  const [activeStudent, setActiveStudent] = useState(null)
  const [activeReview, setActiveReview]   = useState(0)

  useEffect(() => {
    api.get('/hero-slides').then(r => { if (r.data?.length) setSlides(r.data) }).catch(() => {})
    api.get('/services').then(r => { if (r.data?.length) setServices(r.data) }).catch(() => {})
    api.get('/reviews').then(r => { if (r.data?.length) setReviews(r.data) }).catch(() => {})
    api.get('/student-pride').then(r => { if (r.data?.length) setStudents(r.data) }).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  useEffect(() => {
    if (!reviews.length) return
    const t = setInterval(() => setActiveReview(p => (p + 1) % reviews.length), 5000)
    return () => clearInterval(t)
  }, [reviews.length])

  const sel = activeStudent !== null ? students[activeStudent] : null
  const visibleStudents = students.slice(0, 8)

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section id="home" className="relative h-screen w-full overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: slide===i?1:0, zIndex: slide===i?1:0 }}>
            <img src={s.imageUrl||s.src} alt="" className="h-full w-full object-cover"
              onError={e => { e.target.src = '/gallery/2.png' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          </div>
        ))}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.7 }}>
              <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-5 py-1.5 text-xs font-semibold backdrop-blur-sm">DevLogics E-Portal</span>
              <h1 className="text-5xl font-extrabold leading-tight drop-shadow-2xl sm:text-6xl lg:text-7xl">{slides[slide]?.text || 'Learn. Apply. Grow.'}</h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Apply for courses, internships and services — all online, 24/7.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {user ? (
                  <Link to="/dashboard" className="rounded-xl bg-[#0056D2] px-8 py-3.5 font-bold text-white shadow-xl transition hover:scale-105">Go to Dashboard →</Link>
                ) : (
                  <>
                    <Link to="/register" className="rounded-xl bg-[white] px-8 py-3.5 font-bold text-[#0056D2] shadow-xl transition  hover:bg-gray/10 hover:scale-105">Join for Free</Link>
                    <Link to="/login" className="rounded-xl border-2 border-white/40 px-8 py-3.5 font-semibold backdrop-blur-sm transition hover:border-white hover:bg-white/10">Sign In</Link>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Dots */}
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${i===slide?'h-3 w-8 bg-white':'h-3 w-3 bg-white/50'}`} />
          ))}
        </div>
        {/* Arrows */}
        <button onClick={() => setSlide(p => (p-1+slides.length)%slides.length)}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60">‹</button>
        <button onClick={() => setSlide(p => (p+1)%slides.length)}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60">›</button>
        {/* Stats bar */}
<div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#4361ee]/30 bg-[#1d4ed8]/60 backdrop-blur-md">          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-6 py-3 sm:grid-cols-4">
            {stats.map((s,i) => (
              <div key={i} className="py-3 text-center">
                <p className="text-lg font-extrabold text-white">{s.value}</p>
                <p className="text-[11px] text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="overflow-hidden border-y py-12 border-[#e8f4fd] bg-[#1C39BB ] py-6">
        <div className="flex">
          {[0,1].map(p => (
            <div key={p} className="flex shrink-0 gap-10 pr-10" style={{ animation:'mqscroll 22s linear infinite' }}>
              {partners.map((d,i) => <span key={i} className="dp-tiny whitespace-nowrap font-semibold text-[#Hex Code: #1C39BB ]">✦ {d}</span>)}
            </div>
          ))}
        </div>
        <style>{`@keyframes mqscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </section>

      <StackedCourses />

      {/* ── SERVICES (dynamic from admin) ── */}
      <section id="services" className="bg-[#f0f9ff] py-20">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-7xl px-6 text-center">
          <span className="rounded-full bg-[#03045e] px-4 py-1 text-xs font-bold text-white">OUR SERVICES</span>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">Available Student Services</h2>
          <p className="mt-2 text-gray-500">Submit online applications for any of these services</p>
        </div>

        {/* Auto-scroll carousel — clips only the carousel row, not the whole section */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f0f9ff] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f0f9ff] to-transparent" />
          <div style={{ overflow:'hidden' }}>
            <div className="flex">
              {[0,1].map(p => (
                <div key={p} className="flex shrink-0 gap-5" style={{ animation:'svcscroll 28s linear infinite' }}>
                  <div className="shrink-0 w-4" />
                  {services.map((s,i) => (
                    <motion.div key={`${p}-${i}`} whileHover={{ y:-6 }}
                      className="w-72 shrink-0 overflow-hidden rounded-2xl p-6 shadow-md"
                      style={{ background:`linear-gradient(135deg,${s.bgFrom||'#03045e'},${s.bgTo||'#0077b6'})` }}>
                      <span className="mb-3 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">{s.tag}</span>
                      <div className="mb-3 text-3xl">{s.icon}</div>
                      <h3 className="mb-1 font-bold text-white">{s.title}</h3>
                      <p className="text-sm text-white/80">{s.description||s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <style>{`@keyframes svcscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </div>

        <div className="mt-10 text-center">
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#03045e] px-8 py-3.5 font-bold text-white shadow-lg transition hover:bg-[#023e8a]">
            Apply for a Service →
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" className=" px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="rounded-full bg-[#e0f7fa] px-4 py-1 text-xs font-bold text-[#03045e]">SIMPLE PROCESS</span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-2 text-gray-500">4 simple steps from sign-up to decision</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s,i) => (
              <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.15 }}
                className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
                  style={{ background:'linear-gradient(135deg,#023e8a,#03045e)' }}>
                  {s.icon}
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#48cae4] text-[10px] font-extrabold text-[#03045e]">{s.step}</span>
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="rounded-full bg-[#0077b6] px-4 py-1 text-xs font-bold text-white">WHY CHOOSE US</span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">Everything in One Portal</h2>
            <p className="mt-2 text-[#0096c7]">Built for students, managed by administration</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f,i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                whileHover={{ scale:1.03 }}
                className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-[#0077b6] to-[#023e8a] p-5 shadow-lg">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-2xl">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-[#90e0ef]">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STUDENTS OUR PRIDE ── */}
      <section id="pride" className="relative overflow-hidden  py-16 px-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#caf0f8]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#90e0ef]/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Heading */}
          <div className="mb-8 text-center">
            <span className="rounded-full bg-[#03045e] px-4 py-1 text-xs font-bold text-white">OUR STUDENTS</span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Students, Our Pride</h2>
            <p className="mt-2 text-gray-500">Click on any student to read their story</p>
          </div>

          {/* Row — centered when no selection, split when selected */}
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center">

            {/* ── Circles panel — size shrinks when few students ── */}
            {(() => {
              const count = visibleStudents.length
              // Scale panel height based on number of students
              const panelH = count === 0 ? 200 : count <= 2 ? 260 : count <= 4 ? 340 : 480
              const panelW = activeStudent !== null ? 460 : (count === 0 ? 260 : count <= 2 ? 300 : count <= 4 ? 380 : 540)
              return (
            <motion.div
              layout
              transition={{ type:'spring', stiffness:260, damping:30 }}
              className="relative shrink-0"
              style={{ height: panelH, width: panelW }}
            >
              {/* Centre badge — always perfectly centered */}
              <motion.div
                animate={{ scale:[1, 1.07, 1] }}
                transition={{ repeat:Infinity, duration:3.2, ease:'easeInOut' }}
                className="absolute z-30 flex h-[130px] w-[130px] items-center justify-center rounded-full shadow-2xl"
                style={{
                  top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)',
                  background:'linear-gradient(135deg,#03045e,#0077b6)',
                  border:'3px solid #48cae4',
                  boxShadow:'0 0 40px rgba(0,119,182,0.5)',
                }}>
                <div className="px-3 text-center">
                  <p className="text-[10px] font-extrabold uppercase leading-tight tracking-widest text-[#ade8f4]">Our<br/>Students<br/>Our Pride</p>
                  <div className="mt-2 flex justify-center gap-0.5">
                    {[1,2,3].map(s => <span key={s} className="text-[10px] text-[#48cae4]">✦</span>)}
                  </div>
                </div>
              </motion.div>

              {/* No students hint */}
              {count === 0 && (
                <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
                  Admin will add student stories here
                </p>
              )}

              {/* Student circles */}
              {visibleStudents.map((student, index) => {
                const pos   = CPOS[index % CPOS.length]
                const isSel = activeStudent === index
                const imgUrl = student.image
                  ? `http://localhost:5000/uploads/${student.image}`
                  : student.img || ''

                return (
                  <motion.button
                    key={student._id}
                    onClick={() => setActiveStudent(isSel ? null : index)}
                    animate={{ y:[0, 8, 0] }}
                    transition={{ repeat:Infinity, duration:3 + index*0.38, ease:'easeInOut' }}
                    whileHover={{ scale:1.13 }}
                    whileTap={{ scale:0.9 }}
                    className="absolute overflow-hidden rounded-full"
                    style={{
                      top:pos.top, left:pos.left, width:pos.w, height:pos.h,
                      border: isSel ? '3px solid #0077b6' : '2.5px solid #90e0ef',
                      boxShadow: isSel
                        ? '0 0 0 5px rgba(0,119,182,0.2), 0 8px 28px rgba(0,119,182,0.45)'
                        : '0 4px 16px rgba(3,4,94,0.18)',
                      zIndex: isSel ? 25 : 10,
                    }}
                  >
                    {imgUrl && (
                      <img src={imgUrl} alt={student.name} className="h-full w-full object-cover"
                        onError={e => { e.currentTarget.style.display='none' }} />
                    )}
                    <div className={`${imgUrl?'hidden ':''}flex h-full w-full items-center justify-center bg-gradient-to-br ${student.color||'from-blue-600 to-blue-900'} text-base font-extrabold text-white`}>
                      {student.name?.split(' ').map(n=>n[0]).join('')}
                    </div>
                    {isSel && (
                      <motion.div className="absolute inset-0 rounded-full border-2 border-[#0077b6]"
                        animate={{ scale:[1,1.5], opacity:[0.7,0] }}
                        transition={{ repeat:Infinity, duration:1 }} />
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
              )
            })()}

            {/* ── Detail card — slides in from right, only when a student selected ── */}
            <AnimatePresence mode="wait">
              {sel && (
                <motion.div
                  key={activeStudent}
                  initial={{ opacity:0, x:80 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{   opacity:0, x:80 }}
                  transition={{ type:'spring', stiffness:280, damping:26 }}
                  className="w-full max-w-sm shrink-0 overflow-hidden rounded-3xl shadow-2xl"
                  style={{ background:'linear-gradient(135deg,#03045e 0%,#023e8a 60%,#0077b6 100%)' }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#48cae4,#0096c7,#03045e)' }} />

                  <div className="p-7">
                    {/* Close + photo + name */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl"
                          style={{ border:'2px solid #48cae4', boxShadow:'0 0 18px rgba(72,202,228,0.5)' }}>
                          {sel.image ? (
                            <img src={`http://localhost:5000/uploads/${sel.image}`} alt={sel.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${sel.color||'from-blue-600 to-blue-900'} text-xl font-extrabold text-white`}>
                              {sel.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="rounded-full bg-[#48cae4]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#48cae4]">
                            {sel.courseType || 'Student'}
                          </span>
                          <h3 className="mt-1 text-xl font-extrabold text-white">{sel.name}</h3>
                          <p className="text-sm text-[#90e0ef]">
                            {sel.role}{sel.courseName ? ` · ${sel.courseName}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveStudent(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/60 transition hover:bg-white/20">
                        ✕
                      </button>
                    </div>

                    {/* Badge */}
                    {sel.badge && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#48cae4]/30 bg-[#0077b6]/25 px-4 py-1.5">
                        <motion.span
                          animate={{ scale:[1,1.6,1] }}
                          transition={{ repeat:Infinity, duration:1.4 }}
                          className="h-1.5 w-1.5 rounded-full bg-[#48cae4]" />
                        <span className="text-xs font-bold text-[#48cae4]">{sel.badge}</span>
                      </div>
                    )}

                    {/* Quote */}
                    <div className="relative mt-5 rounded-2xl border border-[#0077b6]/30 bg-white/5 p-5">
                      <span className="absolute left-4 top-0 text-5xl font-bold leading-none text-[#48cae4]/12">"</span>
                      <p className="pl-4 text-sm italic leading-relaxed text-[#ade8f4]">{sel.quote}</p>
                    </div>

                    {/* Dot nav */}
                    <div className="mt-6 flex justify-center gap-1.5">
                      {visibleStudents.map((_, i) => (
                        <button key={i} onClick={() => setActiveStudent(i)}
                          className={`rounded-full transition-all duration-300 ${i===activeStudent ? 'h-2 w-7 bg-[#48cae4]' : 'h-2 w-2 bg-white/20 hover:bg-white/40'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* ── REVIEWS (dynamic, approved only) ── */}
      <section id="reviews" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="rounded-full bg-[#e0f7fa] px-4 py-1 text-xs font-bold text-[#03045e]">STUDENT REVIEWS</span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">What Students Say</h2>
          </div>
          {reviews.length > 0 && (
            <>
              <motion.div key={activeReview} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
                className="mb-6 overflow-hidden rounded-3xl shadow-2xl" style={{ background:'linear-gradient(135deg,#03045e,#0077b6)' }}>
                <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4 ring-[#48cae4]/30">
                    {reviews[activeReview]?.studentImage ? (
                      <img src={`http://localhost:5000/uploads/${reviews[activeReview].studentImage}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/20 text-2xl font-extrabold text-white">
                        {reviews[activeReview]?.studentName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Stars n={reviews[activeReview]?.rating || 5} />
                    <p className="mt-3 text-lg font-medium leading-relaxed text-[#caf0f8]">"{reviews[activeReview]?.description}"</p>
                    <p className="mt-4 font-bold text-white">{reviews[activeReview]?.studentName}</p>
                    <p className="text-sm text-[#90e0ef]">{reviews[activeReview]?.courseType} {reviews[activeReview]?.courseName ? `· ${reviews[activeReview].courseName}` : ''}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-2 pb-5">
                  {reviews.map((_,i) => (
                    <button key={i} onClick={()=>setActiveReview(i)} className={`rounded-full transition-all ${i===activeReview?'h-2 w-8 bg-[#48cae4]':'h-2 w-2 bg-white/30'}`} />
                  ))}
                </div>
              </motion.div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {reviews.map((r,i) => (
                  <motion.button key={r._id} onClick={()=>setActiveReview(i)} whileHover={{ y:-4 }}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${i===activeReview?'border-[#0077b6] bg-[#f0f9ff] shadow-md':'border-gray-200 bg-white hover:border-[#0096c7]/40'}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#e0f7fa] text-xs font-bold text-[#03045e]">
                        {r.studentImage ? (
                          <img src={`http://localhost:5000/uploads/${r.studentImage}`} alt="" className="h-full w-full object-cover" />
                        ) : r.studentName?.[0]}
                      </div>
                      <Stars n={r.rating} />
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">"{r.description}"</p>
                    <p className="mt-2 text-xs font-bold text-gray-900">{r.studentName}</p>
                    <p className="text-[10px] text-gray-400">{r.courseType}</p>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className=" px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="w-full lg:w-2/5">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img src="/gallery/Ai.png" alt="Portal" className="h-72 w-full object-cover" onError={e=>{e.target.src='/gallery/2.png'}} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03045e]/80 to-transparent" />
                <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl" style={{ background:'linear-gradient(135deg,#03045e,#0077b6)' }}>🎓</div>
                  <div><p className="text-xs font-extrabold text-[#03045e]">DevLogics Portal</p><p className="text-[10px] text-gray-500">4.8 ★ · 1,000+ Students</p></div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="w-full lg:w-3/5">
              <span className="rounded-full bg-[#e0f7fa] px-4 py-1 text-xs font-bold text-[#03045e]">ABOUT THE PORTAL</span>
              <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">A Smarter Way to<br /><span className="text-[#0077b6]">Learn &amp; Apply</span></h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">DevLogics E-Portal is a complete digital solution for course and service management. Students apply online, track status in real-time, and get decisions with full feedback.</p>
              <ul className="mt-6 space-y-2">
                {['Apply online — no office visits','Upload CV and documents securely','Track every application with timeline','Real-time notifications on changes','Admin review with detailed feedback','Available 24/7 from any device'].map((item,i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e0f7fa] text-[10px] font-bold text-[#0077b6]">✓</span>{item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Link to="/register" className="rounded-xl px-6 py-3 font-bold text-white transition hover:opacity-90" style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>Get Started Free →</Link>
                <Link to="/login" className="rounded-xl border-2 border-[#0077b6] px-6 py-3 font-bold text-[#0077b6] transition hover:bg-[#e0f7fa]">Sign In</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
   <section id="contact" className="bg-white px-6 py-20">
  <div className="mx-auto max-w-6xl">

    {/* Heading */}
    <div className="mb-12 text-center">
      <span className="rounded-full bg-[#1C39BB] px-4 py-1 text-xs font-bold text-[#1C39BB]">
        GET IN TOUCH
      </span>

      <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Contact Us
      </h2>

      <p className="mt-2 text-gray-500">
        Have questions? Our team is ready to help
      </p>
    </div>


    <div className="grid gap-8 lg:grid-cols-2">


      {/* LEFT CONTACT CARDS */}
      <div className="space-y-5">

        {[
          {icon:'📍',t:'Address',v:'DevLogics Campus, Pakistan'},
          {icon:'📞',t:'Phone',v:'+92-XXX-XXXXXXX'},
          {icon:'✉️',t:'Email',v:'info@devlogics.com'},
          {icon:'🌐',t:'Website',v:'www.devlogics.com'},
          {icon:'⏰',t:'Hours',v:'Mon-Fri 9AM-5PM'}
        ].map((item,i)=>(

          <motion.div
            key={i}
            whileHover={{x:6}}
            className="
              flex items-start gap-4
              rounded-2xl
              bg-[#0056D2]
              p-6
              border-2 border-[#023e8a]
              shadow-lg shadow-[#1C39BB]/20
              transition
            "
          >

            {/* Icon */}
            <div className="
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-xl
              bg-white/20
              text-2xl
              border border-white/30
            ">
              {item.icon}
            </div>


            <div>

              <p className="
                text-xs 
                font-bold 
                uppercase 
                tracking-wide
                text-[#90e0ef]
              ">
                {item.t}
              </p>


              <p className="
                mt-1
                text-sm
                font-semibold
                text-white
              ">
                {item.v}
              </p>

            </div>

          </motion.div>

        ))}

      </div>




      {/* RIGHT FORM */}
      <div className="
        rounded-2xl
        bg-[#0056D2]
        p-8
        border-2 border-[#023e8a]
        shadow-lg shadow-[#0056D2]/20
      ">


        <h3 className="
          mb-6
          text-xl
          font-bold
          text-white
        ">
          Send a Message
        </h3>



        <form
          className="space-y-5"
          onSubmit={(e)=>{
            e.preventDefault()
            alert("Message sent!")
          }}
        >


          <div className="grid gap-5 sm:grid-cols-2">


            {['Full Name','Email'].map((label,i)=>(

              <div key={i}>

                <label className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-white
                ">
                  {label}
                </label>


                <input
                  type={i===1 ? "email" : "text"}
                  required
                  placeholder={
                    i===1 
                    ? "you@email.com" 
                    : "Your name"
                  }

                  className="
                    w-full
                    rounded-xl
                    border-2
                    border-[#023e8a]
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-[#0056D2]
                    placeholder:text-gray-400
                    outline-none
                    focus:border-[#90e0ef]
                  "
                />

              </div>

            ))}

          </div>




          <div>

            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-white
            ">
              Message
            </label>


            <textarea
              required
              rows="4"
              placeholder="Write your message..."

              className="
                w-full
                rounded-xl
                border-2
                border-[#023e8a]
                bg-white
                px-4
                py-3
                text-sm
                text-[#0056D2]
                placeholder:text-gray-400
                outline-none
                focus:border-[#90e0ef]
              "
            />

          </div>




          <button
            type="submit"

            className="
              w-full
              rounded-xl
              py-3
              font-bold
              text-white
              transition
              hover:bg-gray-300
            "

            style={{
              background:
              'linear-gradient(135deg,#0077b6,#03045e)'
            }}
          >
            Send Message →
          </button>


        </form>

      </div>


    </div>

  </div>
</section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'linear-gradient(135deg,#03045e,#023e8a)' }} className="px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background:'rgba(255,255,255,0.15)' }}>🎓</div>
              <div>
                <p className="font-extrabold">DevLogics E-Portal</p>
                <p className="text-xs text-[#90e0ef]">Course &amp; Service Management</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {['#home','#courses','#services','#about','#contact'].map((href,i) => (
                <a key={i} href={href} className="text-[#90e0ef] hover:text-white transition capitalize">{href.slice(1)||'Home'}</a>
              ))}
            </div>
            <div className="flex gap-3">
              <Link to="/login" className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:border-white transition">Login</Link>
              <Link to="/register" className="rounded-lg bg-[#0077b6] px-4 py-2 text-sm font-semibold hover:bg-[#0096c7] transition">Register</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-[#90e0ef]">
            © {new Date().getFullYear()} DevLogics E-Portal. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
