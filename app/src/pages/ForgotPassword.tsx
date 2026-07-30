import { useState, useRef, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react'
import { authService } from '../services/authService'

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5' }
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/5' }
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/5' }
  if (score <= 4) return { label: 'Strong', color: 'bg-lime-500', width: 'w-4/5' }
  return { label: 'Very Strong', color: 'bg-green-500', width: 'w-full' }
}

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setStep(2)
      setSuccess('Reset code sent to your email (check console in dev mode)')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(email, otpValue, newPassword)
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => onBack(), 2000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(newPassword)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {step === 1
              ? 'Enter your email to receive a reset code'
              : 'Enter the code and your new password'}
          </p>
        </div>

        {success && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@college.edu"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                <button type="button" onClick={onBack} className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">
                  Enter 6-digit code sent to <span className="font-semibold">{email}</span>
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min 8 chars, uppercase, number"
                      required
                    />
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                      </div>
                      <p className={`text-xs mt-1 ${strength.color.replace('bg-', 'text-')}`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => setStep(1)} className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Change email
                </button>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
