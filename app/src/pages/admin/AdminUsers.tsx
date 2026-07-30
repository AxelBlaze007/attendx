import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, Edit3, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

interface UserData {
  id: string; name: string; email: string; department: string; year: number
  role: string; subscriptionStatus: string; pointsBalance: number
  skills: string[]; interests: string[]; createdAt: string
  _count: { attendances: number; rewardClaims: number; laptopBookings: number }
}

export default function AdminUsers() {
  const { state } = useApp()
  const [users, setUsers] = useState<UserData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<UserData | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', department: '', year: 1, role: 'STUDENT', pointsBalance: 0 })

  const limit = 20

  const fetchUsers = () => {
    setLoading(true)
    const params: Record<string, string | number> = { page, limit }
    if (search) params.search = search
    if (roleFilter) params.role = roleFilter
    adminService.getUsers(params).then(r => {
      setUsers(r.data.users)
      setTotal(r.data.total)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await adminService.deleteUser(id)
      fetchUsers()
    } catch { alert('Failed to delete user') }
  }

  const handleEdit = (u: UserData) => {
    setEditUser(u)
    setEditForm({ name: u.name, email: u.email, department: u.department, year: u.year, role: u.role, pointsBalance: u.pointsBalance })
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    try {
      await adminService.updateUser(editUser.id, editForm)
      setEditUser(null)
      fetchUsers()
    } catch { alert('Failed to update user') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Users</h1>
          <p className="text-sm text-slate-500">{total} total users</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { window.open('/api/admin/users/export-csv', '_blank') }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium flex items-center gap-2 hover:bg-emerald-600 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 flex-wrap">
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, department..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm ${
                  state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </form>
            <select
              value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
              className={`px-3 py-2 rounded-xl border text-sm ${
                state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${state.darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'} border-b`}>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`border-b ${state.darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {u.name[0]}
                        </div>
                        <span className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{u.name}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 ${state.darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{u.department}</td>
                    <td className="px-4 py-3 text-slate-500">{u.year}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-600 font-medium">{u.pointsBalance}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>A:{u._count.attendances}</span>
                        <span>R:{u._count.rewardClaims}</span>
                        <span>B:{u._count.laptopBookings}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
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

      {editUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`w-full max-w-md rounded-2xl p-6 ${state.darkMode ? 'bg-slate-800' : 'bg-white'}`}
          >
            <h3 className={`text-lg font-bold mb-4 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Edit User</h3>
            <div className="space-y-3">
              {(['name', 'email', 'department'] as const).map(field => (
                <div key={field}>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{field}</label>
                  <input
                    type="text" value={editForm[field]} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Year</label>
                  <input type="number" value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Points</label>
                  <input type="number" value={editForm.pointsBalance} onChange={e => setEditForm(f => ({ ...f, pointsBalance: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Role</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${
                    state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
