import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from './context/AppContext'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Rewards from './pages/Rewards'
import Rental from './pages/Rental'
import AIMatch from './pages/AIMatch'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRewards from './pages/admin/AdminRewards'
import AdminLaptops from './pages/admin/AdminLaptops'
import AdminAttendance from './pages/admin/AdminAttendance'
import AdminBookings from './pages/admin/AdminBookings'
import AdminTeammates from './pages/admin/AdminTeammates'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import { LogIn, UserPlus, Mail, Lock, User, GraduationCap, Hash, Shield } from 'lucide-react'

export type ViewType = 'dashboard' | 'rewards' | 'rental' | 'aimatch' | 'profile'
export type AdminViewType = 'admin-dashboard' | 'admin-users' | 'admin-rewards' | 'admin-laptops' | 'admin-attendance' | 'admin-bookings' | 'admin-teammates'

function LoginView({ onSwitch, onAdmin, onForgotPassword }: { onSwitch: () => void; onAdmin: () => void; onForgotPassword: () => void }) {
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">AX</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome to AttendX</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@college.edu" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" required />
            </div>
          </div>
          <div className="text-right">
            <button type="button" onClick={onForgotPassword} className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium">
              Forgot Password?
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <LogIn className="w-4 h-4" /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline font-medium">Register</button>
          </p>
          <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onAdmin} className="text-xs text-purple-500 hover:text-purple-700 hover:underline font-medium flex items-center justify-center gap-1 mx-auto">
              <Shield size={12} /> Admin Login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function AdminLoginView({ onBack }: { onBack: () => void }) {
  const { login } = useApp()
  const [email, setEmail] = useState('admin@attendx.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in with admin credentials</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm space-y-4 border-2 border-purple-200 dark:border-purple-800">
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="admin@attendx.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <Shield className="w-4 h-4" /> {loading ? 'Signing in...' : 'Admin Sign In'}
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            <button type="button" onClick={onBack} className="text-purple-600 hover:underline font-medium">← Back to Student Login</button>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

function RegisterView({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useApp()
  const [form, setForm] = useState({ email: '', password: '', name: '', department: '', year: 1 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">AX</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Join AttendX</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Create your student account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">College Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@college.edu" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 6 characters" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. CSE" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <UserPlus className="w-4 h-4" /> {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline font-medium">Sign In</button>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

const adminNavItems: { id: AdminViewType; label: string }[] = [
  { id: 'admin-dashboard', label: 'Dashboard' },
  { id: 'admin-users', label: 'Users' },
  { id: 'admin-rewards', label: 'Rewards' },
  { id: 'admin-laptops', label: 'Laptops' },
  { id: 'admin-attendance', label: 'Attendance' },
  { id: 'admin-bookings', label: 'Bookings' },
  { id: 'admin-teammates', label: 'Teammates' },
]

export default function App() {
  const { state, logout } = useApp()
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [adminView, setAdminView] = useState<AdminViewType>('admin-dashboard')
  const [authView, setAuthView] = useState<'login' | 'register' | 'admin-login' | 'forgot-password'>('login')

  const isAdmin = state.userRole === 'ADMIN'

  if (!state.isAuthenticated) {
    if (authView === 'forgot-password') return <ForgotPassword onBack={() => setAuthView('login')} />
    if (authView === 'login') return <LoginView onSwitch={() => setAuthView('register')} onAdmin={() => setAuthView('admin-login')} onForgotPassword={() => setAuthView('forgot-password')} />
    if (authView === 'admin-login') return <AdminLoginView onBack={() => setAuthView('login')} />
    return <RegisterView onSwitch={() => setAuthView('login')} />
  }

  if (isAdmin) {
    return (
      <div className={`min-h-screen ${state.darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
        <header className={`fixed top-0 left-0 right-0 z-50 ${
          state.darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
        } backdrop-blur-lg border-b`}>
          <div className="flex items-center justify-between px-4 md:px-8 h-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">AX</div>
              <div>
                <h1 className={`font-display font-bold text-lg ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Attend<span className="text-purple-600">X</span> <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Admin</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${state.darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <span className="text-sm text-slate-500">{state.userName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Admin</span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
              >Logout</button>
            </div>
          </div>
        </header>

        <div className="flex pt-16">
          <aside className={`hidden md:flex fixed left-0 top-16 bottom-0 z-40 w-56 flex-col ${
            state.darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
          } backdrop-blur-lg border-r`}>
            <div className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {adminNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setAdminView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm ${
                    adminView === item.id
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : state.darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >{item.label}</button>
              ))}
            </div>
          </aside>

          <main className="flex-1 pb-24 md:pb-8 md:ml-56 px-4 md:px-8 max-w-7xl mx-auto w-full pt-6">
            <AnimatePresence mode="wait">
              <motion.div key={adminView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                {adminView === 'admin-dashboard' && <AdminDashboard />}
                {adminView === 'admin-users' && <AdminUsers />}
                {adminView === 'admin-rewards' && <AdminRewards />}
                {adminView === 'admin-laptops' && <AdminLaptops />}
                {adminView === 'admin-attendance' && <AdminAttendance />}
                {adminView === 'admin-bookings' && <AdminBookings />}
                {adminView === 'admin-teammates' && <AdminTeammates />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-around h-14 overflow-x-auto px-2 gap-1">
            {adminNavItems.slice(0, 5).map(item => (
              <button
                key={item.id}
                onClick={() => setAdminView(item.id)}
                className={`text-[10px] px-2 py-1 rounded-lg whitespace-nowrap transition-all ${
                  adminView === item.id ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-slate-400'
                }`}
              >{item.label}</button>
            ))}
          </div>
        </nav>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />
      case 'rewards': return <Rewards />
      case 'rental': return <Rental />
      case 'aimatch': return <AIMatch />
      case 'profile': return <Profile />
    }
  }

  return (
    <div className={`min-h-screen ${state.darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <TopBar onNavigateProfile={() => setActiveView('profile')} />
      <div className="flex">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 pt-20 pb-24 md:pb-8 md:ml-64 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <div key={activeView}>
              {renderView()}
            </div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}
