import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { attendanceService } from '../services/attendanceService'
import { rewardsService } from '../services/rewardsService'
import { rentalService } from '../services/rentalService'
import { teammateService } from '../services/teammateService'

export interface RewardItem {
  id: string
  title: string
  category: 'canteen' | 'stationery' | 'printing'
  cost: number
  image: string
  description: string
}

export interface LaptopItem {
  id: string
  name: string
  specs: string
  location: string
  hourlyRate: number
  available: boolean
}

export interface MatchProfile {
  id: string
  name: string
  branch: string
  year: string
  bio: string
  skills: string[]
  compatibility: number
  image: string
}

export interface Message {
  id: string
  sender: string
  text: string
  time: string
}

interface AppState {
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  userName: string
  userEmail: string
  userAvatar: string
  userPhone: string
  userBranch: string
  userYear: string
  userSubscription: string
  userRole: string
  attendancePercent: number
  attendedClasses: number
  totalClasses: number
  points: number
  darkMode: boolean
  notifications: number
  userSkills: string[]
  rewards: RewardItem[]
  laptops: LaptopItem[]
  matches: MatchProfile[]
  connections: string[]
  chatMessages: Record<string, Message[]>
  activeChat: string | null
  rentals: string[]
  claimedReward: { qrVoucherCode: string; expiresAt: string; itemTitle: string } | null
  bookingResult: { bookingId: string; totalAmount: number; pickupQrCode: string; startTime: string; endTime: string } | null
}

interface AppContextType {
  state: AppState
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string; department: string; year: number }) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: { name?: string; department?: string; year?: number; phoneNumber?: string; skills?: string[]; interests?: string[] }) => Promise<void>
  updateAvatar: (avatarUrl: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  fetchRewards: (category?: string) => Promise<void>
  fetchLaptops: () => Promise<void>
  fetchMatches: () => Promise<void>
  fetchAttendanceHistory: () => Promise<void>
  markAttendance: (data: { subjectName: string; roomNo: string; qrPayload: string }) => Promise<{ pointsEarned: number }>
  redeemReward: (rewardItemId: string) => Promise<boolean>
  bookLaptop: (data: { laptopId: string; duration: string; startTime: string }) => Promise<void>
  verifyPayment: (data: { bookingId: string; razorpayPaymentId: string; razorpaySignature: string }) => Promise<void>
  addConnection: (receiverId: string) => Promise<void>
  fetchChatHistory: (receiverId: string) => Promise<void>
  sendMessage: (chatId: string, text: string) => void
  setActiveChat: (id: string | null) => void
  removeConnection: (id: string) => void
  toggleDarkMode: () => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  clearNotification: () => void
  clearClaimedReward: () => void
  clearBookingResult: () => void
}

