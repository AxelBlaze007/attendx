import { LayoutDashboard, Gift, Monitor, Bot, UserCircle } from 'lucide-react'
import type { ViewType } from '../App'

const navItems: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'rental', label: 'Rentals', icon: Monitor },
  { id: 'aimatch', label: 'AI Match', icon: Bot },
  { id: 'profile', label: 'Profile', icon: UserCircle },
]

export default function BottomNav({
  activeView,
  onNavigate,
}: {
  activeView: ViewType
  onNavigate: (v: ViewType) => void
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon size={22} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
