import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, X, CheckCircle, Clock, MapPin, CreditCard } from 'lucide-react'
import { useApp } from '../context/AppContext'

type Duration = 'hourly' | 'halfday' | 'fullday'

const durations: { id: Duration; label: string; multiplier: number }[] = [
  { id: 'hourly', label: 'Hourly', multiplier: 1 },
  { id: 'halfday', label: 'Half-Day', multiplier: 4 },
  { id: 'fullday', label: 'Full-Day', multiplier: 8 },
]

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

function toIsoSlot(slot: string, dateStr: string = new Date().toISOString().split('T')[0]) {
  const [h, m] = slot.match(/(\d+):(\d+)/)!.slice(1).map(Number)
  const isPM = slot.includes('PM')
  const hours = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h
  return `${dateStr}T${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`
}

export default function Rental() {
  const { state, bookLaptop, clearBookingResult } = useApp()
  const [duration, setDuration] = useState<Duration>('hourly')
  const [selectedLaptop, setSelectedLaptop] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM')
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'success'>('details')
  const [processing, setProcessing] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    if (state.bookingResult) {
      setCheckoutStep('success')
      setProcessing(false)
    }
  }, [state.bookingResult])

  const handleBook = (laptopId: string) => {
    setSelectedLaptop(laptopId)
    setCheckoutStep('details')
    setBookingError('')
  }

  const handlePayment = async () => {
    setProcessing(true)
    setBookingError('')
    try {
      const durMap: Record<string, string> = { hourly: 'HOURLY', halfday: 'HALF_DAY', fullday: 'FULL_DAY' }
      await bookLaptop({
        laptopId: selectedLaptop!,
        duration: durMap[duration],
        startTime: toIsoSlot(selectedSlot),
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed'
      setBookingError(msg)
      setProcessing(false)
    }
  }

  const closeModal = () => {
    setSelectedLaptop(null)
    setCheckoutStep('details')
    clearBookingResult()
    setBookingError('')
  }

  const laptop = state.laptops.find(l => l.id === selectedLaptop)
  const dur = durations.find(d => d.id === duration)
  const totalCost = laptop ? laptop.hourlyRate * (dur?.multiplier || 1) : 0

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-display font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Device Rental</h2>
            <p className="text-slate-500 text-sm mt-0.5">Laptops & desktops available on campus</p>
          </div>
          {state.rentals.length > 0 && (
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${state.darkMode ? 'bg-secondary/20 text-secondary' : 'bg-secondary/10 text-secondary'} border border-secondary/20`}>
              {state.rentals.length} Active Rentals
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2">
        {durations.map(d => (
          <button key={d.id} onClick={() => setDuration(d.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              duration === d.id
                ? 'bg-primary text-white shadow-md'
                : state.darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >{d.label}</button>
        ))}
      </motion.div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {state.laptops.map((laptop) => (
            <motion.div key={laptop.id} layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl overflow-hidden border transition-all ${
                state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              } ${laptop.available ? 'hover:shadow-lg' : 'opacity-50'}`}
            >
              <div className={`h-32 flex items-center justify-center ${state.darkMode ? 'bg-slate-700' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
                <Monitor size={48} className={laptop.available ? 'text-primary' : 'text-slate-400'} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    laptop.available
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${laptop.available ? 'bg-green-500' : 'bg-red-500'}`} />
                    {laptop.available ? 'Available' : 'Booked'}
                  </span>
                  <span className="text-sm font-bold text-primary">₹{laptop.hourlyRate * (dur?.multiplier || 1)} / {dur?.label.toLowerCase()}</span>
                </div>
                <h3 className={`font-semibold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{laptop.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{laptop.specs}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500"><MapPin size={12} /> {laptop.location}</div>
                {laptop.available && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleBook(laptop.id)}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
                  >Book Device</motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedLaptop && laptop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div initial={{ scale: 0.8, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 40 }}
              className={`relative w-full max-w-sm rounded-3xl p-6 ${state.darkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <button onClick={closeModal}
                className={`absolute top-4 right-4 p-2 rounded-xl ${state.darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              ><X size={20} /></button>

              {checkoutStep === 'details' && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><Monitor size={24} className="text-primary" /></div>
                    <div>
                      <h3 className={`font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{laptop.name}</h3>
                      <p className="text-xs text-slate-500">{laptop.specs}</p>
                    </div>
                  </div>
                  {bookingError && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4">{bookingError}</div>}
                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium mb-1.5 block ${state.darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select Time Slot</label>
                      <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}
                        className={`w-full p-3 rounded-xl text-sm border ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      >
                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                    <div className={`rounded-xl p-4 ${state.darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Duration</span>
                        <span className={state.darkMode ? 'text-white' : 'text-slate-900'}>{dur?.label}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Rate</span>
                        <span className={state.darkMode ? 'text-white' : 'text-slate-900'}>₹{laptop.hourlyRate}/hr × {dur?.multiplier}hrs</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-600">
                        <span>Total</span>
                        <span className="text-primary">₹{totalCost}</span>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handlePayment}
                      disabled={processing}
                      className="w-full py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard size={18} />
                      {processing ? 'Booking...' : 'Book & Proceed to Payment'}
                    </motion.button>
                  </div>
                </>
              )}

              {checkoutStep === 'payment' && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <CreditCard size={28} className="text-white" />
                  </div>
                  <h3 className={`text-lg font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Processing Booking</h3>
                  <p className="text-sm text-slate-500 mt-2">Please wait...</p>
                  <div className="mt-6 flex justify-center">
                    <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && state.bookingResult && (
                <div className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-emerald-400 flex items-center justify-center"
                  ><CheckCircle size={32} className="text-white" /></motion.div>
                  <h3 className={`text-xl font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Booking Confirmed! 🎉</h3>
                  <p className="text-sm text-slate-500 mt-2">{laptop.name} · {selectedSlot}</p>

                  <div className={`mt-6 rounded-2xl p-4 ${state.darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-28 h-28 bg-white rounded-xl p-2 flex items-center justify-center">
                        <img src={state.bookingResult.pickupQrCode} alt="QR" className="w-full h-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <MapPin size={16} className="text-primary" />
                      <span className={`font-medium ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Collect from {laptop.location}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-sm">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-slate-500">Gate Pass valid for pickup</span>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-secondary to-emerald-500 text-white font-semibold rounded-xl"
                  >Done</motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
