import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

/* ── Donut Chart (pure SVG) ── */
function DonutChart({ data, size=140 }) {
  if (!data?.length) return <p className="text-center text-sm text-gray-400 py-4">No data</p>
  const total = data.reduce((s,d)=>s+d.value,0)
  if (!total) return <p className="text-center text-sm text-gray-400 py-4">No data</p>
  const COLORS = ['#04065c','#023e8a','#0077b6','#0096c7','#48cae4','#90e0ef','#caf0f8','#1d4ed8']
  const r=44, cx=60, cy=60, sw=18, circ=2*Math.PI*r
  let off=0
  const segs = data.map((d,i)=>{ const dl=d.value/total*circ; const s={c:COLORS[i%COLORS.length],dl,off,label:d.label,value:d.value}; off+=dl; return s })
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw}/>
        {segs.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth={sw}
            strokeDasharray={`${s.dl} ${circ-s.dl}`} strokeDashoffset={-s.off}
            transform={`rotate(-90 ${cx} ${cy})`}/>
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#04065c" fontSize="18" fontWeight="800">{total}</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segs.map((s,i)=>(
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background:s.c }}/>
            {s.label} <span className="text-gray-400">({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Bar Chart ── */
function BarChart({ data, color='#04065c', height=150 }) {
  if (!data?.length) return <p className="text-center text-sm text-gray-400 py-4">No data</p>
  const max = Math.max(...data.map(d=>d.value),1)
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d,i)=>{
        const pct=(d.value/max)*100
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
            <span className="text-[10px] text-gray-600 font-bold">{d.value}</span>
            <div className="w-full rounded-t-lg relative group transition-all duration-700"
              style={{ height:`${Math.max(pct,2)}%`, background:`linear-gradient(180deg,${color},${color}99)` }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white rounded-lg px-2 py-1 text-[10px] whitespace-nowrap z-10">
                {d.label}: {d.value}
              </div>
            </div>
            <span className="text-[9px] text-gray-500 text-center leading-tight max-w-[40px] truncate" title={d.label}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Line Chart ── */
function LineChart({ data, color='#04065c', height=100 }) {
  if (!data||data.length<2) return <p className="text-center text-sm text-gray-400 py-4">Need at least 2 months of data</p>
  const max=Math.max(...data.map(d=>d.value),1)
  const W=300, H=height, pad={t:8,b:24,l:8,r:8}
  const iW=W-pad.l-pad.r, iH=H-pad.t-pad.b
  const pts=data.map((d,i)=>({ x:pad.l+(i/(data.length-1))*iW, y:pad.t+(1-d.value/max)*iH, label:d.label, value:d.value }))
  const poly=pts.map(p=>`${p.x},${p.y}`).join(' ')
  const area=`${pts[0].x},${H-pad.b} ${poly} ${pts[pts.length-1].x},${H-pad.b}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {[0.25,0.5,0.75,1].map(f=>(
        <line key={f} x1={pad.l} y1={pad.t+(1-f)*iH} x2={W-pad.r} y2={pad.t+(1-f)*iH} stroke="#e2e8f0" strokeWidth={1}/>
      ))}
      <polygon points={area} fill={`${color}18`}/>
      <polyline points={poly} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color}/>
          <text x={p.x} y={H-4} textAnchor="middle" fill="#94a3b8" fontSize={9}>{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

/* ── Funnel Chart ── */
function FunnelChart({ funnel }) {
  const stages = [
    { label:'Total Leads',   value:funnel.totalLeads,   color:'#04065c' },
    { label:'Assigned',      value:funnel.assigned,     color:'#023e8a' },
    { label:'Meetings Held', value:funnel.meetingsHeld, color:'#0077b6' },
    { label:'Interested',    value:funnel.interested,   color:'#0096c7' },
    { label:'Converted',     value:funnel.converted,    color:'#48cae4' },
  ]
  const maxV = funnel.totalLeads || 1
  return (
    <div className="space-y-2">
      {stages.map((s,i)=>{
        const pct = Math.round(s.value/maxV*100)
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-gray-600 text-right font-semibold">{s.label}</span>
            <div className="flex-1 relative h-8 rounded-xl overflow-hidden bg-gray-100">
              <div className="h-full rounded-xl transition-all duration-700" style={{ width:`${Math.max(pct,1)}%`, background:s.color }}/>
              <span className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold text-white">
                {s.value} {pct>0 && <span className="ml-1 text-white/60">({pct}%)</span>}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Stat card ── */
function KpiCard({ icon, label, value, sub, color='#04065c', bg='#eff6ff', border='#bfdbfe' }) {
  return (
    <div className="dp-stat-card flex items-center gap-4" style={{ borderLeft:`4px solid ${color}`, background:bg, borderColor:border }}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ background:`${color}15` }}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Chart card ── */
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="dp-card p-5">
      <div className="mb-4">
        <h3 className="font-extrabold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
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
      .then(r=>setStats(r.data))
      .catch(()=>toast.error('Failed to load stats'))
      .finally(()=>setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100"/>)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100"/>)}</div>
    </div>
  )

  if (!stats) return <div className="text-center py-20 text-gray-400">Failed to load stats.</div>

  const sourceData  = stats.bySource.map(d=>({ label:d._id,  value:d.count }))
  const gradeData   = stats.byGrade.map(d=>({ label:d._id,   value:d.count }))
  const statusData  = stats.byStatus.map(d=>({ label:d._id,  value:d.count }))
  const mtgStatus   = stats.meetingsByStatus.map(d=>({ label:d._id||'?', value:d.count }))
  const mtgOutcome  = stats.meetingsByOutcome.filter(d=>d._id).map(d=>({ label:d._id, value:d.count }))
  const monthlyData = stats.monthlyTrend.map(d=>({ label:MONTH_NAMES[d._id.month-1], value:d.count }))

  const convRate = stats.totalLeads>0 ? Math.round(stats.funnel.converted/stats.totalLeads*100) : 0
  const pending  = stats.meetingsByStatus.find(d=>d._id==='Pending')?.count||0
  const overdue  = stats.meetingsByStatus.find(d=>d._id==='Overdue')?.count||0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">CRM Reports & KPIs</h2>
        <p className="text-sm text-gray-500">Real-time performance analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard icon="📋" label="Total Leads"    value={stats.totalLeads}       color="#04065c" bg="#eff6ff" border="#bfdbfe" />
        <KpiCard icon="✅" label="Converted"       value={stats.funnel.converted} color="#059669" bg="#f0fdf4" border="#a7f3d0"
          sub={`${convRate}% rate`} />
        <KpiCard icon="📅" label="Total Meetings"  value={stats.totalMeetings}    color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
        <KpiCard icon="🚨" label="Pending / Overdue" value={`${pending} / ${overdue}`} color="#d97706" bg="#fffbeb" border="#fde68a" />
      </div>

      {/* Row 1: Source + Grade donuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Leads by Source" subtitle="Where are your leads coming from?">
          <DonutChart data={sourceData} size={150}/>
        </ChartCard>
        <ChartCard title="Lead Grading" subtitle="💎 Diamond · 🥈 Silver · 🥉 Bronze">
          <DonutChart data={gradeData} size={150}/>
        </ChartCard>
      </div>

      {/* Monthly trend */}
      <ChartCard title="Monthly Lead Trend" subtitle="New leads per month (last 6 months)">
        <LineChart data={monthlyData} color="#04065c" height={120}/>
      </ChartCard>

      {/* Row 2: Lead status + Meeting status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Lead Status" subtitle="Current distribution of all leads">
          <BarChart data={statusData} color="#0077b6" height={150}/>
        </ChartCard>
        <ChartCard title="Meeting Status" subtitle="Pending, Completed, Rescheduled, etc.">
          <BarChart data={mtgStatus} color="#7c3aed" height={150}/>
        </ChartCard>
      </div>

      {/* Row 3: Meeting outcomes + Team performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Meeting Outcomes" subtitle="Results from completed meetings">
          {mtgOutcome.length>0
            ? <DonutChart data={mtgOutcome} size={140}/>
            : <p className="text-center text-sm text-gray-400 py-6">No outcomes recorded yet</p>}
        </ChartCard>
        <ChartCard title="Team Performance" subtitle="Assigned leads per team member">
          {stats.teamPerformance.length>0
            ? <BarChart data={stats.teamPerformance.map(m=>({ label:m.name.split(' ')[0], value:m.assignedLeads }))} color="#059669" height={150}/>
            : <p className="text-center text-sm text-gray-400 py-6">No team members added yet</p>}
        </ChartCard>
      </div>

      {/* Funnel */}
      <ChartCard title="Lead Conversion Funnel" subtitle="How many leads progress through each stage">
        <FunnelChart funnel={stats.funnel}/>
      </ChartCard>

      {/* Team table */}
      {stats.teamPerformance.length>0 && (
        <ChartCard title="Team Performance Table" subtitle="Assigned leads per member">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left pb-3 pr-4 font-bold">Name</th>
                  <th className="text-left pb-3 pr-4 font-bold">Role</th>
                  <th className="text-right pb-3 font-bold">Assigned Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.teamPerformance.sort((a,b)=>b.assignedLeads-a.assignedLeads).map(m=>(
                  <tr key={m._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-4 font-bold text-gray-900">{m.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{m.role}</td>
                    <td className="py-3 text-right">
                      <span className="dp-pill bg-primary-pale text-primary-blue text-xs font-bold px-3">{m.assignedLeads}</span>
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
