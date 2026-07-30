import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Upload } from 'lucide-react'
import { useApp } from '../context/AppContext'

const presetAvatars = [
  '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🦄', '🐧',
  '🐙', '🦋', '🐝', '🦉', '🐳', '🦖', '🐲', '🦩',
]

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarUpload({ size = 'md' }: AvatarUploadProps) {
  const { state, updateAvatar } = useApp()
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
  }

  const handlePresetSelect = async (emoji: string) => {
    setUploading(true)
    try {
      await updateAvatar(emoji)
      setOpen(false)
    } catch { /* ignore */ } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large (max 2MB)')
      return
    }
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        await updateAvatar(base64)
        setOpen(false)
      }
      reader.readAsDataURL(file)
    } catch { /* ignore */ } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden group shrink-0 ${
          state.darkMode ? 'bg-slate-700' : 'bg-slate-200'
        }`}
      >
        {state.userAvatar ? (
          <span className="w-full h-full flex items-center justify-center text-2xl">
            {state.userAvatar}
          </span>
        ) : (
          <span className="w-full h-full flex items-center justify-center font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(state.userName)}
          </span>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Camera size={size === 'sm' ? 12 : 20} className="text-white" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
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
              className={`relative w-full max-w-md rounded-3xl p-6 ${state.darkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <button
                onClick={() => setOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-xl ${state.darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X size={20} />
              </button>

              <h3 className={`text-lg font-bold mb-4 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
                Choose Avatar
              </h3>

              <div className="mb-6">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Preset Avatars
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {presetAvatars.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handlePresetSelect(emoji)}
                      disabled={uploading}
                      className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all ${
                        state.userAvatar === emoji
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-110'
                          : state.darkMode
                            ? 'hover:bg-slate-700 bg-slate-700/50'
                            : 'hover:bg-slate-100 bg-slate-50'
                      } disabled:opacity-50`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${state.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Custom Upload
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all ${
                    state.darkMode
                      ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400'
                      : 'border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600'
                  } disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
