import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Timer, QrCode, Ticket } from 'lucide-react'
import { useApp } from '../context/AppContext'

type FilterType = 'all' | 'canteen' | 'stationery' | 'printing'

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'canteen', label: 'Canteen 🍔' },
  { id: 'stationery', label: 'Stationery 📝' },
  { id: 'printing', label: 'Printing 🖨️' },
]

export default function Rewards() {
  const { state, redeemReward, clearClaimedReward } = useApp()
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedReward, setSelectedReward] = useState<string | null>(null)
  const [redeemed, setRedeemed] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [countdown, setCountdown] = useState(900)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filteredRewards = filter === 'all'
    ? state.rewards
    : state.rewards.filter(r => r.category === filter)

  useEffect(() => {
    if (state.claimedReward) {
      setCountdown(900)
      setRedeemed(true)
      setSelectedReward('claimed')
    }
  }, [state.claimedReward])

  useEffect(() => {
    if (redeemed && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [redeemed, countdown])

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(true)
    setSelectedReward(rewardId)
    const ok = await redeemReward(rewardId)
    setRedeeming(false)
    if (!ok) {
      setSelectedReward(null)
    }
  }

  const closeModal = () => {
    setSelectedReward(null)
    setRedeemed(false)
    clearClaimedReward()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-display font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              Rewards Store
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Redeem your attendance points</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-slate-800 rounded-full border border-amber-200 dark:border-slate-700">
            <span className="text-lg">🪙</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{state.points} Available</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-primary text-white shadow-md'
                : state.darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >{f.label}</button>
        ))}
      </motion.div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRewards.map((reward) => {
            const canAfford = state.points >= reward.cost
            return (
              <motion.div key={reward.id} layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`rounded-2xl overflow-hidden border transition-all ${
                  state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                } ${canAfford ? 'hover:shadow-lg' : 'opacity-60'}`}
              >
                <div className={`h-32 flex items-center justify-center text-5xl ${state.darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  {reward.image}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      reward.category === 'canteen' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                      reward.category === 'stationery' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>{reward.category}</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">🪙 {reward.cost}</span>
                  </div>
                  <h3 className={`font-semibold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{reward.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{reward.description}</p>
                  <motion.button
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                    onClick={() => canAfford && handleRedeem(reward.id)}
                    disabled={!canAfford || redeeming}
                    className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-primary to-blue-500 text-white hover:shadow-md'
                        : state.darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {redeeming && selectedReward === reward.id ? 'Redeeming...' : canAfford ? 'Redeem Now' : `Need ${reward.cost - state.points} more 🪙`}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {(redeemed && state.claimedReward) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div initial={{ scale: 0.8, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 40 }}
              className={`relative w-full max-w-sm rounded-3xl p-6 ${state.darkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <button onClick={closeModal}
                className={`absolute top-4 right-4 p-2 rounded-xl ${state.darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              ><X size={20} /></button>

              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-emerald-400 flex items-center justify-center"
                ><CheckCircle size={32} className="text-white" /></motion.div>
                <h3 className={`text-xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Redemption Successful! 🎉</h3>
                <p className="text-sm text-slate-500 mt-2">{state.claimedReward.itemTitle}</p>
              </div>

              <div className={`mt-6 rounded-2xl p-4 ${state.darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
                    <QrCode size={80} className="text-slate-900" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Ticket size={16} className="text-primary" />
                    <span className={`text-sm font-mono font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {state.claimedReward.qrVoucherCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Timer size={14} className="text-red-500" />
                    <span className="text-sm font-mono text-red-500 font-bold">{formatTime(countdown)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Show this QR at the counter within 15 minutes</p>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                className="mt-4 w-full py-3 bg-gradient-to-r from-secondary to-emerald-500 text-white font-semibold rounded-xl"
              >Done</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
