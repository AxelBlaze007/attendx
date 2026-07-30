import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Monitor, Bot, Calendar, QrCode, X, ScanLine, Camera, CheckCircle, Clock, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'

const quickActions = [
  { label: 'Rewards Store', icon: Gift, view: 'rewards', color: 'from-amber-400 to-amber-600', desc: 'Redeem points' },
  { label: 'Laptop Rental', icon: Monitor, view: 'rental', color: 'from-blue-400 to-blue-600', desc: 'Book devices' },
  { label: 'AI Matcher', icon: Bot, view: 'aimatch', color: 'from-purple-400 to-purple-600', desc: 'Find teammates' },
  { label: 'Attendance', icon: Calendar, view: 'dashboard', color: 'from-emerald-400 to-emerald-600', desc: 'View logs' },
]

const todayClasses = [
  { id: 1, name: 'Math 101', time: '10:00 AM', room: 'Hall A', prof: 'Dr. Sharma' },
  { id: 2, name: 'Data Structures', time: '11:30 AM', room: 'Lab 301', prof: 'Prof. Verma' },
  { id: 3, name: 'Computer Networks', time: '2:00 PM', room: 'Room 204', prof: 'Dr. Gupta' },
]

export default function Dashboard() {
  const { state, markAttendance } = useApp()
  const [showQR, setShowQR] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    setScanning(true)
    try {
      await markAttendance({ subjectName: 'Math 101', roomNo: 'Hall A', qrPayload: 'ATTENDX_VALID_CLASS_QR' })
      setScanned(true)
      setTimeout(() => {
        setShowQR(false)
        setScanned(false)
      }, 2000)
    } catch {
      setScanned(false)
    } finally {
      setScanning(false)
    }
  }

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (state.attendancePercent / 100) * circumference

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-display font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              Hey, {state.userName} 👋
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">{state.userBranch} · {state.userYear}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            state.darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
          } border border-primary/20`}>
            ✨ {state.userSubscription}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl p-6 ${
          state.darkMode ? 'bg-slate-800' : 'bg-white'
        } border ${state.darkMode ? 'border-slate-700' : 'border-slate-200'}`}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke={state.darkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54"
                fill="none" stroke="url(#grad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
                {state.attendancePercent}%
              </span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              state.darkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-600'
            } mb-3`}>
              🪙 {state.points} Points Available
            </div>
            <p className={`text-lg font-semibold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              Attended {state.attendedClasses}/{state.totalClasses} classes
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {state.totalClasses - state.attendedClasses} more to unlock a free Canteen Voucher!
            </p>
            <div className={`h-2 rounded-full mt-3 ${state.darkMode ? 'bg-slate-700' : 'bg-slate-200'} max-w-xs`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${state.attendancePercent}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-2xl text-left transition-all ${
                  state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                } border hover:shadow-lg`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <p className={`font-semibold text-sm ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`rounded-2xl p-5 ${
          state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        } border`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <h3 className={`font-semibold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Today's Schedule</h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            state.darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
          }`}>
            {todayClasses.length} classes
          </span>
        </div>
        <div className="space-y-3">
          {todayClasses.map((cls) => (
            <div
              key={cls.id}
              className={`flex items-center gap-4 p-3 rounded-xl ${
                state.darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
              } border-b ${state.darkMode ? 'border-slate-700' : 'border-slate-100'} last:border-b-0`}
            >
              <div className={`w-2 h-2 rounded-full ${cls.id === 1 ? 'bg-primary' : cls.id === 2 ? 'bg-secondary' : 'bg-amber-400'}`} />
              <div className="flex-1">
                <p className={`font-medium text-sm ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{cls.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {cls.time}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {cls.room}</span>
                  <span className="text-xs text-slate-500">{cls.prof}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQR(true)}
          className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
        >
          <QrCode size={20} />
          Scan Class QR · +2 Points
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-3xl p-6 ${state.darkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <button
                onClick={() => { setShowQR(false); setScanned(false) }}
                className={`absolute top-4 right-4 p-2 rounded-xl ${state.darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center ${scanned ? '' : 'animate-pulse'}`}>
                  <ScanLine size={28} className="text-white" />
                </div>
                <h3 className={`text-lg font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {scanned ? 'Attendance Marked! ✅' : 'Scan Class QR Code'}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {scanned ? 'You earned +2 points' : 'Point your camera at the QR code displayed by your professor'}
                </p>
              </div>

              {!scanned ? (
                <div className="mt-6">
                  <div className={`aspect-square max-w-[200px] mx-auto rounded-2xl p-4 ${state.darkMode ? 'bg-white' : 'bg-slate-100'} flex items-center justify-center`}>
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                      <Camera size={48} className="text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2">Camera preview simulation</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScan}
                    disabled={scanning}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {scanning ? 'Scanning...' : 'Tap to Scan ✅'}
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={24} className="text-secondary" />
                    <div className="text-left">
                      <p className="font-semibold text-secondary">Math 101 - 10:00 AM</p>
                      <p className="text-xs text-slate-500">Scanned successfully</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
