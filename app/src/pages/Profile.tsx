import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, GraduationCap, Hash, Phone, Shield, Lock,
  Save, KeyRound, X, Plus, Award, Monitor, Sparkles,
  CheckCircle, AlertCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import AvatarUpload from '../components/AvatarUpload'
import { attendanceService } from '../services/attendanceService'
import { rentalService } from '../services/rentalService'

type ProfileTab = 'info' | 'security' | 'activity'

function getPasswordStrength(password: string): { label: string; color: string; width: string; textColor: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5', textColor: 'text-red-500' }
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/5', textColor: 'text-orange-500' }
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/5', textColor: 'text-yellow-500' }
  if (score <= 4) return { label: 'Strong', color: 'bg-lime-500', width: 'w-4/5', textColor: 'text-lime-500' }
  return { label: 'Very Strong', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-500' }
}

function SkillInput({ skills, onAdd, onRemove, darkMode }: {
  skills: string[]
  onAdd: (s: string) => void
  onRemove: (s: string) => void
  darkMode: boolean
}) {
  const [input, setInput] = useState('')
  const [suggestions] = useState(['React', 'Node.js', 'Python', 'Flutter', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'SQL', 'Docker', 'AWS', 'Figma', 'Tailwind'])

  const add = () => {
    const val = input.trim()
    if (val && !skills.includes(val)) {
      onAdd(val)
      setInput('')
    }
  }

  const filtered = suggestions.filter(s => !skills.includes(s) && s.toLowerCase().includes(input.toLowerCase()))

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map(s => (
          <span key={s} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}>
            {s}
            <button type="button" onClick={() => onRemove(s)} className="hover:opacity-70">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a skill and press Enter"
          />
          <button type="button" onClick={add} disabled={!input.trim()} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm disabled:opacity-50">
            <Plus size={16} />
          </button>
        </div>
        {input && filtered.length > 0 && (
          <div className={`absolute z-10 mt-1 w-full rounded-xl border shadow-lg ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {filtered.slice(0, 5).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { onAdd(s); setInput('') }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 ${
                  darkMode ? 'text-white' : 'text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { state } = useApp()
  const [tab, setTab] = useState<ProfileTab>('info')

  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, percentage: 0 })
  const [rentalCount, setRentalCount] = useState(0)

  useEffect(() => {
    attendanceService.getHistory().then(r => {
      const s = r.data.summary
      setAttendanceStats({ total: s.total, present: s.presentDays, percentage: s.percentage })
    }).catch(() => {})
    rentalService.getBookingHistory().then(r => {
      setRentalCount(r.data.length)
    }).catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className={`rounded-2xl p-6 ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
        <div className="flex items-center gap-4">
          <AvatarUpload size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl font-bold truncate ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              {state.userName}
            </h2>
            <p className="text-sm text-slate-500 truncate">{state.userEmail}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                state.userSubscription === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {state.userSubscription}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                state.darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {state.userBranch} · {state.userYear}
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            state.darkMode ? 'bg-amber-900/30' : 'bg-amber-50'
          } border ${state.darkMode ? 'border-amber-800/30' : 'border-amber-200'}`}>
            <span className="text-lg">🪙</span>
            <span className={`font-bold text-lg ${state.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {state.points}
            </span>
          </div>
        </div>
      </div>

      <div className={`flex rounded-xl p-1 gap-1 ${state.darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {(['info', 'security', 'activity'] as ProfileTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                : `text-slate-500 ${state.darkMode ? 'hover:text-white' : 'hover:text-slate-700'}`
            }`}
          >
            {t === 'info' ? 'Personal Info' : t === 'security' ? 'Security' : 'Activity'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'info' && <PersonalInfoTab key="info" darkMode={state.darkMode} />}
        {tab === 'security' && <SecurityTab key="security" darkMode={state.darkMode} />}
        {tab === 'activity' && (
          <ActivityTab
            key="activity"
            attendanceStats={attendanceStats}
            rentalCount={rentalCount}
            darkMode={state.darkMode}
            points={state.points}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PersonalInfoTab({ darkMode }: { darkMode: boolean }) {
  const { state, updateProfile } = useApp()
  const [form, setForm] = useState({
    name: state.userName,
    department: state.userBranch,
    year: parseInt(state.userYear) || 1,
    phoneNumber: state.userPhone,
  })
  const [skills, setSkills] = useState<string[]>(state.userSkills)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setForm({ name: state.userName, department: state.userBranch, year: parseInt(state.userYear) || 1, phoneNumber: state.userPhone })
    setSkills(state.userSkills)
  }, [state.userName, state.userBranch, state.userYear, state.userPhone, state.userSkills])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({ ...form, skills })
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const addSkill = (s: string) => setSkills(prev => [...prev, s])
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s))

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border space-y-5`}>
      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Personal Information
      </h3>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="tel" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 43210" />
          </div>
        </div>
      </div>

      <SkillInput skills={skills} onAdd={addSkill} onRemove={removeSkill} darkMode={darkMode} />

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  )
}

function SecurityTab({ darkMode }: { darkMode: boolean }) {
  const { changePassword } = useApp()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const strength = getPasswordStrength(form.newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' })
      return
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setSaving(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <form onSubmit={handleSubmit} className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border space-y-5`}>
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-blue-500" />
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Change Password
          </h3>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 8 chars, uppercase, number" required />
          </div>
          {form.newPassword && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
              </div>
              <p className={`text-xs mt-1 ${strength.textColor}`}>{strength.label}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>

        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
          <Shield size={16} /> {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </motion.div>
  )
}

function ActivityTab({ attendanceStats, rentalCount, darkMode, points }: { attendanceStats: { total: number; present: number; percentage: number }; rentalCount: number; darkMode: boolean; points: number }) {
  const cards = [
    { icon: Award, label: 'Attendance Score', value: `${attendanceStats.percentage}%`, sub: `${attendanceStats.present}/${attendanceStats.total} classes`, color: 'from-blue-500 to-cyan-500' },
    { icon: Sparkles, label: 'Total Points Earned', value: `${points}`, sub: 'Available balance', color: 'from-amber-500 to-orange-500' },
    { icon: Monitor, label: 'Laptops Rented', value: `${rentalCount}`, sub: 'Total bookings', color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
        <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Account Activity & Stats
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map(card => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'} border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{card.sub}</p>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
