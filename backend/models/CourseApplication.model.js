const mongoose = require('mongoose')

const courseApplicationSchema = new mongoose.Schema(
  {
    // Course reference
    courseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseName:    { type: String },
    courseType:    { type: String }, // course / internship

    // Student
    studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName:   { type: String, required: true },
    studentEmail:  { type: String, required: true },

    // Application form fields
    phone:         { type: String, required: true },
    cnic:          { type: String },
    qualification: { type: String, required: true },
    experience:    { type: String, default: 'None' },
    whyApply:      { type: String, required: true },
    linkedIn:      { type: String },
    portfolio:     { type: String },

    // CV upload
    cvFile:        { type: String }, // filename in uploads/
    cvOriginalName:{ type: String },

    // Payment proof (if paid course)
    paymentProof:  { type: String },
    paymentMethod: { type: String },
    transactionId: { type: String },

    // Status
    status:        { type: String, enum: ['Pending','Under Review','Approved','Rejected'], default: 'Pending' },
    adminComment:  { type: String },
    reviewedBy:    { type: String },
    reviewedAt:    { type: Date },

    timeline: [{
      status:    String,
      comment:   String,
      updatedBy: String,
      updatedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('CourseApplication', courseApplicationSchema)
