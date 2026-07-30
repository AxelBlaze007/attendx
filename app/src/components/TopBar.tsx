import {
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

interface TopBarProps {
  onNavigateProfile?: () => void
}

export default function TopBar({ onNavigateProfile }: TopBarProps) {
  const { state, toggleDarkMode, clearNotification, logout } = useApp()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${
      state.darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
    } backdrop-blur-lg border-b`}>
      <div className="flex items-center justify-between px-4 md:px-8 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            AX
          </div>
          <div>
            <h1 className={`font-display font-bold text-lg ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              Attend<span className="text-primary">X</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateProfile}
            className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full transition-colors ${
              state.darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {state.userAvatar ? (
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-base bg-gradient-to-br from-amber-400 to-amber-600">
                {state.userAvatar}
              </span>
            ) : (
              <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {getInitials(state.userName)}
              </div>
            )}
            <div>
              <p className={`text-sm font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
                {state.userName}
              </p>
              <p className="text-xs text-slate-500">{state.userBranch} · {state.userYear}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            state.darkMode ? 'bg-slate-800' : 'bg-amber-50'
          } border ${state.darkMode ? 'border-slate-700' : 'border-amber-200'}`}>
            <span className="text-sm">🪙</span>
            <span className={`font-bold text-sm ${state.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {state.points}
            </span>
          </div>

          <button
            onClick={clearNotification}
            className={`relative p-2 rounded-xl transition-colors ${
              state.darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Bell size={20} />
            {state.notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {state.notifications}
              </span>
            )}
          </button>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl transition-colors ${
              state.darkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={logout}
            className={`p-2 rounded-xl transition-colors ${
              state.darkMode ? 'hover:bg-slate-800 text-red-400' : 'hover:bg-red-50 text-red-500'
            }`}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
