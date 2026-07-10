const express = require('express')
const router  = express.Router()
const { protect, adminOnly } = require('../middleware/auth.middleware')
const upload  = require('../middleware/upload.middleware')
const CourseApplication = require('../models/CourseApplication.model')
const Notification = require('../models/Notification.model')
const Course = require('../models/Course.model')

// Student: Apply for a course (CV + payment proof upload)
router.post('/', protect, upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 },
]), async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    // Check if already applied
    const existing = await CourseApplication.findOne({
      courseId: req.body.courseId,
      studentId: req.user.id,
    })
    if (existing) return res.status(400).json({ message: 'You have already applied for this course' })

    const cvFile      = req.files?.cvFile?.[0]
    const payProof    = req.files?.paymentProof?.[0]

    const app = await CourseApplication.create({
      courseId:       course._id,
      courseName:     course.title,
      courseType:     course.type,
      studentId:      req.user.id,
      studentName:    req.user.name,
      studentEmail:   req.user.email,
      phone:          req.body.phone,
      cnic:           req.body.cnic,
      qualification:  req.body.qualification,
      experience:     req.body.experience || 'None',
      whyApply:       req.body.whyApply,
      linkedIn:       req.body.linkedIn,
      portfolio:      req.body.portfolio,
      cvFile:         cvFile?.filename,
      cvOriginalName: cvFile?.originalname,
      paymentProof:   payProof?.filename,
      paymentMethod:  req.body.paymentMethod,
      transactionId:  req.body.transactionId,
      timeline: [{ status:'Pending', comment:'Application submitted', updatedBy: req.user.name }],
    })

    // Notification to student
    await Notification.create({
      userId: req.user.id,
      applicationId: app._id,
      type: 'application_submitted',
      title: 'Course Application Submitted',
      message: `Your application for "${course.title}" has been submitted and is under review.`,
    })

    res.status(201).json({ message: 'Application submitted successfully', application: app })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Student: Get my course applications
router.get('/my', protect, async (req, res) => {
  try {
    const apps = await CourseApplication.find({ studentId: req.user.id }).sort({ createdAt: -1 })
    res.json(apps)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: Get all applications (with optional filters)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const filter = {}
    if (req.query.status)    filter.status    = req.query.status
    if (req.query.courseId)  filter.courseId  = req.query.courseId
    if (req.query.courseType) filter.courseType = req.query.courseType
    const apps = await CourseApplication.find(filter).sort({ createdAt: -1 })
    res.json(apps)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: Update application status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminComment } = req.body
    const app = await CourseApplication.findById(req.params.id)
    if (!app) return res.status(404).json({ message: 'Application not found' })

    app.status      = status
    app.adminComment = adminComment || ''
    app.reviewedBy  = req.user.name
    app.reviewedAt  = new Date()
    app.timeline.push({ status, comment: adminComment || `Status changed to ${status}`, updatedBy: req.user.name })
    await app.save()

    // Notify student
    const notifType = status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : 'status_updated'
    await Notification.create({
      userId: app.studentId,
      type:   notifType,
      title:  `Application ${status}`,
      message: status === 'Approved'
        ? `Congratulations! Your application for "${app.courseName}" has been approved.`
        : status === 'Rejected'
        ? `Your application for "${app.courseName}" was rejected.${adminComment ? ' Reason: ' + adminComment : ''}`
        : `Your application for "${app.courseName}" is now "${status}".`,
    })

    res.json({ message: `Application ${status}`, application: app })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: Stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, pending, underReview, approved, rejected] = await Promise.all([
      CourseApplication.countDocuments(),
      CourseApplication.countDocuments({ status:'Pending' }),
      CourseApplication.countDocuments({ status:'Under Review' }),
      CourseApplication.countDocuments({ status:'Approved' }),
      CourseApplication.countDocuments({ status:'Rejected' }),
    ])
    res.json({ total, pending, underReview, approved, rejected })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
