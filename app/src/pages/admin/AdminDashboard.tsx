import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Gift, Calendar, BookOpen, Laptop, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

interface Stats {
  counts: {
    totalUsers: number; totalStudents: number; totalAdmins: number
    totalAttendances: number; totalRewardItems: number; totalClaims: number
    totalLaptops: number; totalBookings: number; totalMatchRequests: number
  }
  recentUsers: Array<{ id: string; name: string; email: string; department: string; role: string; createdAt: string }>
  recentAttendances: Array<{ id: string; subjectName: string; roomNo: string; timestamp: string; user: { name: string; email: string } }>
}

export default function AdminDashboard() {
  const { state } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats().then(r => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Users', value: stats.counts.totalUsers, icon: Users, color: 'from-blue-400 to-blue-600', change: '+12%', up: true },
    { label: 'Students', value: stats.counts.totalStudents, icon: BookOpen, color: 'from-emerald-400 to-emerald-600', change: '+8%', up: true },
    { label: 'Attendance', value: stats.counts.totalAttendances, icon: Calendar, color: 'from-amber-400 to-amber-600', change: stats.counts.totalAttendances > 0 ? '+5%' : '0%', up: true },
    { label: 'Rewards', value: stats.counts.totalRewardItems, icon: Gift, color: 'from-purple-400 to-purple-600', change: `${stats.counts.totalClaims} claims`, up: true },
    { label: 'Laptops', value: stats.counts.totalLaptops, icon: Laptop, color: 'from-cyan-400 to-cyan-600', change: `${stats.counts.totalBookings} bookings`, up: true },
    { label: 'Matches', value: stats.counts.totalMatchRequests, icon: MessageSquare, color: 'from-rose-400 to-rose-600', change: 'requests', up: true },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of AttendX platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl border ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              <div className="flex items-center gap-1 mt-1">
                {card.up ? <ArrowUp size={12} className="text-emerald-500" /> : <ArrowDown size={12} className="text-red-500" />}
                <span className="text-[10px] text-slate-400">{card.change}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border p-5 ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users size={18} className="text-primary" /> Recent Users
          </h3>
          <div className="space-y-3">
            {stats?.recentUsers.map(u => (
              <div key={u.id} className={`flex items-center gap-3 p-2 rounded-xl ${state.darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {u.role}
                </span>
              </div>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No users yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`rounded-2xl border p-5 ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Calendar size={18} className="text-primary" /> Recent Attendance
          </h3>
          <div className="space-y-3">
            {stats?.recentAttendances.map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-2 rounded-xl ${state.darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Calendar size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{a.subjectName}</p>
                  <p className="text-xs text-slate-500 truncate">{a.user.name} · {a.roomNo}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(a.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
            {(!stats?.recentAttendances || stats.recentAttendances.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No attendance yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
