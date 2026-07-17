import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function AddReview() {
  const { user } = useAuth()

  const [approvedCourses, setApprovedCourses] = useState([])
  const [loadingCourses, setLoadingCourses]   = useState(true)

  const [selectedCourse, setSelectedCourse]   = useState(null)
  const [rating, setRating]                   = useState(5)
  const [hoverRating, setHoverRating]         = useState(0)
  const [description, setDescription]         = useState('')

  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState(null)

  /* ── Load student's approved course applications on mount ── */
  useEffect(() => {
    const fetchApproved = async () => {
      setLoadingCourses(true)
      try {
        const res = await api.get('/course-applications/my')
        const apps = res.data?.applications || res.data || []
        const approved = apps.filter(a => a.status === 'Approved')
        setApprovedCourses(approved)
      } catch {
        setApprovedCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchApproved()
  }, [])

  const handleCourseChange = (e) => {
    const id = e.target.value
    const found = approvedCourses.find(a => (a.courseId?._id || a.courseId) === id)
    setSelectedCourse(found || null)
    setMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCourse) { setMsg({ type: 'error', text: 'Please select a course.' }); return }
    if (!description.trim()) { setMsg({ type: 'error', text: 'Please write your review.' }); return }

    setLoading(true)
    setMsg(null)

    const courseIdVal  = selectedCourse.courseId?._id || selectedCourse.courseId
    const courseNameVal = selectedCourse.courseId?.title || selectedCourse.courseName || ''
    const courseTypeVal = selectedCourse.courseId?.type === 'internship' ? 'Internship' : 'Course'

    try {
      await api.post('/reviews', { courseId: courseIdVal, courseName: courseNameVal, courseType: courseTypeVal, rating, description })
      setMsg({ type: 'success', text: 'Review submitted! Admin will approve it shortly.' })
      setSelectedCourse(null)
      setRating(5)
      setDescription('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit review.' })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50 focus:bg-white/15 transition placeholder-white/40'

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-white/20 p-8 shadow-2xl"
        style={{ background: 'var(--theme-grad-sidebar)' }}>

        <h3 className="mb-2 text-2xl font-bold text-white">Share Your Experience</h3>
        <p className="mb-6 text-sm text-blue-100">Your review will appear after admin approval.</p>

        {msg && (
          <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
            msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {msg.text}
          </div>
        )}

        {loadingCourses ? (
          <div className="py-10 text-center text-white/60 text-sm">Loading your courses…</div>
        ) : approvedCourses.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-10 text-center">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-white font-semibold text-base">You need to complete a course before leaving a review</p>
            <p className="mt-2 text-blue-100 text-sm">Once your course application is approved, you can share your experience here.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Course Selector */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">Select Course *</label>
              <select
                value={selectedCourse ? (selectedCourse.courseId?._id || selectedCourse.courseId) : ''}
                onChange={handleCourseChange}
                required
                className={inputCls}
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <option value="" disabled style={{ background: 'var(--theme-primary)' }}>— Choose a course —</option>
                {approvedCourses.map(a => {
                  const id    = a.courseId?._id || a.courseId
                  const title = a.courseId?.title || a.courseName || 'Unknown Course'
                  return (
                    <option key={id} value={id} style={{ background: 'var(--theme-secondary)' }}>
                      {title}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-3xl transition duration-200 hover:scale-125 ${
                      n <= (hoverRating || rating) ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-white">{rating}/5</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">
                Your Review *
                <span className="ml-1 text-xs font-normal text-blue-100">(Maximum 500 Characters)</span>
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={e => { if (e.target.value.length <= 500) setDescription(e.target.value) }}
                className={inputCls}
                placeholder="Share what you learned, how this course helped you, and your overall experience…"
              />
              <p className="mt-2 text-right text-xs text-blue-100">{description.length}/500</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:scale-[1.02] disabled:opacity-60"
              style={{ background: 'var(--theme-grad-primary)' }}
            >
              {loading ? 'Submitting…' : '✈ Submit Review'}
            </button>

          </form>
        )}

      </div>
    </div>
  )
}
