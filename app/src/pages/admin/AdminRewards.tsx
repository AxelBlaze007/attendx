import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

interface RewardData {
  id: string; title: string; category: string; pointCost: number
  availableQty: number; imageUrl: string | null
  _count?: { claims: number }
}

export default function AdminRewards() {
  const { state } = useApp()
  const [items, setItems] = useState<RewardData[]>([])
  const [claims, setClaims] = useState<Array<{ id: string; qrVoucherCode: string; status: string; createdAt: string; expiresAt: string; user: { name: string; email: string }; rewardItem: { title: string } }>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<RewardData | null>(null)
  const [form, setForm] = useState({ title: '', category: 'CANTEEN', pointCost: 10, availableQty: 10, imageUrl: '' })
  const [tab, setTab] = useState<'items' | 'claims'>('items')

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      adminService.getRewards(),
      adminService.getClaims(),
    ]).then(([itemsRes, claimsRes]) => {
      setItems(itemsRes.data)
      setClaims(claimsRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async () => {
    try {
      await adminService.createReward({ ...form, imageUrl: form.imageUrl || undefined })
      setShowForm(false)
      setForm({ title: '', category: 'CANTEEN', pointCost: 10, availableQty: 10, imageUrl: '' })
      fetchData()
    } catch { alert('Failed to create reward') }
  }

  const handleUpdate = async () => {
    if (!editItem) return
    try {
      await adminService.updateReward(editItem.id, form)
      setEditItem(null)
      setForm({ title: '', category: 'CANTEEN', pointCost: 10, availableQty: 10, imageUrl: '' })
      fetchData()
    } catch { alert('Failed to update reward') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reward item?')) return
    try { await adminService.deleteReward(id); fetchData() }
    catch { alert('Failed to delete') }
  }

  const openEdit = (item: RewardData) => {
    setEditItem(item)
    setForm({ title: item.title, category: item.category, pointCost: item.pointCost, availableQty: item.availableQty, imageUrl: item.imageUrl || '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Rewards</h1>
          <p className="text-sm text-slate-500">{items.length} items · {claims.length} claims</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ title: '', category: 'CANTEEN', pointCost: 10, availableQty: 10, imageUrl: '' }); setShowForm(true) }}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Add Reward
        </button>
      </div>

      <div className={`rounded-2xl border ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setTab('items')}
            className={`px-4 py-3 text-sm font-medium ${tab === 'items' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>Items</button>
          <button onClick={() => setTab('claims')}
            className={`px-4 py-3 text-sm font-medium ${tab === 'claims' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>Claims</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : tab === 'items' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${state.darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'} border-b`}>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Claims</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className={`border-b ${state.darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-amber-600 font-medium">{item.pointCost}</td>
                    <td className="px-4 py-3">
                      <span className={item.availableQty <= 0 ? 'text-red-500' : 'text-slate-500'}>{item.availableQty}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item._count?.claims || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${state.darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'} border-b`}>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id} className={`border-b ${state.darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`px-4 py-3 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{c.user.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.rewardItem.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        c.status === 'CLAIMED' ? 'bg-emerald-100 text-emerald-700' : c.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{c.qrVoucherCode}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(c.expiresAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showForm || editItem) && (
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
            <h3 className={`text-lg font-bold mb-4 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              {editItem ? 'Edit Reward' : 'Add Reward'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`}>
                    <option value="CANTEEN">Canteen</option>
                    <option value="STATIONERY">Stationery</option>
                    <option value="PRINTING">Printing</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Point Cost</label>
                  <input type="number" value={form.pointCost} onChange={e => setForm(f => ({ ...f, pointCost: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Qty</label>
                  <input type="number" value={form.availableQty} onChange={e => setForm(f => ({ ...f, availableQty: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Image URL</label>
                  <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditItem(null) }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium">Cancel</button>
              <button onClick={editItem ? handleUpdate : handleCreate}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">
                {editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
