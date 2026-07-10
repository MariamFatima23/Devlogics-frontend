const express = require('express')
const router  = express.Router()
const { protect, adminOnly } = require('../middleware/auth.middleware')
const Course = require('../models/Course.model')

// Public: get all active courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ order: 1, createdAt: -1 })
    res.json(courses)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: get all courses
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1, createdAt: -1 })
    res.json(courses)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: create course
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body)
    res.status(201).json(course)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: update course
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    res.json(course)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Admin: delete course
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id)
    res.json({ message: 'Course deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
