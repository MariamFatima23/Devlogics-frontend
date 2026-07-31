import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// ── Tiny chart helpers (pure SVG/CSS — no extra libs needed) ────────

// Donut chart
function DonutChart({ data, size = 140 }) {
  if (!data || data.length === 0) return <p className="text-white/30 text-xs text-center">No data</p>
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-white/30 text-xs text-center">No data</p>

  const COLORS = ['#48cae4','#0077b6','#90e0ef','#caf0f8','#023e8a','#ade8f4','#0096c7','#00b4d8']
  const r = 44, cx = 60, cy = 60, strokeW = 18
  const circumference = 2 * Math.PI * r

  let offset = 0
  const segments = data.map((d, i) => {
    const pct = d.value / total
    const dashLen = pct * circumference
    const seg = { color: COLORS[i % COLORS.length], dashLen, offset, label: d.label, value: d.value, pct }
    offset += dashLen
    return seg
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={strokeW}
            strokeDasharray={`${s.dashLen} ${circumference - s.dashLen}`}
            strokeDashoffset={-(s.offset - 0)}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize="18" fontWeight="700">{total}</text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="text-white/40">({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Bar chart
function BarChart({ data, color = '#48cae4', height = 160 }) {
  if (!data || data.length === 0) return <p className="text-white/30 text-xs text-center">No data</p>
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
            <span className="text-[10px] text-white/60 font-bold">{d.value}</span>
            <div className="w-full rounded-t-lg transition-all duration-700 relative group"
              style={{ height: `${Math.max(pct, 2)}%`, background: `linear-gradient(180deg,${color},${color}88)` }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10">
                {d.label}: {d.value}
              </div>
            </div>
            <span className="text-[9px] text-white/40 text-center leading-tight max-w-[40px] truncate" title={d.label}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// Line chart (SVG)
function LineChart({ data, color = '#48cae4', height = 100 }) {
  if (!data || data.length < 2) return <p className="text-white/30 text-xs text-center">Not enough data</p>
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 300, H = height
  const pad = { top: 8, bottom: 24, left: 8, right: 8 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * innerW,
    y: pad.top + (1 - d.value / max) * innerH,
    label: d.label,
    value: d.value,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${pts[0].x},${H - pad.bottom} ` + polyline + ` ${pts[pts.length-1].x},${H - pad.bottom}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad.left} y1={pad.top + (1-f)*innerH} x2={W-pad.right} y2={pad.top + (1-f)*innerH}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {/* Area fill */}
      <polygon points={area} fill={`${color}22`} />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} />
          <text x={p.x} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

// Funnel chart
function FunnelChart({ funnel }) {
  const stages = [
    { label:'Total Leads',    value: funnel.totalLeads,    color:'#0096c7', pct: 100 },
    { label:'Assigned',       value: funnel.assigned,      color:'#0077b6', pct: funnel.totalLeads ? Math.round(funnel.assigned / funnel.totalLeads * 100) : 0 },
    { label:'Meetings Held',  value: funnel.meetingsHeld,  color:'#023e8a', pct: funnel.totalLeads ? Math.round(funnel.meetingsHeld / funnel.totalLeads * 100) : 0 },
    { label:'Interested',     value: funnel.interested,    color:'#48cae4', pct: funnel.totalLeads ? Math.round(funnel.interested / funnel.totalLeads * 100) : 0 },
    { label:'Converted',      value: funnel.converted,     color:'#34d399', pct: funnel.totalLeads ? Math.round(funnel.converted / funnel.totalLeads * 100) : 0 },
  ]
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-white/60 text-right">{s.label}</span>
          <div className="flex-1 relative h-7 rounded-lg overflow-hidden bg-white/5">
            <div className="h-full rounded-lg transition-all duration-700"
              style={{ width: `${Math.max(s.pct, 1)}%`, background: s.color }} />
            <span className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold text-white">
              {s.value} {s.pct > 0 && <span className="ml-1 text-white/40">({s.pct}%)</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#48cae4' }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 flex items-center gap-4"
      style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.4))' }}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
        <p className="text-sm font-semibold text-white">{label}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Chart card wrapper ────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5"
      style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.4))' }}>
      <div className="mb-4">
        <h3 className="font-bold text-white text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CrmReports() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leads/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load CRM stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
    </div>
  )

  if (!stats) return (
    <div className="text-center py-20 text-white/40">Failed to load stats.</div>
  )

  // Prepare chart data
  const statusData  = stats.byStatus.map(d  => ({ label: d._id,  value: d.count }))
  const gradeData   = stats.byGrade.map(d   => ({ label: d._id,  value: d.count }))
  const sourceData  = stats.bySource.map(d  => ({ label: d._id,  value: d.count }))
  const mtgStatus   = stats.meetingsByStatus.map(d  => ({ label: d._id || 'Unknown', value: d.count }))
  const mtgOutcome  = stats.meetingsByOutcome.filter(d => d._id).map(d => ({ label: d._id, value: d.count }))

  const monthlyData = stats.monthlyTrend.map(d => ({
    label: MONTH_NAMES[(d._id.month - 1)],
    value: d.count,
  }))

  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.funnel.converted / stats.totalLeads) * 100)
    : 0

  const pendingMeetings = stats.meetingsByStatus.find(d => d._id === 'Pending')?.count || 0
  const overdueMeetings = stats.meetingsByStatus.find(d => d._id === 'Overdue')?.count || 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">CRM Reports & KPIs</h2>
        <p className="text-sm text-white/40">Real-time performance analytics</p>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📋" label="Total Leads"    value={stats.totalLeads}        color="#48cae4" />
        <StatCard icon="✅" label="Converted"       value={stats.funnel.converted}   color="#34d399"
          sub={`${conversionRate}% conversion rate`} />
        <StatCard icon="📅" label="Total Meetings"  value={stats.totalMeetings}      color="#a78bfa" />
        <StatCard icon="🚨" label="Pending / Overdue" value={`${pendingMeetings} / ${overdueMeetings}`} color="#fbbf24" />
      </div>

      {/* ── Row 1: Source + Grade donuts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Leads by Source" subtitle="Where are your leads coming from?">
          <DonutChart data={sourceData} size={150} />
        </ChartCard>
        <ChartCard title="Lead Grading" subtitle="💎 Diamond · 🥈 Silver · 🥉 Bronze">
          <DonutChart data={gradeData} size={150} />
        </ChartCard>
      </div>

      {/* ── Row 2: Monthly trend line ── */}
      <ChartCard title="Monthly Lead Trend" subtitle="Last 6 months — new leads added per month">
        {monthlyData.length >= 2
          ? <LineChart data={monthlyData} color="#48cae4" height={120} />
          : <p className="text-white/30 text-xs text-center py-4">Not enough data yet (need at least 2 months)</p>
        }
      </ChartCard>

      {/* ── Row 3: Lead status + Meeting status bars ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Lead Status" subtitle="Current distribution of all lead statuses">
          <BarChart data={statusData} color="#0096c7" height={160} />
        </ChartCard>
        <ChartCard title="Meeting Status" subtitle="Pending, Completed, Rescheduled, etc.">
          <BarChart data={mtgStatus} color="#a78bfa" height={160} />
        </ChartCard>
      </div>

      {/* ── Row 4: Meeting outcomes + Team performance ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Meeting Outcomes" subtitle="What happened after meetings">
          {mtgOutcome.length > 0
            ? <DonutChart data={mtgOutcome} size={140} />
            : <p className="text-white/30 text-xs text-center py-6">No meeting outcomes recorded yet</p>
          }
        </ChartCard>
        <ChartCard title="Team Performance" subtitle="Assigned leads per team member">
          {stats.teamPerformance.length > 0
            ? <BarChart
                data={stats.teamPerformance.map(m => ({ label: m.name.split(' ')[0], value: m.assignedLeads }))}
                color="#34d399" height={160}
              />
            : <p className="text-white/30 text-xs text-center py-6">No team members added yet</p>
          }
        </ChartCard>
      </div>

      {/* ── Funnel ── */}
      <ChartCard title="Lead Conversion Funnel" subtitle="Drop-off at each stage of the pipeline">
        <FunnelChart funnel={stats.funnel} />
      </ChartCard>

      {/* ── Team table ── */}
      {stats.teamPerformance.length > 0 && (
        <ChartCard title="Team Performance Table" subtitle="Detailed breakdown per team member">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/40 uppercase tracking-wider">
                  <th className="text-left pb-3 pr-4">Name</th>
                  <th className="text-left pb-3 pr-4">Role</th>
                  <th className="text-right pb-3">Assigned Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.teamPerformance
                  .sort((a,b) => b.assignedLeads - a.assignedLeads)
                  .map(m => (
                  <tr key={m._id} className="hover:bg-white/5 transition">
                    <td className="py-3 pr-4 font-semibold text-white">{m.name}</td>
                    <td className="py-3 pr-4 text-white/50">{m.role}</td>
                    <td className="py-3 text-right">
                      <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">
                        {m.assignedLeads}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  )
}
