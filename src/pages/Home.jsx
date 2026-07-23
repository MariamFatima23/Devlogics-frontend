import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import StackedCourses from '../components/StackedCourses'
import api from '../utils/api'
import { FaMoneyBillWave, FaGraduationCap, FaFileAlt, FaHome, FaClipboardList, FaEdit,
         FaUserPlus, FaPaperPlane, FaSearch, FaCheckCircle,
         FaLock, FaMobileAlt, FaBell, FaChartBar, FaUpload, FaCogs,
         FaPhone, FaEnvelope, FaGlobe, FaClock,
         FaFacebook, FaInstagram, FaTwitter, FaLinkedin,
         FaReact, FaPython, FaJava, FaJs, FaCloud, FaShieldAlt,
         FaRobot, FaDatabase, FaPaintBrush, FaServer, FaCode,
         FaSearchPlus, FaStar, FaBook, FaMedal } from 'react-icons/fa'
import { FaLaptopCode } from 'react-icons/fa6'

import { MdLocationOn, MdDesignServices } from 'react-icons/md'

// Map partner/technology names to icons
const PARTNER_ICON_MAP = {
  'React Native':      { icon: FaReact,        color: '#61DAFB' },
  'Python':            { icon: FaPython,        color: '#FFD43B' },
  'Machine Learning':  { icon: FaRobot,         color: '#FF6B6B' },
  'Data Science':      { icon: FaDatabase,      color: '#4ECDC4' },
  'Cybersecurity':     { icon: FaShieldAlt,     color: '#FF9F43' },
  'UI/UX Design':      { icon: MdDesignServices,color: '#A29BFE' },
  'Cloud Computing':   { icon: FaCloud,         color: '#74B9FF' },
  'Java':              { icon: FaJava,          color: '#F89820' },
  'JavaScript':        { icon: FaJs,            color: '#F7DF1E' },
  'SEO':               { icon: FaSearchPlus,    color: '#00B894' },
  'Graphic Design':    { icon: FaPaintBrush,    color: '#FD79A8' },
  'DevOps':            { icon: FaServer,        color: '#6C5CE7' },
  'Web Development':   { icon: FaCode,          color: '#00CEC9' },
  'Artificial Intelligence': { icon: FaRobot,  color: '#FDCB6E' },
  'Digital Marketing': { icon: FaGlobe,         color: '#E17055' },
}

function ServiceIcon({ k }) {
  const map = {
    money:     FaMoneyBillWave,
    grad:      FaGraduationCap,
    file:      FaFileAlt,
    house:     FaHome,
    clipboard: FaClipboardList,
    edit:      FaEdit,
  }
  const I = map[k] || FaFileAlt
  return <I className="text-3xl text-white" />
}

function StepIcon({ k }) {
  const map = {
    user:     FaUserPlus,
    submit:   FaBook,
    review:   FaLaptopCode,
    decision: FaMedal,
  }
  const I = map[k] || FaUserPlus
  return <I className="text-2xl text-white" />
}

function FeatureIcon({ k }) {
  const map = {
    lock:   FaLock,
    mobile: FaMobileAlt,
    bell:   FaBell,
    chart:  FaChartBar,
    upload: FaUpload,
    cogs:   FaCogs,
  }
  const I = map[k] || FaCogs
  return <I className="text-2xl text-white" />
}

const FALLBACK_SLIDES = [
  { imageUrl: '/gallery/Ai.png',  text: 'Learn. Apply. Grow.' },
  { imageUrl: '/gallery/Ai2.png', text: 'Track Your Progress.' },
  { imageUrl: '/gallery/Ai3.png', text: 'Achieve Your Goals.' },
  { imageUrl: '/gallery/Ai4.png', text: 'Join Thousands of Students.' },
]

