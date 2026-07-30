import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

interface MatchRequest {
  id: string; matchPercentage: number; status: string; createdAt: string
  sender: { id: string; name: string; email: string; department: string }
  receiver: { id: string; name: string; email: string; department: string }
}

export default function AdminTeammates() {
  const { state } = useApp()
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 50

  useEffect(() => {
    setLoading(true)
    adminService.getMatchRequests({ page, limit }).then(r => {
      setRequests(r.data.requests)
      setTotal(r.data.total)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / limit)

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Match Requests</h1>
        <p className="text-sm text-slate-500">{total} total requests</p>
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
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">Receiver</th>
                  <th className="px-4 py-3 font-medium">Match %</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className={`border-b ${state.darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-purple-500" />
                        <div>
                          <p className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{r.sender.name}</p>
                          <p className="text-[10px] text-slate-500">{r.sender.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{r.receiver.name}</p>
                      <p className="text-[10px] text-slate-500">{r.receiver.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-purple-600 font-medium">{r.matchPercentage}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[r.status] || 'bg-slate-100 text-slate-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
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
