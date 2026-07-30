import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Monitor } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

interface BookingRecord {
  id: string; duration: string; startTime: string; endTime: string
  totalAmount: number; paymentStatus: string; pickupQrCode: string | null; createdAt: string
  user: { id: string; name: string; email: string }
  laptop: { id: string; modelName: string; labLocation: string }
}

export default function AdminBookings() {
  const { state } = useApp()
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 50

  useEffect(() => {
    setLoading(true)
    adminService.getBookings({ page, limit }).then(r => {
      setBookings(r.data.bookings)
      setTotal(r.data.total)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Laptop Bookings</h1>
        <p className="text-sm text-slate-500">{total} total bookings</p>
      </div>

      <div className={`rounded-2xl border ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${state.darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'} border-b`}>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Laptop</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Booked At</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className={`border-b ${state.darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{b.user.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Monitor size={14} className="text-slate-400" />
                        <span className="text-slate-500">{b.laptop.modelName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{b.duration.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(b.startTime).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-500">₹{b.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{b.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