const FALLBACK_SERVICES = [
  { _id:'1', iconKey:'money',      tag:'Financial Aid',  title:'Fee Concession',        description:'Apply for fee relief or installment plans.', bgFrom:'#04065c', bgTo:'#0077b6' },
  { _id:'2', iconKey:'grad',       tag:'Scholarship',    title:'Scholarship',           description:'Merit & need-based scholarships.',           bgFrom:'#023e8a', bgTo:'#0096c7' },
  { _id:'3', iconKey:'file',       tag:'Documents',      title:'Character Certificate', description:'Official certificate in 24 hours.',          bgFrom:'#04065c', bgTo:'#0077b6' },
  { _id:'4', iconKey:'house',      tag:'Campus Life',    title:'Hostel Allocation',     description:'Apply for hostel room or transfer.',         bgFrom:'#023e8a', bgTo:'#0096c7' },
  { _id:'5', iconKey:'clipboard',  tag:'Academic',       title:'Transcript Request',    description:'Official transcripts for admissions.',       bgFrom:'#04065c', bgTo:'#0077b6' },
  { _id:'6', iconKey:'edit',       tag:'Support',        title:'Complaint',             description:'Submit formal complaints to admin.',         bgFrom:'#023e8a', bgTo:'#0096c7' },
]


const FALLBACK_REVIEWS = [
  { _id:'r1', studentName:'Ahmed Raza',  courseType:'Course',    rating:5, description:'Applying for the course was so easy! Approved within 2 days without visiting office.',     studentImage:'' },
  { _id:'r2', studentName:'Fatima Noor', courseType:'Internship',rating:5, description:'Internship portal processed everything in 24 hours. Excellent system for students.',       studentImage:'' },
  { _id:'r3', studentName:'Usman Ali',   courseType:'Course',    rating:4, description:'Fee concession was simple. Notifications kept me updated throughout the whole process.', studentImage:'' },
  { _id:'r4', studentName:'Sana Malik',  courseType:'Course',    rating:5, description:'Real-time tracking with full timeline. I could see every step clearly.',                 studentImage:'' },
]

const FALLBACK_SETTINGS = {
  portalName: 'DevLogics E-Portal',
  tagline: 'Learn. Apply. Grow.',
  heroSubtext: 'Apply for courses, internships and services — all online, 24/7.',
  logoUrl: '',
  statStudents: '1000+',
  statPrograms: '50+',
  statSatisfaction: '98%',
  footerTagline: 'Course & Service Management',
  partners: [
    'Web Development','Artificial Intelligence','Digital Marketing','React Native','Python',
    'Machine Learning','Data Science','Cybersecurity','UI/UX Design','Cloud Computing',
    'Java','JavaScript','SEO','Graphic Design','DevOps',
  ],
  howItWorks: [
    { step:'01', icon:'user',     title:'Create Account',    desc:'Register and complete your profile.' },
    { step:'02', icon:'submit',   title:'Submit Application', desc:'Choose course, fill form, attach CV.' },
    { step:'03', icon:'review',   title:'Admin Review',       desc:'Admin reviews and updates your status.' },
    { step:'04', icon:'decision', title:'Get Decision',       desc:'Receive Approved or Rejected with feedback.' },
  ],
  features: [
    { icon:'lock',   title:'Secure Login',       desc:'JWT auth with encrypted passwords.' },
    { icon:'mobile', title:'Mobile Friendly',    desc:'Works on any device perfectly.' },
    { icon:'bell',   title:'Real-time Alerts',   desc:'Instant notifications on status change.' },
    { icon:'chart',  title:'Track Applications', desc:'Full timeline for every application.' },
    { icon:'upload', title:'Document Upload',    desc:'Attach PDFs, images, Word docs.' },
    { icon:'cogs',   title:'Admin Dashboard',    desc:'Powerful panel to manage everything.' },
  ],
  aboutTitle:    'A Smarter Way to Learn & Apply',
  aboutSubtitle: 'DevLogics E-Portal is a complete digital solution for course and service management. Students apply online, track status in real-time, and get decisions with full feedback.',
  aboutPoints: [
    'Apply online — no office visits',
    'Upload CV and documents securely',
    'Track every application with timeline',
    'Real-time notifications on changes',
    'Admin review with detailed feedback',
    'Available 24/7 from any device',
  ],
  contactEmail:   'info@devlogics.com',
  contactPhone:   '+92-XXX-XXXXXXX',
  contactAddress: 'DevLogics Campus, Pakistan',
  contactWebsite: 'www.devlogics.com',
  contactHours:   'Mon-Fri 9AM-5PM',
}

