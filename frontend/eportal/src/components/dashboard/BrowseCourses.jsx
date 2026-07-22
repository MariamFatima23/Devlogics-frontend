import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import { useTheme } from '../../context/ThemeContext'
import CourseApplyModal from '../CourseApplyModal'

// Old DB default colours — treat as "inherit from theme"
const OLD_FROM = ['#03045e', '#04065c', '#023e8a', '#0096c7', '#0077b6']
const OLD_TO   = ['#0077b6', '#0096c7', '#48cae4', '#023e8a', '#04065c']
const OLD_ACC  = ['#48cae4', '#90e0ef', '#caf0f8']

export default function BrowseCourses({ user }) {
  const { theme } = useTheme()
  const [courses, setCourses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [applyModal, setApplyModal] = useState(null)
  const [filter, setFilter]         = useState('all')

  useEffect(() => {
    api.get('/courses')
      .then(r => setCourses(r.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? courses : courses.filter(c => c.type === filter)

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {[
            { id:'all',        label:`All (${courses.length})` },
            { id:'course',     label:`Courses (${courses.filter(c=>c.type==='course').length})` },
            { id:'internship', label:`Internships (${courses.filter(c=>c.type==='internship').length})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filter===f.id ? 'text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              style={filter===f.id ? { background: 'var(--theme-grad-primary)' } : {}}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed py-16 text-center"
            style={{ borderColor: 'var(--theme-border)' }}>
            <p className="text-4xl">📚</p>
            <p className="mt-3 font-bold text-gray-700">No courses available yet</p>
            <p className="mt-1 text-sm text-gray-400">Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => {
              const cardFrom = (!course.bgFrom || OLD_FROM.includes(course.bgFrom)) ? theme.primary   : course.bgFrom
              const cardTo   = (!course.bgTo   || OLD_TO.includes(course.bgTo))     ? theme.secondary : course.bgTo
              const accent   = (!course.accent  || OLD_ACC.includes(course.accent))  ? theme.accent    : course.accent
              const bg = `linear-gradient(135deg, ${cardFrom} 0%, ${cardTo} 100%)`

              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative flex flex-col overflow-hidden rounded-2xl shadow-lg"
                  style={{ background: bg }}
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold capitalize text-white">{course.type}</span>
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold capitalize text-white">{course.mode}</span>
                      {course.certified && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">🎓 Certified</span>}
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{course.icon}</span>
                      <div>
                        <h3 className="font-extrabold leading-tight text-white">{course.title}</h3>
                        {course.subtitle && <p className="mt-0.5 text-xs font-semibold" style={{ color: accent }}>{course.subtitle}</p>}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-white/75 line-clamp-3">{course.description}</p>

                    {course.features?.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {course.features.slice(0,4).map((f,j) => (
                          <div key={j} className="flex items-center gap-1.5 text-xs text-white/85">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4">
                      <div><p className="text-sm font-extrabold text-white">{course.duration}</p><p className="text-[10px]" style={{ color: accent }}>Duration</p></div>
                      <div><p className="text-sm font-extrabold text-white">{course.seats} seats</p><p className="text-[10px]" style={{ color: accent }}>Available</p></div>
                      <div><p className="text-sm font-extrabold text-white">{course.isPaid ? `PKR ${course.price?.toLocaleString()}` : 'Free'}</p><p className="text-[10px]" style={{ color: accent }}>Fee</p></div>
                      {course.type === 'internship' && course.stipend && (
                        <div><p className="text-sm font-extrabold text-white">{course.stipend}</p><p className="text-[10px]" style={{ color: accent }}>Stipend</p></div>
                      )}
                    </div>

                    {course.deadline && <p className="mt-2 text-[10px] text-white/60">⏰ Deadline: {new Date(course.deadline).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</p>}
                    {course.instructor && <p className="mt-1.5 text-[10px] text-white/50">👨‍🏫 {course.instructor}</p>}

                    <button
                      onClick={() => setApplyModal(course)}
                      className="mt-5 w-full rounded-xl py-3 text-sm font-extrabold shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: theme.cardBg, color: theme.primary }}>
                      Apply Now →
                    </button>
                  </div>

                  <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold"
                    style={{ backgroundColor:`${accent}20`, color:accent, border:`1px solid ${accent}40` }}>
                    {i+1}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {applyModal && (
          <CourseApplyModal
            course={applyModal}
            onClose={() => setApplyModal(null)}
            onGoToProfile={() => { setApplyModal(null); window.dispatchEvent(new CustomEvent('goto-profile')) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}


