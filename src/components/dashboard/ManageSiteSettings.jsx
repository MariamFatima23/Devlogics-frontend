import { useState, useEffect } from 'react'
import api, { fileUrl } from '../../utils/api'
import { useTheme } from '../../context/ThemeContext'

/* ── Default fallbacks ─────────────────────────────────────────── */
const DEFAULT_STEPS = [
  { step:'01', icon:'👤', title:'Create Account',    desc:'Register and complete your profile.' },
  { step:'02', icon:'📝', title:'Submit Application', desc:'Choose course, fill form, attach CV.' },
  { step:'03', icon:'🔍', title:'Admin Review',       desc:'Admin reviews and updates your status.' },
  { step:'04', icon:'✅', title:'Get Decision',       desc:'Receive Approved or Rejected with feedback.' },
]
const DEFAULT_FEATURES = [
  { icon:'🔒', title:'Secure Login',       desc:'JWT auth with encrypted passwords.' },
  { icon:'📱', title:'Mobile Friendly',    desc:'Works on any device perfectly.' },
  { icon:'⚡', title:'Real-time Alerts',   desc:'Instant notifications on status change.' },
  { icon:'📊', title:'Track Applications', desc:'Full timeline for every application.' },
  { icon:'📎', title:'Document Upload',    desc:'Attach PDFs, images, Word docs.' },
  { icon:'🛡️', title:'Admin Dashboard',   desc:'Powerful panel to manage everything.' },
]
const DEFAULT_PARTNERS = [
  'Web Development','Artificial Intelligence','Digital Marketing','React Native','Python',
  'Machine Learning','Data Science','Cybersecurity','UI/UX Design','Cloud Computing',
  'Java','JavaScript','SEO','Graphic Design','DevOps',
]
const DEFAULT_ABOUT_POINTS = [
  'Apply online — no office visits',
  'Upload CV and documents securely',
  'Track every application with timeline',
  'Real-time notifications on changes',
  'Admin review with detailed feedback',
  'Available 24/7 from any device',
]

/* ── Theme token definitions ───────────────────────────────────── */
const THEME_TOKENS = [
  { key:'primary',     label:'Primary Color',      desc:'Navbar, sidebar, buttons, badges' },
  { key:'secondary',   label:'Secondary Color',    desc:'Gradient partner, hover states' },
  { key:'accent',      label:'Accent / Highlight', desc:'Active items, icons, links' },
  { key:'bgLight',     label:'Light Background',   desc:'Page & section backgrounds' },
  { key:'cardBg',      label:'Card / White',        desc:'Cards, forms, white surfaces' },
  { key:'cardDark',    label:'Dark Card',           desc:'Dark variant cards & panels' },
  { key:'textColor',   label:'Text Color',          desc:'Body & heading text' },
  { key:'borderColor', label:'Border Color',        desc:'Input borders, dividers' },
  { key:'accent',      label:'Accent',              desc:'Badges, ping dots, highlights' },
]

const SECTION_TOKENS = [
  { key:'heroFrom',  label:'Hero Gradient Start', desc:'Leave blank to use Primary' },
  { key:'heroTo',    label:'Hero Gradient End',   desc:'Leave blank to use Secondary' },
  { key:'footerBg',  label:'Footer Background',   desc:'Leave blank to use Primary' },
]

const DEFAULT_THEME = {
  primary:'#04065c', secondary:'#023e8a', accent:'#48cae4',
  bgLight:'#f0f9ff', cardBg:'#ffffff',   cardDark:'#023e8a',
  textColor:'#1e293b', borderColor:'#caf0f8',
  heroFrom:'', heroTo:'', footerBg:'',
}

/* ── Validate hex ──────────────────────────────────────────────── */
const isHex = v => !v || /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)

