export default function FeeStatus({ user }) {
  // Static demo data — can be connected to a real fee backend later
  const feeDetails = [
    { batchester: '1st batchester', amount: 45000, paid: 45000, status: 'Paid', date: '2022-01-15' },
    { batchester: '2nd batchester', amount: 45000, paid: 45000, status: 'Paid', date: '2022-07-10' },
    { batchester: '3rd batchester', amount: 48000, paid: 48000, status: 'Paid', date: '2023-01-20' },
    { batchester: '4th batchester', amount: 48000, paid: 0, status: 'Pending', date: null },
  ]

  const totalPaid    = feeDetails.reduce((s,f) => s + f.paid, 0)
  const totalDue     = feeDetails.reduce((s,f) => s + (f.amount - f.paid), 0)
  const totalAmount  = feeDetails.reduce((s,f) => s + f.amount, 0)

  return (
    <div className="max-w-3xl space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-[#0077b6] p-5 text-white shadow-lg">
          <p className="text-xs font-batchibold text-indigo-200">Total Fee</p>
          <p className="mt-1 text-2xl font-bold">Rs. {totalAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-emerald-600 p-5 text-white shadow-lg">
          <p className="text-xs font-batchibold text-emerald-200">Total Paid</p>
          <p className="mt-1 text-2xl font-bold">Rs. {totalPaid.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-5 text-white shadow-lg ${totalDue > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          <p className="text-xs font-batchibold opacity-80">Due Amount</p>
          <p className="mt-1 text-2xl font-bold">Rs. {totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Fee Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">batchester-wise Fee Details</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.rollNumber} · {user?.department}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">batchester</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Paid</th>
                <th className="px-5 py-3 text-right">Due</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feeDetails.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{f.batchester}</td>
                  <td className="px-5 py-3 text-right text-gray-700">Rs. {f.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-batchibold">Rs. {f.paid.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-rose-600 font-batchibold">
                    Rs. {(f.amount - f.paid).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      f.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {f.status === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">
                    {f.date ? new Date(f.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalDue > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-rose-50 rounded-b-xl">
            <p className="text-sm text-rose-700 font-batchibold">
              ⚠️ You have Rs. {totalDue.toLocaleString()} due. Submit a Fee Concession application if needed.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-bold text-gray-900">Need Fee Concession?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you are facing financial difficulties, you can apply for fee concession through the portal.
        </p>
        <a href="#my-apps" className="inline-flex items-center gap-2 rounded-lg bg-[#0077b6] px-5 py-2.5 text-sm font-batchibold text-white hover:bg-indigo-700 transition">
          💰 Apply for Fee Concession
        </a>
      </div>
    </div>
  )
}