const initialState: AppState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  userName: '',
  userEmail: '',
  userAvatar: '',
  userPhone: '',
  userBranch: '',
  userYear: '',
  userSubscription: 'ACTIVE',
  userRole: 'STUDENT',
  attendancePercent: 0,
  attendedClasses: 0,
  totalClasses: 0,
  points: 0,
  darkMode: false,
  notifications: 0,
  userSkills: [],
  rewards: [],
  laptops: [],
  matches: [],
  connections: [],
  chatMessages: {},
  activeChat: null,
  rentals: [],
  claimedReward: null,
  bookingResult: null,
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  const set = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      token,
      isAuthenticated: true,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatarUrl || '',
      userPhone: user.phoneNumber || '',
      userBranch: user.department,
      userYear: `${user.year}`,
      points: user.pointsBalance,
      userSubscription: user.subscriptionStatus,
      userRole: user.role,
      userSkills: user.skills || [],
    })
  }, [set])

  const register = useCallback(async (data: { email: string; password: string; name: string; department: string; year: number }) => {
    const res = await authService.register(data)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      token,
      isAuthenticated: true,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatarUrl || '',
      userPhone: user.phoneNumber || '',
      userBranch: user.department,
      userYear: `${user.year}`,
      points: user.pointsBalance,
      userSubscription: user.subscriptionStatus,
      userRole: user.role,
      userSkills: user.skills || [],
    })
  }, [set])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({
      token: null,
      isAuthenticated: false,
      loading: false,
      userName: '',
      userEmail: '',
      userAvatar: '',
      userPhone: '',
      userBranch: '',
      userYear: '',
      userSubscription: 'ACTIVE',
      userRole: 'STUDENT',
      attendancePercent: 0,
      attendedClasses: 0,
      totalClasses: 0,
      points: 0,
      darkMode: false,
      notifications: 0,
      userSkills: [],
      rewards: [],
      laptops: [],
      matches: [],
      connections: [],
      chatMessages: {},
      activeChat: null,
      rentals: [],
      claimedReward: null,
      bookingResult: null,
    })
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile()
      const user = res.data
      set({
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatarUrl || '',
        userPhone: user.phoneNumber || '',
        userBranch: user.department,
        userYear: `${user.year}`,
        points: user.pointsBalance,
        userSubscription: user.subscriptionStatus,
        userRole: user.role,
        userSkills: user.skills || [],
      })
    } catch { /* ignore */ }
  }, [set])

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const res = await attendanceService.getHistory()
      const { summary } = res.data
      set({
        attendedClasses: summary.presentDays,
        totalClasses: summary.total,
        attendancePercent: summary.percentage,
        notifications: summary.total > 0 ? 1 : 0,
      })
    } catch { /* ignore */ }
  }, [set])

  const fetchRewards = useCallback(async (category?: string) => {
    try {
      const res = await rewardsService.getItems(category)
      const items = res.data.map((item: { id: string; title: string; category: string; pointCost: number; imageUrl: string | null }) => ({
        id: item.id,
        title: item.title,
        category: item.category.toLowerCase(),
        cost: item.pointCost,
        image: item.imageUrl || '🎁',
        description: item.title,
      }))
      set({ rewards: items })
    } catch { /* ignore */ }
  }, [set])

  const fetchLaptops = useCallback(async () => {
    try {
      const res = await rentalService.getAvailableLaptops()
      const items = res.data.map((item: { id: string; modelName: string; specs: string; labLocation: string; hourlyRate: number; status: string }) => ({
        id: item.id,
        name: item.modelName,
        specs: item.specs,
        location: item.labLocation,
        hourlyRate: item.hourlyRate,
        available: item.status === 'AVAILABLE',
      }))
      set({ laptops: items })
    } catch { /* ignore */ }
  }, [set])

  const fetchMatches = useCallback(async () => {
    try {
      const res = await teammateService.getMatches()
      const items = res.data.map((m: { id: string; name: string; department: string; year: number; matchPercentage: number; skills: string[]; interests: string[] }) => ({
        id: m.id,
        name: m.name,
        branch: m.department,
        year: `${m.year}`,
        bio: `Skills: ${m.skills.join(', ')}`,
        skills: m.skills,
        compatibility: Math.round(m.matchPercentage),
        image: '👤',
      }))
      set({ matches: items })
    } catch { /* ignore */ }
  }, [set])

  const markAttendance = useCallback(async (data: { subjectName: string; roomNo: string; qrPayload: string }) => {
    const res = await attendanceService.markAttendance(data)
      const { pointsEarned }: { pointsEarned: number } = res.data
    setState(prev => ({
      ...prev,
      points: prev.points + pointsEarned,
      attendedClasses: prev.attendedClasses + 1,
      totalClasses: prev.totalClasses + 1,
    }))
    return { pointsEarned }
  }, [set])

  const redeemReward = useCallback(async (rewardItemId: string): Promise<boolean> => {
    try {
      const res = await rewardsService.redeemReward(rewardItemId)
      const { qrVoucherCode, expiresAt, itemTitle, pointsSpent } = res.data
      setState(prev => ({
        ...prev,
        points: prev.points - pointsSpent,
        claimedReward: { qrVoucherCode, expiresAt, itemTitle },
      }))
      return true
    } catch {
      return false
    }
  }, [set])

  const bookLaptop = useCallback(async (data: { laptopId: string; duration: string; startTime: string }) => {
    const res = await rentalService.bookLaptop(data)
    const { bookingId, totalAmount, pickupQrCode, startTime, endTime } = res.data
    setState(prev => ({
      ...prev,
      rentals: [...prev.rentals, data.laptopId],
      bookingResult: { bookingId, totalAmount, pickupQrCode, startTime, endTime },
    }))
  }, [set])

  const verifyPayment = useCallback(async (data: { bookingId: string; razorpayPaymentId: string; razorpaySignature: string }) => {
    await rentalService.verifyPayment(data)
  }, [])

  const addConnection = useCallback(async (receiverId: string) => {
    try {
      await teammateService.sendConnection(receiverId)
      setState(prev => ({
        ...prev,
        connections: [...prev.connections, receiverId],
        chatMessages: {
          ...prev.chatMessages,
          [receiverId]: [
            { id: 'sys1', sender: 'System', text: 'You matched! Say hello to your new teammate.', time: 'Just now' },
          ],
        },
      }))
    } catch { /* ignore */ }
  }, [set])

  const fetchChatHistory = useCallback(async (receiverId: string) => {
    try {
      const res = await teammateService.getChatHistory(receiverId)
      const messages: Message[] = res.data.map((m: { id: string; sender: { name: string }; message: string; timestamp: string }) => ({
        id: m.id,
        sender: m.sender.name,
        text: m.message,
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
      setState(prev => ({
        ...prev,
        chatMessages: { ...prev.chatMessages, [receiverId]: messages },
      }))
    } catch { /* ignore */ }
  }, [set])

  const sendMessage = useCallback((chatId: string, text: string) => {
    setState(prev => {
      const msgs = prev.chatMessages[chatId] || []
      const newMsg: Message = {
        id: `msg${Date.now()}`,
        sender: 'You',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      return {
        ...prev,
        chatMessages: { ...prev.chatMessages, [chatId]: [...msgs, newMsg] },
      }
    })
  }, [])

  const toggleDarkMode = useCallback(() => {
    setState(prev => {
      const dark = !prev.darkMode
      document.documentElement.classList.toggle('dark', dark)
      return { ...prev, darkMode: dark }
    })
  }, [])

  const addSkill = useCallback((skill: string) => {
    setState(prev => ({ ...prev, userSkills: [...prev.userSkills, skill] }))
  }, [])

  const removeSkill = useCallback((skill: string) => {
    setState(prev => ({ ...prev, userSkills: prev.userSkills.filter(s => s !== skill) }))
  }, [])

  const setActiveChat = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeChat: id }))
  }, [])

  const removeConnection = useCallback((id: string) => {
    setState(prev => ({ ...prev, connections: prev.connections.filter(c => c !== id) }))
  }, [])

  const clearNotification = useCallback(() => {
    setState(prev => ({ ...prev, notifications: 0 }))
  }, [])

  const clearClaimedReward = useCallback(() => {
    setState(prev => ({ ...prev, claimedReward: null }))
  }, [])

  const clearBookingResult = useCallback(() => {
    setState(prev => ({ ...prev, bookingResult: null }))
  }, [])

  const updateProfile = useCallback(async (data: { name?: string; department?: string; year?: number; phoneNumber?: string; skills?: string[]; interests?: string[] }) => {
    const res = await authService.updateProfile(data)
    const user = res.data
    set({
      userName: user.name,
      userPhone: user.phoneNumber || '',
      userBranch: user.department,
      userYear: `${user.year}`,
      userSkills: user.skills || [],
    })
  }, [set])

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    await authService.updateAvatar(avatarUrl)
    set({ userAvatar: avatarUrl })
  }, [set])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authService.changePassword(currentPassword, newPassword)
  }, [])

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchProfile()
      fetchAttendanceHistory()
      fetchRewards()
      fetchLaptops()
      fetchMatches()
    }
  }, [state.isAuthenticated, fetchProfile, fetchAttendanceHistory, fetchRewards, fetchLaptops, fetchMatches])

  return (
    <AppContext.Provider value={{
      state,
      login, register, logout,
      fetchProfile, fetchRewards, fetchLaptops, fetchMatches, fetchAttendanceHistory,
      markAttendance, redeemReward, bookLaptop, verifyPayment,
      addConnection, fetchChatHistory, sendMessage, setActiveChat, removeConnection,
      toggleDarkMode, addSkill, removeSkill, clearNotification,
      clearClaimedReward, clearBookingResult, updateProfile, updateAvatar, changePassword,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
