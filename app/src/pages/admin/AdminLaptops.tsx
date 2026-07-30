import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit3, Monitor } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

interface LaptopData {
  id: string; modelName: string; specs: string; labLocation: string
  status: string; hourlyRate: number
  _count: { bookings: number }
}

export default function AdminLaptops() {
  const { state } = useApp()
  const [laptops, setLaptops] = useState<LaptopData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<LaptopData | null>(null)
  const [form, setForm] = useState({ modelName: '', specs: '', labLocation: '', hourlyRate: 5, status: 'AVAILABLE' })

  const fetchLaptops = () => {
    setLoading(true)
    adminService.getLaptops().then(r => { setLaptops(r.data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchLaptops() }, [])

  const handleCreate = async () => {
    try {
      await adminService.createLaptop(form)
      setShowForm(false)
      setForm({ modelName: '', specs: '', labLocation: '', hourlyRate: 5, status: 'AVAILABLE' })
      fetchLaptops()
    } catch { alert('Failed to create laptop') }
  }

  const handleUpdate = async () => {
    if (!editItem) return
    try {
      await adminService.updateLaptop(editItem.id, form)
      setEditItem(null)
      fetchLaptops()
    } catch { alert('Failed to update laptop') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this laptop?')) return
    try { await adminService.deleteLaptop(id); fetchLaptops() }
    catch { alert('Failed to delete') }
  }

  const openEdit = (item: LaptopData) => {
    setEditItem(item)
    setForm({ modelName: item.modelName, specs: item.specs, labLocation: item.labLocation, hourlyRate: item.hourlyRate, status: item.status })
  }

  const statusColor: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700',
    RENTED: 'bg-amber-100 text-amber-700',
    MAINTENANCE: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Laptops</h1>
          <p className="text-sm text-slate-500">{laptops.length} total laptops</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ modelName: '', specs: '', labLocation: '', hourlyRate: 5, status: 'AVAILABLE' }); setShowForm(true) }}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Add Laptop
        </button>
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
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Specs</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Rate/hr</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {laptops.map(laptop => (
                  <tr key={laptop.id} className={`border-b ${state.darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-slate-400" />
                        <span className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{laptop.modelName}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${state.darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{laptop.specs}</td>
                    <td className="px-4 py-3 text-slate-500">{laptop.labLocation}</td>
                    <td className="px-4 py-3 text-slate-500">₹{laptop.hourlyRate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[laptop.status] || 'bg-slate-100 text-slate-700'}`}>
                        {laptop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{laptop._count?.bookings || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(laptop)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(laptop.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
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
              {editItem ? 'Edit Laptop' : 'Add Laptop'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Model Name</label>
                <input type="text" value={form.modelName} onChange={e => setForm(f => ({ ...f, modelName: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Specs</label>
                <input type="text" value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lab Location</label>
                  <input type="text" value={form.labLocation} onChange={e => setForm(f => ({ ...f, labLocation: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hourly Rate (₹)</label>
                  <input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:ring-2 focus:ring-primary`}>
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
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
