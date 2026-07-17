import { Link } from 'react-router-dom'

const quickLinks = [
  { title: 'Apply for Services', desc: 'Scholarship, hostel, transcript, and more.', href: '/register' },
  { title: 'Student Dashboard', desc: 'Track your applications and notifications.', href: '/dashboard' },
  { title: 'Support Center', desc: 'Find help and office contact details.', href: '#contact' },
]

const highlights = [
  { title: 'Admissions', desc: 'Easy online application process for new students.' },
  { title: 'Academics', desc: 'Access academic records, results, and services.' },
  { title: 'Student Life', desc: 'Hostel, events, and support resources in one place.' },
]

export default function UniversityLanding({ user }) {
  return (
    <section className="relative overflow-hidden px-6 py-20 text-white"
      style={{ background: 'var(--theme-grad-hero)' }}>
      <div className="absolute inset-0">
        <img
          src="/gallery/image.png"
          alt="University campus"
          className="h-full w-full object-cover opacity-20"
        />
      </div>
      {/* Overlay using theme colours */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 90%, transparent) 0%, color-mix(in srgb, var(--theme-secondary) 80%, transparent) 50%, color-mix(in srgb, var(--theme-secondary) 70%, transparent) 100%)' }} />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              Student Portal
            </div>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight md:text-6xl">
              A smart digital portal for{' '}
              <span style={{ color: 'var(--theme-accent)' }}> services</span> and student success.
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-white/80">
              Manage admissions, requests, support services, and academic updates from one secure student-friendly platform.
            </p>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <Link to="/dashboard"
                  className="rounded-xl px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5"
                  style={{ background: 'var(--theme-card-bg)', color: 'var(--theme-primary)' }}>
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register"
                    className="rounded-xl px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5"
                    style={{ background: 'var(--theme-card-bg)', color: 'var(--theme-primary)' }}>
                    Register Now
                  </Link>
                  <Link to="/login"
                    className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                    Student Login
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { value: '24/7', label: 'Portal Access' },
                { value: '100%', label: 'Online Services' },
                { value: 'Fast', label: 'Processing' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-extrabold" style={{ color: 'var(--theme-accent)' }}>{item.value}</p>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="mb-4 text-2xl font-bold text-white">Quick access</h2>
            <div className="space-y-3">
              {quickLinks.map((item) => (
                <Link key={item.title} to={item.href}
                  className="block rounded-2xl border border-white/10 p-4 transition hover:bg-white/10"
                  style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-7xl grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-white/70">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
