import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Heart, X as XIcon, Sparkles, Send, UserPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'

const AVAILABLE_SKILLS = ['React', 'Flutter', 'Firebase', 'Python', 'Node.js', 'TypeScript', 'C++', 'MongoDB', 'Docker', 'AWS', 'TensorFlow', 'CSS', 'JavaScript', 'Figma', 'Arduino']

export default function AIMatch() {
  const { state, addConnection, removeConnection, setActiveChat, sendMessage, fetchChatHistory, addSkill, removeSkill } = useApp()
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [connecting, setConnecting] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const activeProfile = state.matches.find(m => m.id === state.activeChat)

  const toggleConnection = async (id: string) => {
    if (state.connections.includes(id)) {
      removeConnection(id)
    } else {
      setConnecting(id)
      await addConnection(id)
      setConnecting(null)
    }
  }

  const openChat = async (id: string) => {
    if (!state.connections.includes(id)) {
      setConnecting(id)
      await addConnection(id)
      setConnecting(null)
    }
    setActiveChat(id)
    setShowChat(true)
    fetchChatHistory(id)
  }

  const handleSendMessage = () => {
    if (!chatInput.trim() || !state.activeChat) return
    sendMessage(state.activeChat, chatInput.trim())
    setChatInput('')
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.chatMessages])

  const handleAddSkill = () => {
    if (newSkill.trim() && !state.userSkills.includes(newSkill.trim()) && AVAILABLE_SKILLS.includes(newSkill.trim())) {
      addSkill(newSkill.trim())
      setNewSkill('')
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'from-secondary to-emerald-400'
    if (score >= 80) return 'from-primary to-blue-400'
    if (score >= 70) return 'from-amber-400 to-amber-500'
    return 'from-slate-400 to-slate-500'
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-display font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>AI Teammate Matcher</h2>
            <p className="text-slate-500 text-sm mt-0.5">Find your perfect project partner</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${state.darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'} border border-purple-200 dark:border-purple-800`}>
            <Sparkles size={14} className="inline mr-1" />AI Powered
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`rounded-2xl p-5 border ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold text-sm ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Your Skills</h3>
          <button onClick={() => setShowSkillPicker(!showSkillPicker)}
            className={`text-xs px-3 py-1 rounded-full font-medium ${state.darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}
          >+ Edit</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.userSkills.map(skill => (
            <span key={skill} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${state.darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
            </span>
          ))}
        </div>
        <AnimatePresence>
          {showSkillPicker && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
              <div className="flex gap-2 mb-3">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Type a skill..."
                  className={`flex-1 p-2 rounded-xl text-sm border ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
                <button onClick={handleAddSkill} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SKILLS.filter(s => !state.userSkills.includes(s)).map(skill => (
                  <button key={skill} onClick={() => { addSkill(skill); setNewSkill('') }}
                    className="px-2 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >+{skill}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {state.connections.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`rounded-2xl p-4 border ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-secondary" />
            <h3 className={`text-sm font-semibold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>Connected ({state.connections.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.connections.map(id => {
              const profile = state.matches.find(m => m.id === id)
              if (!profile) return null
              return (
                <button key={id} onClick={() => openChat(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${state.darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-all`}
                ><span>{profile.image}</span>{profile.name}</button>
              )
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {state.matches.map((profile, index) => {
            const isConnected = state.connections.includes(profile.id)
            return (
              <motion.div key={profile.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                className={`rounded-2xl overflow-hidden border transition-all ${state.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-2xl">{profile.image}</div>
                      <div>
                        <h3 className={`font-bold ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h3>
                        <p className="text-xs text-slate-500">{profile.branch} · {profile.year} Year</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCompatibilityColor(profile.compatibility)} text-white`}>
                      {profile.compatibility}% ⚡
                    </div>
                  </div>
                  <p className={`text-sm ${state.darkMode ? 'text-slate-400' : 'text-slate-600'} mb-3 line-clamp-2`}>{profile.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.skills.map(skill => (
                      <span key={skill}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                          state.userSkills.includes(skill)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : state.darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}
                      >{skill}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => openChat(profile.id)}
                          className="flex-1 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
                        ><MessageCircle size={16} />Chat</motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => toggleConnection(profile.id)}
                          className={`px-4 py-2.5 rounded-xl text-sm border ${state.darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        ><XIcon size={16} /></motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => toggleConnection(profile.id)}
                          disabled={connecting === profile.id}
                          className="flex-1 py-2.5 bg-gradient-to-r from-secondary to-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                        ><Heart size={16} />{connecting === profile.id ? 'Connecting...' : 'Connect'}</motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className={`px-4 py-2.5 rounded-xl text-sm border ${state.darkMode ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'}`}
                        ><XIcon size={16} /></motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showChat && state.activeChat && activeProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 400, opacity: 0 }}
              className={`relative w-full md:max-w-md md:rounded-3xl rounded-t-3xl h-[70vh] md:h-auto md:max-h-[600px] flex flex-col ${state.darkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className={`flex items-center justify-between px-5 py-4 border-b ${state.darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-lg">{activeProfile.image}</div>
                  <div>
                    <h3 className={`font-semibold text-sm ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>{activeProfile.name}</h3>
                    <p className="text-xs text-slate-500">{activeProfile.branch} · {activeProfile.year}</p>
                  </div>
                </div>
                <button onClick={() => { setShowChat(false); setActiveChat(null) }}
                  className={`p-2 rounded-xl ${state.darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                ><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(state.chatMessages[state.activeChat] || []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'You' ? 'bg-primary text-white rounded-br-md'
                      : msg.sender === 'System' ? state.darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      : state.darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                    }`}>
                      {msg.sender !== 'You' && msg.sender !== 'System' && <p className="text-[10px] font-semibold text-primary mb-0.5">{msg.sender}</p>}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'You' ? 'text-white/70' : 'text-slate-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className={`p-4 border-t ${state.darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className={`flex-1 p-3 rounded-xl text-sm border ${state.darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl"
                  ><Send size={18} /></motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
