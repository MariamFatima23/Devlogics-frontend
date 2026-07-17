export default function FeeStatus({ user }) {
  const feeDetails = [
    { semester: '1st Semester', amount: 45000, paid: 45000, status: 'Paid', date: '2022-01-15' },
    { semester: '2nd Semester', amount: 45000, paid: 45000, status: 'Paid', date: '2022-07-10' },
    { semester: '3rd Semester', amount: 48000, paid: 48000, status: 'Paid', date: '2023-01-20' },
    { semester: '4th Semester', amount: 48000, paid: 0, status: 'Pending', date: null },
  ]

  const totalPaid   = feeDetails.reduce((s, f) => s + f.paid, 0)
  const totalDue    = feeDetails.reduce((s, f) => s + (f.amount - f.paid), 0)
  const totalAmount = feeDetails.reduce((s, f) => s + f.amount, 0)

  return (
    <div className="max-w-3xl space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-5 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg,#04065c,#0077b6)' }}>
          <p className="text-xs font-semibold text-primary-light">Total Fee</p>
          <p className="mt-1 text-2xl font-bold">Rs. {totalAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-5 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg,#023e8a,#0096c7)' }}>
          <p className="text-xs font-semibold text-primary-light">Total Paid</p>
          <p className="mt-1 text-2xl font-bold">Rs. {totalPaid.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-5 text-white shadow-lg ${totalDue > 0 ? 'bg-rose-500' : ''}`}
          style={totalDue === 0 ? { background: 'linear-gradient(135deg,#0077b6,#48cae4)' } : {}}>
          <p className="text-xs font-semibold opacity-80">Due Amount</p>
          <p className="mt-1 text-2xl font-bold">Rs. {totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Fee Table */}
      <div className="rounded-xl bg-white shadow-sm border border-primary-pale">
        <div className="px-5 py-4 border-b border-primary-pale">
          <h3 className="font-bold text-gray-900">Semester-wise Fee Details</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.rollNumber} · {user?.department}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-bold uppercase text-primary"
              style={{ background: '#f0f9ff' }}>
              <tr>
                <th className="px-5 py-3 text-left">Semester</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Paid</th>
                <th className="px-5 py-3 text-right">Due</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f9ff]">
              {feeDetails.map((f, i) => (
                <tr key={i} className="hover:bg-primary-ice transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{f.semester}</td>
                  <td className="px-5 py-3 text-right text-gray-700">Rs. {f.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary-blue">Rs. {f.paid.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-semibold text-rose-600">
                    Rs. {(f.amount - f.paid).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      f.status === 'Paid'
                        ? 'bg-primary-pale text-primary'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {f.status === 'Paid' ? '? Paid' : '? Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">
                    {f.date ? new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalDue > 0 && (
          <div className="px-5 py-4 border-t border-rose-100 rounded-b-xl" style={{ background: '#fff5f5' }}>
            <p className="text-sm text-rose-700 font-semibold">
              ?? You have Rs. {totalDue.toLocaleString()} due. Submit a Fee Concession application if needed.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-primary-pale bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-bold text-gray-900">Need Fee Concession?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you are facing financial difficulties, you can apply for fee concession through the portal.
        </p>
        <a href="#my-apps"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#0077b6,#04065c)' }}>
          ?? Apply for Fee Concession
        </a>
      </div>
    </div>
  )
}