/* ═══════════════════════════════════════════════════════════════ */
export default function ManageSiteSettings() {
  const { updateTheme, saveTheme, theme: ctxTheme } = useTheme()

  const [form, setForm]       = useState(null)
  const [logo, setLogo]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [themeLoading, setThemeLoading] = useState(false)
  const [msg, setMsg]         = useState(null)
  const [tab, setTab]         = useState('identity')

  const BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'

  /* Load settings on mount */
  useEffect(() => {
    api.get('/site-settings').then(r => {
      const d = r.data
      setForm({
        ...d,
        partners:    d.partners?.length    ? d.partners    : DEFAULT_PARTNERS,
        howItWorks:  d.howItWorks?.length  ? d.howItWorks  : DEFAULT_STEPS,
        features:    d.features?.length    ? d.features    : DEFAULT_FEATURES,
        aboutPoints: d.aboutPoints?.length ? d.aboutPoints : DEFAULT_ABOUT_POINTS,
        theme: { ...DEFAULT_THEME, ...(d.theme || {}) },
      })
    }).catch(() => {})
  }, [])

  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setThm = (k, v) => {
    const next = { ...form.theme, [k]: v }
    setForm(p => ({ ...p, theme: next }))
    updateTheme(next)           // ← live preview on every keystroke
  }

  const setArr = (key, i, field, val) => setForm(p => ({
    ...p, [key]: p[key].map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  }))
  const addArr = (key, blank) => setForm(p => ({ ...p, [key]: [...(p[key]||[]), blank] }))
  const delArr = (key, i)     => setForm(p => ({ ...p, [key]: p[key].filter((_,idx) => idx !== i) }))

  /* ── Save general settings ─────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const data = new FormData()
      const simpleFields = ['portalName','tagline','heroSubtext','statStudents','statPrograms',
        'statSatisfaction','aboutTitle','aboutSubtitle','footerTagline',
        'contactEmail','contactPhone','contactAddress','contactWebsite','contactHours']
      simpleFields.forEach(f => { if (form[f] !== undefined) data.append(f, form[f]) })
      data.append('partners',    JSON.stringify(form.partners    || []))
      data.append('howItWorks',  JSON.stringify(form.howItWorks  || []))
      data.append('features',    JSON.stringify(form.features    || []))
      data.append('aboutPoints', JSON.stringify(form.aboutPoints || []))
      if (logo) data.append('logo', logo)
      const res = await api.patch('/site-settings', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(prev => ({ ...prev, ...res.data, theme: { ...DEFAULT_THEME, ...(res.data.theme||{}) } }))
      setLogo(null)
      setMsg({ type:'success', text:'✅ Settings saved!' })
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to save' })
    } finally { setLoading(false) }
  }

  /* ── Save THEME only ───────────────────────────────────────── */
  const handleThemeSave = async () => {
    // Validate all required fields
    const required = ['primary','secondary','accent','bgLight','cardBg','cardDark','textColor','borderColor']
    for (const k of required) {
      if (!isHex(form.theme[k])) {
        setMsg({ type:'error', text: `❌ "${k}" has an invalid hex colour. Use format #rrggbb` })
        return
      }
    }
    setThemeLoading(true); setMsg(null)
    try {
      await saveTheme(form.theme)          // saves to DB + injects CSS vars globally
      setMsg({ type:'success', text:'🎨 Theme saved! All colours updated across the site instantly.' })
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to save theme' })
    } finally { setThemeLoading(false) }
  }

  /* ── Reset theme to defaults ───────────────────────────────── */
  const handleThemeReset = () => {
    const reset = { ...DEFAULT_THEME }
    setForm(p => ({ ...p, theme: reset }))
    updateTheme(reset)
  }

  const inp  = 'w-full rounded-xl border border-primary-pale bg-primary-ice px-3 py-2.5 text-sm outline-none focus:border-primary-blue focus:bg-white transition'
  const lbl  = 'mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'

  const TABS = [
    { id:'identity', label:'🏷️ Identity' },
    { id:'hero',     label:'🖼️ Hero' },
    { id:'steps',    label:'📋 How It Works' },
    { id:'features', label:'⚡ Features' },
    { id:'about',    label:'ℹ️ About' },
    { id:'contact',  label:'📞 Contact' },
    { id:'theme',    label:'🎨 Theme Colors' },
  ]

  if (!form) return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-8 w-24 animate-pulse rounded-xl bg-gray-100" />)}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  )


  return (
    <div className="space-y-5">

      {/* Message banner */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          msg.type==='success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              tab===t.id ? 'text-white' : 'bg-white border border-primary-pale text-gray-600 hover:border-primary-blue'
            }`}
            style={tab===t.id ? { background:'linear-gradient(135deg,#0077b6,#04065c)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ THEME TAB ════════════════ */}
      {tab === 'theme' && (
        <div className="space-y-6">

          {/* Header */}
          <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">🎨 Theme Colors</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Change any colour and the <strong>whole site updates instantly</strong>. Click Save when done.
                </p>
              </div>
              <button type="button" onClick={handleThemeReset}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition">
                ↺ Reset to Defaults
              </button>
            </div>

            {/* Live preview swatches */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Live Preview</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key:'primary',     label:'Primary' },
                  { key:'secondary',   label:'Secondary' },
                  { key:'accent',      label:'Accent' },
                  { key:'bgLight',     label:'BG Light' },
                  { key:'cardBg',      label:'Card' },
                  { key:'cardDark',    label:'Card Dark' },
                  { key:'textColor',   label:'Text' },
                  { key:'borderColor', label:'Border' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1">
                    <span className="inline-block h-4 w-4 rounded-full border border-black/10 shrink-0"
                      style={{ background: form.theme?.[key] || DEFAULT_THEME[key] }} />
                    <span className="text-[10px] font-semibold text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Global tokens grid */}
          <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm">
            <h4 className="mb-4 font-bold text-gray-800">Global Palette</h4>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key:'primary',     label:'Primary Color',      desc:'Navbar, sidebar, all buttons' },
                { key:'secondary',   label:'Secondary Color',    desc:'Gradient shades, hover' },
                { key:'accent',      label:'Accent / Highlight', desc:'Active nav, badges, icons' },
                { key:'bgLight',     label:'Light Background',   desc:'Page & section backgrounds' },
                { key:'cardBg',      label:'Card / White',        desc:'Cards, forms, white areas' },
                { key:'cardDark',    label:'Dark Card',           desc:'Dark variant cards' },
                { key:'textColor',   label:'Text Color',          desc:'Body & heading text' },
                { key:'borderColor', label:'Border Color',        desc:'Input borders, dividers' },
              ].map(({ key, label, desc }) => {
                const val = form.theme?.[key] ?? DEFAULT_THEME[key] ?? '#000000'
                const invalid = val && !isHex(val)
                return (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">{label}</label>
                    <p className="mb-2 text-[10px] text-gray-400">{desc}</p>
                    <div className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 transition ${invalid ? 'border-red-400' : 'border-gray-200 focus-within:border-primary-blue'}`}>
                      {/* Native colour picker */}
                      <input type="color" value={val.length === 7 ? val : '#000000'}
                        onChange={e => setThm(key, e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        title={label}
                      />
                      {/* Hex text input */}
                      <input type="text" value={val}
                        onChange={e => setThm(key, e.target.value)}
                        maxLength={7}
                        placeholder="#rrggbb"
                        className="flex-1 bg-transparent text-sm font-mono outline-none text-gray-800 placeholder:text-gray-300"
                      />
                      {invalid && <span className="text-[10px] text-red-500">invalid</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>


          {/* Section overrides */}
          <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm">
            <h4 className="mb-1 font-bold text-gray-800">Section-Specific Overrides</h4>
            <p className="mb-4 text-xs text-gray-400">Optional. Leave blank to inherit from the global palette above.</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { key:'heroFrom',  label:'Hero Gradient Start', desc:'Blank → uses Primary' },
                { key:'heroTo',    label:'Hero Gradient End',   desc:'Blank → uses Secondary' },
                { key:'footerBg',  label:'Footer Background',   desc:'Blank → uses Primary' },
              ].map(({ key, label, desc }) => {
                const val = form.theme?.[key] ?? ''
                const invalid = val && !isHex(val)
                return (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">{label}</label>
                    <p className="mb-2 text-[10px] text-gray-400">{desc}</p>
                    <div className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 ${invalid ? 'border-red-400' : 'border-gray-200 focus-within:border-primary-blue'}`}>
                      <input type="color"
                        value={val.length === 7 ? val : form.theme?.primary || '#04065c'}
                        onChange={e => setThm(key, e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                      />
                      <input type="text" value={val}
                        onChange={e => setThm(key, e.target.value)}
                        maxLength={7}
                        placeholder="(optional)"
                        className="flex-1 bg-transparent text-sm font-mono outline-none text-gray-800 placeholder:text-gray-300"
                      />
                      {val && (
                        <button type="button" onClick={() => setThm(key, '')}
                          className="text-[10px] text-gray-400 hover:text-red-500">✕</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Save theme button */}
          <button type="button" onClick={handleThemeSave} disabled={themeLoading}
            className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60 transition hover:opacity-90"
            style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
            {themeLoading ? '⏳ Saving Theme…' : '🎨 Save Theme — All Pages Update Instantly'}
          </button>

        </div>  /* end theme tab */
      )}


      {/* ════════════ OTHER TABS (wrapped in a form) ════════════ */}
      {tab !== 'theme' && (
        <form onSubmit={handleSubmit}>

          {/* ── IDENTITY ── */}
          {tab === 'identity' && (
            <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900">Portal Identity</h3>
              <div>
                <label className={lbl}>Logo</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center border border-primary-pale bg-primary-ice rounded-xl p-1">
                    <img src={form.logoUrl ? fileUrl(form.logoUrl) : '/gallery/logo1.png'}
                      alt="logo" style={{ height:'40px', width:'auto', objectFit:'contain' }} />
                  </div>
                  <label className="cursor-pointer rounded-xl border border-primary-pale bg-primary-ice px-4 py-2 text-xs font-bold text-primary-blue hover:bg-primary-pale transition">
                    {logo ? logo.name : 'Upload Logo'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setLogo(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={lbl}>Portal Name</label><input value={form.portalName} onChange={e=>set('portalName',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Footer Tagline</label><input value={form.footerTagline||''} onChange={e=>set('footerTagline',e.target.value)} className={inp} /></div>
              </div>
              <div>
                <label className={lbl}>Marquee Tags (one per line)</label>
                <textarea value={(form.partners||[]).join('\n')}
                  onChange={e => set('partners', e.target.value.split('\n').map(s=>s.trim()).filter(Boolean))}
                  rows="6" className={inp} placeholder="Web Development&#10;AI&#10;Python" />
              </div>
            </div>
          )}

          {/* ── HERO ── */}
          {tab === 'hero' && (
            <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900">Hero Section</h3>
              <div><label className={lbl}>Main Tagline</label><input value={form.tagline} onChange={e=>set('tagline',e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Sub-text</label><textarea value={form.heroSubtext} onChange={e=>set('heroSubtext',e.target.value)} rows="2" className={inp} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className={lbl}>Students Stat</label><input value={form.statStudents} onChange={e=>set('statStudents',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Programs Stat</label><input value={form.statPrograms} onChange={e=>set('statPrograms',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Satisfaction Stat</label><input value={form.statSatisfaction} onChange={e=>set('statSatisfaction',e.target.value)} className={inp} /></div>
              </div>
            </div>
          )}

          {/* ── HOW IT WORKS ── */}
          {tab === 'steps' && (
            <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900">How It Works Steps</h3>
                <button type="button" onClick={() => addArr('howItWorks', { step: String((form.howItWorks?.length||0)+1).padStart(2,'0'), icon:'📌', title:'', desc:'' })}
                  className="rounded-xl border border-primary-pale px-3 py-1.5 text-xs font-bold text-primary-blue hover:bg-primary-ice">+ Add Step</button>
              </div>
              {(form.howItWorks||[]).map((s,i) => (
                <div key={i} className="rounded-xl border border-primary-pale bg-[#f8fdff] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Step {i+1}</span>
                    <button type="button" onClick={() => delArr('howItWorks',i)} className="text-xs text-rose-500">✕ Remove</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div><label className={lbl}>Step #</label><input value={s.step} onChange={e=>setArr('howItWorks',i,'step',e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Icon</label><input value={s.icon} onChange={e=>setArr('howItWorks',i,'icon',e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Title</label><input value={s.title} onChange={e=>setArr('howItWorks',i,'title',e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Desc</label><input value={s.desc} onChange={e=>setArr('howItWorks',i,'desc',e.target.value)} className={inp} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FEATURES ── */}
          {tab === 'features' && (
            <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900">Why Choose Us — Features</h3>
                <button type="button" onClick={() => addArr('features', { icon:'✨', title:'', desc:'' })}
                  className="rounded-xl border border-primary-pale px-3 py-1.5 text-xs font-bold text-primary-blue hover:bg-primary-ice">+ Add Feature</button>
              </div>
              {(form.features||[]).map((f,i) => (
                <div key={i} className="rounded-xl border border-primary-pale bg-[#f8fdff] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Feature {i+1}</span>
                    <button type="button" onClick={() => delArr('features',i)} className="text-xs text-rose-500">✕ Remove</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><label className={lbl}>Icon</label><input value={f.icon} onChange={e=>setArr('features',i,'icon',e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Title</label><input value={f.title} onChange={e=>setArr('features',i,'title',e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Desc</label><input value={f.desc} onChange={e=>setArr('features',i,'desc',e.target.value)} className={inp} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ABOUT ── */}
          {tab === 'about' && (
            <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900">About Section</h3>
              <div><label className={lbl}>Main Title</label><input value={form.aboutTitle||''} onChange={e=>set('aboutTitle',e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Sub-text</label><textarea value={form.aboutSubtitle||''} onChange={e=>set('aboutSubtitle',e.target.value)} rows="3" className={inp} /></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={lbl}>Bullet Points</label>
                  <button type="button" onClick={() => set('aboutPoints',[...(form.aboutPoints||[]),''])} className="text-xs font-bold text-primary-blue hover:underline">+ Add</button>
                </div>
                {(form.aboutPoints||[]).map((pt,i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input value={pt} onChange={e=>set('aboutPoints',form.aboutPoints.map((p,j)=>j===i?e.target.value:p))} className={inp} />
                    <button type="button" onClick={()=>set('aboutPoints',form.aboutPoints.filter((_,j)=>j!==i))} className="rounded-lg bg-rose-50 px-3 text-rose-500 hover:bg-rose-100">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {tab === 'contact' && (
            <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900">Contact Section</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={lbl}>Email</label><input value={form.contactEmail} onChange={e=>set('contactEmail',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Phone</label><input value={form.contactPhone} onChange={e=>set('contactPhone',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Address</label><input value={form.contactAddress} onChange={e=>set('contactAddress',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Website</label><input value={form.contactWebsite} onChange={e=>set('contactWebsite',e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Office Hours</label><input value={form.contactHours||'Mon-Fri 9AM-5PM'} onChange={e=>set('contactHours',e.target.value)} className={inp} /></div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition hover:opacity-90"
            style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
            {loading ? 'Saving…' : ' Save Changes '}
          </button>
        </form>
      )}

    </div>
  )
}
