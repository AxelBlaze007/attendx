import { LayoutDashboard, Gift, Monitor, Bot, Sparkles, UserCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ViewType } from '../App'

const navItems: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rewards', label: 'Rewards Store', icon: Gift },
  { id: 'rental', label: 'Device Rental', icon: Monitor },
  { id: 'aimatch', label: 'AI Matcher', icon: Bot },
  { id: 'profile', label: 'Profile', icon: UserCircle },
]

export default function Sidebar({
  activeView,
  onNavigate,
}: {
  activeView: ViewType
  onNavigate: (v: ViewType) => void
}) {
  const { state } = useApp()

  return (
    <aside className={`hidden md:flex fixed left-0 top-16 bottom-0 z-40 w-64 flex-col ${
      state.darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
    } backdrop-blur-lg border-r`}>
      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : state.darkMode
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <Sparkles size={14} className="ml-auto text-primary" />
              )}
            </button>
          )
        })}
      </div>

      <div className={`p-4 mx-3 mb-4 rounded-2xl ${
        state.darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-lg">
            🪙
          </div>
          <div>
            <p className={`text-xs ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Available Points</p>
            <p className={`text-lg font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{state.points}</p>
          </div>
        </div>
        <div className={`h-2 rounded-full ${state.darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
            style={{ width: `${Math.min(100, (state.points / 100) * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  )
}
