const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    // Basic Info
    title:         { type: String, required: true, trim: true },
    subtitle:      { type: String, trim: true },
    description:   { type: String, required: true },
    icon:          { type: String, default: '📚' },
    tag:           { type: String, default: 'Course' },

    // Type
    type:          { type: String, enum: ['course', 'internship'], default: 'course' },
    mode:          { type: String, enum: ['onsite', 'online', 'hybrid'], default: 'online' },

    // Duration
    duration:      { type: String, default: '3 Months' },
    deadline:      { type: Date },
    startDate:     { type: Date },

    // Payment
    isPaid:        { type: Boolean, default: false },
    price:         { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' }, // e.g. "JazzCash, Easypaisa, Bank Transfer"

    // Certification
    certified:     { type: Boolean, default: false },

    // Internship specific
    stipend:       { type: String, default: '' }, // e.g. "10,000/month" or "Unpaid"

    // Display
    bgFrom:        { type: String, default: '#03045e' },
    bgTo:          { type: String, default: '#0077b6' },
    accent:        { type: String, default: '#48cae4' },
    level:         { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner' },
    seats:         { type: Number, default: 30 },
    enrolled:      { type: Number, default: 0 },
    instructor:    { type: String, default: 'DevLogics Team' },
    features:      [{ type: String }],
    isActive:      { type: Boolean, default: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Course', courseSchema)
