const mongoose = require('mongoose')

const siteSettingsSchema = new mongoose.Schema({
  // ── Identity
  portalName:    { type: String, default: 'DevLogics E-Portal' },
  tagline:       { type: String, default: 'Learn. Apply. Grow.' },
  heroSubtext:   { type: String, default: 'Apply for courses, internships and services — all online, 24/7.' },
  logoUrl:       { type: String, default: '' },

  // ── Stats bar
  statStudents:     { type: String, default: '1000+' },
  statPrograms:     { type: String, default: '50+' },
  statSatisfaction: { type: String, default: '98%' },

  // ── Marquee / partners strip
  partners: [{ type: String }],   // e.g. ["Web Development","AI","React"]

  // ── How It Works steps (array of {step, icon, title, desc})
  howItWorks: [{
    step:  { type: String },
    icon:  { type: String },
    title: { type: String },
    desc:  { type: String },
  }],

  // ── Features / Why Choose Us
  features: [{
    icon:  { type: String },
    title: { type: String },
    desc:  { type: String },
  }],

  // ── About section
  aboutTitle:    { type: String, default: 'A Smarter Way to Learn & Apply' },
  aboutSubtitle: { type: String, default: 'DevLogics E-Portal is a complete digital solution for course and service management.' },
  aboutPoints:   [{ type: String }],
  aboutImageUrl: { type: String, default: '' },

  // ── Contact
  contactEmail:   { type: String, default: 'info@devlogics.com' },
  contactPhone:   { type: String, default: '+92-XXX-XXXXXXX' },
  contactAddress: { type: String, default: 'DevLogics Campus, Pakistan' },
  contactWebsite: { type: String, default: 'www.devlogics.com' },
  contactHours:   { type: String, default: 'Mon-Fri 9AM-5PM' },

  // ── Footer
  footerTagline: { type: String, default: 'Course & Service Management' },

  // ── Theme Colors
  theme: {
    primary:     { type: String, default: '#04065c' },   // navbar, sidebar, buttons
    secondary:   { type: String, default: '#023e8a' },   // gradients, hover
    accent:      { type: String, default: '#48cae4' },   // highlights, badges, active
    bgLight:     { type: String, default: '#f0f9ff' },   // page background
    bgDark:      { type: String, default: '#04065c' },   // dark sections
    cardBg:      { type: String, default: '#ffffff' },   // card background (white)
    cardDark:    { type: String, default: '#023e8a' },   // dark cards
    textColor:   { type: String, default: '#1e293b' },   // body text
    borderColor: { type: String, default: '#caf0f8' },   // borders
    white:       { type: String, default: '#ffffff' },   // white elements (forms, cards)
    navText:     { type: String, default: '#ffffff' },   // navbar text colour
    // Section-specific overrides
    heroFrom:    { type: String, default: '' },
    heroTo:      { type: String, default: '' },
    footerBg:    { type: String, default: '' },
  },
}, { timestamps: true })

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)