// Positions arranged in a ring AROUND the center ? center badge sits at ~50%/50%
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

// Static fallback arrays removed ? all data comes from settings (admin-managed)
// Partners, steps, features, about points are all in FALLBACK_SETTINGS above

// ── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm]       = useState({ fullName:'', email:'', course:'', message:'' })
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [errMsg, setErrMsg]   = useState('')

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ fullName:'', email:'', course:'', message:'' })
    } catch (err) {
      setStatus('error')
      setErrMsg(err.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="rounded-2xl p-8 shadow-lg"
      style={{ background: 'var(--theme-grad-primary)', border:'1px solid rgba(72,202,228,0.2)' }}
    >
      <h3 className="mb-6 text-xl font-bold text-white">Send a Message</h3>

      {/* Success state */}
      {status === 'success' ? (
        <motion.div
          initial={{ opacity:0, scale:0.9 }}
          animate={{ opacity:1, scale:1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-primary-cyan/30 bg-white/10 py-10 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-400/20">
            <FaCheckCircle className="text-3xl text-green-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Message Sent!</p>
            <p className="mt-1 text-sm text-white/70">Admin will get back to you soon.</p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 rounded-xl border border-white/30 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Send Another
          </button>
        </motion.div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">Full Name</label>
              <input
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-xl border-2 border-white/40 bg-white px-4 py-3 text-sm text-primary font-medium placeholder:text-gray-400 outline-none transition focus:border-primary-cyan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="w-full rounded-xl border-2 border-white/40 bg-white px-4 py-3 text-sm text-primary font-medium placeholder:text-gray-400 outline-none transition focus:border-primary-cyan"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">Select Course</label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-white/40 bg-white px-4 py-3 text-sm text-primary font-medium outline-none transition focus:border-primary-cyan"
            >
              <option value="">Choose a course (optional)</option>
              <option value="Python">Python Programming</option>
              <option value="MERN">MERN Stack Development</option>
              <option value="AI">AI &amp; Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Science">Data Science</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">Message</label>
            <textarea
              name="message"
              required
              rows="4"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="w-full rounded-xl border-2 border-white/40 bg-white px-4 py-3 text-sm text-primary font-medium placeholder:text-gray-400 outline-none transition focus:border-primary-cyan"
            />
          </div>

          {status === 'error' && (
            <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">{errMsg}</p>
          )}

        <button
  type="submit"
  disabled={status === 'loading'}
  className="flex w-full items-center justify-center gap-2 rounded-xl
             border-2 border-white bg-white px-4 py-3
             text-sm font-bold text-primary
             transition-all duration-300 ease-in-out
             hover:-translate-y-1 hover:scale-[1.03]
             hover:shadow-xl
             active:scale-95
             disabled:opacity-60 disabled:cursor-not-allowed"
>
  {status === 'loading' ? (
    <>
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      Sending...
    </>
  ) : (
    <>
      Send Message
      <FaPaperPlane className="transition-transform duration-300 group-hover:translate-x-1" />
    </>
  )}
</button>
        </form>
      )}
    </div>
  )
}

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
  const [reviews, setReviews]             = useState(FALLBACK_REVIEWS)
  const [students, setStudents]           = useState([])
  const [settings, setSettings]           = useState(FALLBACK_SETTINGS)
  const [activeStudent, setActiveStudent] = useState(null)
  const [activeReview, setActiveReview]   = useState(0)

  const BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'

  useEffect(() => {
    api.get('/hero-slides').then(r => { if (Array.isArray(r.data) && r.data.length) setSlides(r.data) }).catch(() => {})
    api.get('/reviews').then(r => { if (Array.isArray(r.data) && r.data.length) setReviews(r.data) }).catch(() => {})
    api.get('/student-pride').then(r => { if (Array.isArray(r.data) && r.data.length) setStudents(r.data) }).catch(() => {})
    api.get('/site-settings').then(r => {
      if (r.data) {
        // Merge with FALLBACK so array fields are never undefined/null
        setSettings({
          ...FALLBACK_SETTINGS,
          ...r.data,
          partners:    Array.isArray(r.data.partners)    && r.data.partners.length    ? r.data.partners    : FALLBACK_SETTINGS.partners,
          howItWorks:  Array.isArray(r.data.howItWorks)  && r.data.howItWorks.length  ? r.data.howItWorks  : FALLBACK_SETTINGS.howItWorks,
          features:    Array.isArray(r.data.features)    && r.data.features.length    ? r.data.features    : FALLBACK_SETTINGS.features,
          aboutPoints: Array.isArray(r.data.aboutPoints) && r.data.aboutPoints.length ? r.data.aboutPoints : FALLBACK_SETTINGS.aboutPoints,
        })
      }
    }).catch(() => {})
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
      <section id="home" className="relative w-full overflow-hidden h-screen min-h-[540px] max-h-[900px]">

        {/* Slide backgrounds */}
        {slides.map((s, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: slide===i ? 1 : 0, zIndex: slide===i ? 1 : 0 }}>
            <img src={s.imageUrl||s.src} alt="" className="h-full w-full object-cover"
              onError={e => { e.target.src = '/gallery/2.png' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85" />
          </div>
        ))}

        {/* Content — centered, pb accounts for stats bar height */}
        <div className="absolute inset-x-0 top-0 bottom-[64px] z-10 flex flex-col items-center justify-center px-4 text-center text-white sm:bottom-[72px] sm:px-8 md:bottom-[80px]">
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              transition={{ duration:0.65 }}
              className="w-full max-w-2xl md:max-w-3xl">

              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:mb-5">
                <img
                  src={settings.logoUrl ? `${BASE}/uploads/${settings.logoUrl}` : '/gallery/logo5.png'}
                  alt="logo" className="h-4 w-auto object-contain sm:h-5" style={{ maxWidth:'52px' }} />
                <span className="text-xs font-semibold tracking-wide sm:text-sm">{settings.portalName}</span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-extrabold leading-tight drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                {slides[slide]?.text || settings.tagline}
              </h1>

              {/* Sub */}
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:mt-4 sm:max-w-xl sm:text-base md:text-lg">
                {settings.heroSubtext}
              </p>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
                {user ? (
                  <Link to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 sm:px-8 sm:py-3 sm:text-base"
                    style={{ background:'var(--theme-white)', color:'var(--theme-primary)' }}>
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 sm:px-8 sm:py-3 sm:text-base"
                      style={{ background:'var(--theme-secondary)', color:'#fff' }}>
                      Join for Free
                    </Link>
                    <Link to="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-2.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:bg-white/10 sm:px-8 sm:py-3 sm:text-base">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-[72px] left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-[80px] md:bottom-[88px]">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slide ? 'h-2.5 w-8 bg-white' : 'h-2.5 w-2.5 bg-white/50 hover:bg-white/80'
              }`} />
          ))}
        </div>

        {/* Prev */}
        <button onClick={() => setSlide(p => (p-1+slides.length)%slides.length)}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-5 sm:h-11 sm:w-11">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Next */}
        <button onClick={() => setSlide(p => (p+1)%slides.length)}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-5 sm:h-11 sm:w-11">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Stats bar — pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10"
          style={{ background: 'var(--theme-grad-topbar)' }}>
          <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-white/10">
            {[
              { value: settings.statStudents,     label: 'Students',     icon: FaGraduationCap, color: 'var(--theme-accent)' },
              { value: settings.statPrograms,     label: 'Programs',     icon: FaClipboardList, color: 'var(--theme-accent)' },
              { value: settings.statSatisfaction, label: 'Satisfaction', icon: FaChartBar,       color: '#4ade80' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-center gap-1.5 px-2 py-3 sm:gap-3 sm:py-4">
                <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:flex"
                  style={{ background:'rgba(255,255,255,0.12)' }}>
                  <s.icon style={{ fontSize:'0.9rem', color: s.color }} />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-extrabold leading-none text-white sm:text-base">{s.value}</p>
                  <p className="mt-0.5 text-[10px] text-white/60 sm:text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- MARQUEE -- */}
      <section className="overflow-hidden border-y border-primary-pale bg-primary-ice py-4">
        <div className="flex">
          {[0,1].map(p => (
            <div key={p} className="flex shrink-0 items-center gap-8 pr-8" style={{ animation:'mqscroll 28s linear infinite' }}>
              {(settings.partners||[]).map((d,i) => {
                const match = PARTNER_ICON_MAP[d]
                const IconComp = match?.icon || FaStar
                const iconColor = match?.color || 'var(--theme-secondary)'
                return (
                  <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-primary-pale bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
                    <IconComp style={{ color: iconColor, fontSize: '1.1rem', flexShrink: 0 }} />
                    <span className="text-sm font-semibold text-primary-blue">{d}</span>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
        <style>{`@keyframes mqscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </section>

      <StackedCourses />

      {/* -- SERVICES (removed) -- */}

      {/* -- HOW IT WORKS -- */}
      <section id="howitworks" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center sm:mb-14">
            <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">CERTIFICATIONS</span>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">Certifications</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Earn recognised certificates in 4 simple steps</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {(settings.howItWorks||[]).map((s,i) => {
              const STEP_ICONS  = [FaUserPlus, FaBook, FaLaptopCode, FaMedal]
              const STEP_COLORS = ['var(--theme-accent)', '#4ade80', '#f59e0b', '#f472b6']
              const IconComp  = STEP_ICONS[i]  || FaUserPlus
              const iconColor = STEP_COLORS[i] || 'var(--theme-accent)'
              return (
              <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.15 }}
                whileHover={{ y:-4 }}
                className="relative overflow-hidden rounded-2xl p-6 shadow-lg"
                style={{ background: 'var(--theme-grad-primary)' }}>
                <div className="relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background:'rgba(255,255,255,0.12)', boxShadow:`0 0 18px ${iconColor}55` }}>
                  <IconComp style={{ fontSize:'1.6rem', color: iconColor }} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-primary"
                    style={{ background: iconColor }}>{s.step}</span>
                </div>
                <h3 className="mb-2 font-bold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/70">{s.desc}</p>
              </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* -- FEATURES -- */}
      <section id="features" className="bg-primary-ice px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center sm:mb-12">
            <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">WHY CHOOSE US</span>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">Everything in One Portal</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Built for students, managed by administration</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {(settings.features||[]).map((f,i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                whileHover={{ y:-4 }}
                className="flex items-start gap-4 rounded-2xl p-5 shadow-lg"
                style={{ background: 'var(--theme-grad-primary)' }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background:'rgba(255,255,255,0.15)' }}><FeatureIcon k={f.icon} /></div>
                <div>
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- OUR STUDENTS OUR PRIDE -- */}
      <section id="pride" className="relative bg-white py-12 px-4 sm:py-16 sm:px-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-pale/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-primary-light/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Heading */}
          <div className="mb-8 text-center">
            <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">OUR STUDENTS</span>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">Our Students, Our Pride</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Click on any student to read their story</p>
          </div>

          {/* Row ? centered when no selection, split when selected */}
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center">

            {/* -- Circles panel ? size shrinks when few students -- */}
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
              {/* Centre badge ? always perfectly centered */}
              <motion.div
                animate={{ scale:[1, 1.07, 1] }}
                transition={{ repeat:Infinity, duration:3.2, ease:'easeInOut' }}
                className="absolute z-30 flex h-[130px] w-[130px] items-center justify-center rounded-full shadow-2xl"
                style={{
                  top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)',
                  background: 'var(--theme-grad-primary)',
                  border: '3px solid var(--theme-accent)',
                  boxShadow: '0 0 40px rgba(0,119,182,0.5)',
                }}>
                <div className="px-3 text-center">
                  <p className="text-[10px] font-extrabold uppercase leading-tight tracking-widest text-primary-pale">Our<br/>Students<br/>Our Pride</p>
                  <div className="mt-2 flex justify-center gap-0.5">
                    {[1,2,3].map(s => <span key={s} className="text-[10px] text-primary-cyan">★</span>)}
                  </div>
                </div>
              </motion.div>

              {/* No students hint — hidden, admin will add */}
              {count === 0 && null}

              {/* Student circles */}
              {visibleStudents.map((student, index) => {
                const pos   = CPOS[index % CPOS.length]
                const isSel = activeStudent === index
                const imgUrl = student.image
                  ? `${BASE}/uploads/${student.image}`
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
                      border: isSel ? `3px solid var(--theme-secondary)` : `2.5px solid var(--theme-accent)`,
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
                      <motion.div className="absolute inset-0 rounded-full border-2 border-primary-blue"
                        animate={{ scale:[1,1.5], opacity:[0.7,0] }}
                        transition={{ repeat:Infinity, duration:1 }} />
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
              )
            })()}

            {/* -- Detail card ? slides in from right, only when a student selected -- */}
            <AnimatePresence mode="wait">
              {sel && (
                <motion.div
                  key={activeStudent}
                  initial={{ opacity:0, x:80 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{   opacity:0, x:80 }}
                  transition={{ type:'spring', stiffness:280, damping:26 }}
                  className="w-full max-w-sm shrink-0 overflow-hidden rounded-3xl shadow-2xl"
                  style={{ background: 'var(--theme-grad-primary)' }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ background: 'var(--theme-grad-primary)' }} />

                  <div className="p-7">
                    {/* Close + photo + name */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl"
                          style={{ border: '2px solid var(--theme-accent)', boxShadow: '0 0 18px rgba(72,202,228,0.5)' }}>
                          {sel.image ? (
                            <img src={`${BASE}/uploads/${sel.image}`} alt={sel.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${sel.color||'from-blue-600 to-blue-900'} text-xl font-extrabold text-white`}>
                              {sel.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="rounded-full bg-primary-cyan/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-cyan">
                            {sel.courseType || 'Student'}
                          </span>
                          <h3 className="mt-1 text-xl font-extrabold text-white">{sel.name}</h3>
                          <p className="text-sm text-primary-light">
                            {sel.role}{sel.courseName ? ` — ${sel.courseName}` : ''}
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
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary-cyan/30 bg-primary-blue/25 px-4 py-1.5">
                        <motion.span
                          animate={{ scale:[1,1.6,1] }}
                          transition={{ repeat:Infinity, duration:1.4 }}
                          className="h-1.5 w-1.5 rounded-full bg-primary-cyan" />
                        <span className="text-xs font-bold text-primary-cyan">{sel.badge}</span>
                      </div>
                    )}

                    {/* Quote */}
                    <div className="relative mt-5 rounded-2xl border border-primary-blue/30 bg-white/5 p-5">
                      <span className="absolute left-4 top-0 text-5xl font-bold leading-none text-primary-cyan/12">"</span>
                      <p className="pl-4 text-sm italic leading-relaxed text-primary-pale">{sel.quote}</p>
                    </div>

                    {/* Dot nav */}
                    <div className="mt-6 flex justify-center gap-1.5">
                      {visibleStudents.map((_, i) => (
                        <button key={i} onClick={() => setActiveStudent(i)}
                          className={`rounded-full transition-all duration-300 ${i===activeStudent ? 'h-2 w-7 bg-primary-cyan' : 'h-2 w-2 bg-white/20 hover:bg-white/40'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* -- REVIEWS (dynamic, approved only) -- */}
      <section id="reviews" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center sm:mb-12">
            <span className="rounded-full bg-primary-pale px-4 py-1 text-xs font-bold text-primary">STUDENT REVIEWS</span>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">What Students Say</h2>
          </div>
          {Array.isArray(reviews) && reviews.length > 0 && (
            <>
              <motion.div key={activeReview} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
                className="mb-6 overflow-hidden rounded-3xl shadow-2xl"
                style={{ background: 'var(--theme-grad-primary)' }}>
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-10">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4 ring-primary-cyan/30 sm:h-20 sm:w-20">
                    {reviews[activeReview]?.studentImage ? (
                      <img src={`${BASE}/uploads/${reviews[activeReview].studentImage}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/20 text-xl font-extrabold text-white sm:text-2xl">
                        {reviews[activeReview]?.studentName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Stars n={reviews[activeReview]?.rating || 5} />
                    <p className="mt-3 text-base font-medium leading-relaxed text-primary-pale sm:text-lg">"{reviews[activeReview]?.description}"</p>
                    <p className="mt-4 font-bold text-white">{reviews[activeReview]?.studentName}</p>
                    <p className="text-sm text-primary-light">{reviews[activeReview]?.courseType} {reviews[activeReview]?.courseName ? `— ${reviews[activeReview].courseName}` : ''}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-2 pb-5">
                  {reviews.map((_,i) => (
                    <button key={i} onClick={()=>setActiveReview(i)} className={`rounded-full transition-all ${i===activeReview?'h-2 w-8 bg-primary-cyan':'h-2 w-2 bg-white/30'}`} />
                  ))}
                </div>
              </motion.div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                {reviews.map((r,i) => (
                  <motion.button key={r._id} onClick={()=>setActiveReview(i)} whileHover={{ y:-4 }}
                    className={`rounded-2xl border-2 p-3 text-left transition-all sm:p-4 ${i===activeReview?'border-primary-blue bg-primary-ice shadow-md':'border-gray-200 bg-white hover:border-primary-sky/40'}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-pale text-xs font-bold text-primary sm:h-8 sm:w-8">
                        {r.studentImage ? (
                          <img src={`${BASE}/uploads/${r.studentImage}`} alt="" className="h-full w-full object-cover" />
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

      {/* -- ABOUT -- */}
      <section id="about" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="w-full lg:w-2/5">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img src="/gallery/Ai.png" alt="Portal" className="h-56 w-full object-cover sm:h-72" onError={e=>{e.target.src='/gallery/2.png'}} />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/90 px-3 py-2.5 shadow-lg sm:bottom-5 sm:left-5 sm:px-4 sm:py-3">
                  <img src="/gallery/logo5.png" alt="logo" style={{ height: '32px', width: 'auto', objectFit: 'contain', background: 'transparent' }} />
                  <div><p className="text-xs font-extrabold text-primary">{settings.portalName}</p><p className="text-[10px] text-gray-500">4.8 ⭐ {settings.statStudents} Students</p></div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="w-full lg:w-3/5">
              <span className="rounded-full bg-primary-pale px-4 py-1 text-xs font-bold text-primary">ABOUT THE PORTAL</span>
              <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl"
                dangerouslySetInnerHTML={{ __html: (settings.aboutTitle||'A Smarter Way to Learn & Apply').replace('&','&amp;') }} />
              <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">{settings.aboutSubtitle}</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {(settings.aboutPoints||[]).map((item,i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-pale text-[10px] font-bold text-primary-blue">✓</span>{item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 hover:-translate-y-0.5 sm:px-6 sm:py-3"
                  style={{ background:'var(--theme-secondary)' }}>
                  Get Started Free →
                </Link>
                <Link to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90 hover:-translate-y-0.5 sm:px-6 sm:py-3"
                  style={{ background:'var(--theme-bg-light)', color:'var(--theme-primary)' }}>
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -- CONTACT -- */}
   <section id="contact" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
  <div className="mx-auto max-w-6xl">

    {/* Heading */}
    <div className="mb-10 text-center sm:mb-12">
      <span className="rounded-full bg-primary-pale px-4 py-1 text-xs font-bold text-primary">
        GET IN TOUCH
      </span>

      <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
        Contact Us
      </h2>

      <p className="mt-2 text-sm text-gray-500 sm:text-base">
        Have questions? Our team is ready to help 
      </p>
    </div>


    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">

      {/* LEFT CONTACT CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 sm:gap-4">
      

        {[
          {icon:<MdLocationOn size={22} className="text-white"/>, t:'Address', v: settings.contactAddress},
          {icon:<FaPhone      size={18} className="text-white"/>, t:'Phone',   v: settings.contactPhone},
          {icon:<FaEnvelope   size={18} className="text-white"/>, t:'Email',   v: settings.contactEmail},
          {icon:<FaGlobe      size={18} className="text-white"/>, t:'Website', v: settings.contactWebsite},
          {icon:<FaClock      size={18} className="text-white"/>, t:'Hours',   v: settings.contactHours||'Mon-Fri 9AM-5PM'}
        ].map((item,i)=>(

          <motion.div
            key={i}
            whileHover={{x:6}}
            className="flex items-start gap-3 rounded-2xl p-4 shadow-lg transition sm:gap-4 sm:p-6"
            style={{ background: 'var(--theme-grad-primary)', border:'1px solid rgba(72,202,228,0.2)' }}
          >

            {/* Icon */}
            <div className="
              flex h-10 w-10 shrink-0 sm:h-12 sm:w-12
              items-center justify-center
              rounded-xl
              bg-white/20
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
                text-primary-light
              ">
                {item.t}
              </p>


              <p className="
                mt-1
                text-sm
                font-semibold
                text-white
                break-all
                sm:break-normal
              ">
                {item.v}
              </p>

            </div>

          </motion.div>

        ))}

      </div>




      {/* RIGHT FORM */}
      <ContactForm />


    </div>

  </div>
</section>

      {/* -- FOOTER -- */}
      <footer className="text-white" style={{ background: 'var(--theme-footer-bg)' }}>

        {/* Wave divider */}
        <div className="overflow-hidden" style={{ lineHeight:0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block w-full" style={{ height:'60px' }}>
            <path d="M0,0 C360,60 1080,0 1440,40 L1440,0 Z" fill="white"/>
          </svg>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10">
          <div className="grid gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">

            {/* Col 1 — Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex h-14 items-center gap-2">
                <img
                  src="/gallery/logo1.png"
                  alt="logo"
                  style={{ height: '70px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <p className="text-sm leading-relaxed text-white">
                {settings.footerTagline || 'Course & Service Management'}
              </p>
              <p className="mt-3 text-xs text-white">Apply online · No office visit required</p>
            </div>

            {/* Col 2 — Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label:'Home',     href:'#home' },
                  { label:'Courses',  href:'#courses' },
                  { label:'Our Pride',href:'#pride' },
                  { label:'About Us', href:'#about' },
                ].map((l,i) => (
                  <li key={i}>
                    <a href={l.href} className="text-sm text-white transition hover:text-primary-cyan">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — More */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">More</h4>
              <ul className="space-y-2">
                {[
                  { label:'Certifications', href:'#howitworks' },
                  { label:'Why Choose Us',  href:'#features' },
                  { label:'Reviews',        href:'#reviews' },
                  { label:'Contact Us',     href:'#contact' },
                ].map((l,i) => (
                  <li key={i}>
                    <a href={l.href} className="text-sm text-white transition hover:text-primary-cyan">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Account + Follow */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Account</h4>
              <ul className="space-y-2 mb-6">
                <li><Link to="/login"     className="text-sm text-white transition hover:text-primary-cyan">Sign In</Link></li>
                <li><Link to="/register"  className="text-sm text-white transition hover:text-primary-cyan">Register Free</Link></li>
                <li><Link to="/dashboard" className="text-sm text-white transition hover:text-primary-cyan">Dashboard</Link></li>
              </ul>

              {/* Follow Us */}
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Follow Us</h4>
              <div className="flex gap-2">
                {[
                  { href:'#', icon:<FaFacebook  size={15}/> },
                  { href:'#', icon:<FaInstagram size={15}/> },
                  { href:'#', icon:<FaTwitter   size={15}/> },
                  { href:'#', icon:<FaLinkedin  size={15}/> },
                ].map((s,i) => (
                  <a key={i} href={s.href}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white hover:text-primary">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row sm:mt-10">
            <p className="text-xs text-white text-center sm:text-left">&copy; {new Date().getFullYear()} {settings.portalName}. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-white sm:gap-4">
              <a href="#" className="hover:text-primary-cyan transition">Privacy Policy</a>
              <span className="hidden sm:inline">|</span>
              <a href="#" className="hover:text-primary-cyan transition">Terms of Service</a>
              <span className="hidden sm:inline">|</span>
              <a href="#" className="hover:text-primary-cyan transition">Support</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
